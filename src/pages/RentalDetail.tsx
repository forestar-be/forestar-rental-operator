import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';
import { Box, Container, Alert, CircularProgress, Button } from '@mui/material';
import { usePDF } from '@react-pdf/renderer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
// Add useful Day.js plugins
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import {
  fetchMachineRentalById,
  saveSignature,
  sendTermsEmail,
} from '../utils/api';
import { MachineRentalWithMachineRented } from '../utils/types';
import { toast } from 'react-toastify';
import './RentalDetail.css';
import { Document } from '@react-pdf/renderer';
import ClientInfoStep from '../components/ClientInfoStep';
import PhotoCaptureStep from '../components/PhotoCaptureStep';
import TermsGenerationStep from '../components/TermsGenerationStep';
import SignatureStep from '../components/SignatureStep';
import FinalizationStep from '../components/FinalizationStep';
import RentalHeader from '../components/RentalHeader';
import TermsDocument from '../components/TermsDocument';
window.Buffer = window.Buffer || require('buffer').Buffer;

// Extend Day.js with plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

// Set dayjs locale globally if not already set elsewhere
dayjs.locale('fr');

const getTermsDocument = (
  rental: MachineRentalWithMachineRented,
  frontPhotoDataUrl: string | null,
  backPhotoDataUrl: string | null,
  signatureDataUrl: string | null,
  signatureLocation: string | null,
) => {
  return (
    <TermsDocument
      rental={rental}
      machine={rental.machineRented}
      frontIdCardImage={frontPhotoDataUrl!}
      backIdCardImage={backPhotoDataUrl!}
      signatureDataUrl={signatureDataUrl!}
      signatureLocation={signatureLocation!}
    />
  );
};

const RentalDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingSendEmail, setLoadingSendEmail] = useState(false);
  const [rental, setRental] = useState<MachineRentalWithMachineRented | null>(
    null,
  );
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  const [frontPhotoDataUrl, setFrontPhotoDataUrl] = useState<string | null>(
    null,
  );
  const [backPhotoDataUrl, setBackPhotoDataUrl] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatureLocation, setSignatureLocation] = useState<string | null>(
    null,
  );

  // Use the usePDF hook at component level
  const [pdfInstance, updatePdfInstance] = usePDF({
    document: <Document />,
  });

  // Fetch rental data
  useEffect(() => {
    const getRental = async () => {
      if (!id || !auth.token) return;

      setLoading(true);
      try {
        const rentalData = await fetchMachineRentalById(id, auth.token);
        setRental(rentalData);

        // Set the active step based on the rental state
        if (rentalData.finalTermsPdfId) {
          setActiveStep(4); // Finalization step
        } else {
          setActiveStep(0); // Initial step (ID photos + terms combined now)
        }
      } catch (error) {
        console.error('Failed to fetch rental:', error);
        toast.error('Erreur lors du chargement de la location');
      } finally {
        setLoading(false);
      }
    };

    getRental();
  }, [id, auth.token]);

  const handleBack = () => {
    navigate('/');
  };

  const handleNextStep = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  const processImageFile = (file: File, photoType: 'front' | 'back') => {
    // Convert WebP to JPEG if needed
    if (file.type === 'image/webp') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        // Convert to JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const jpegFile = new File(
                [blob],
                file.name.replace('.webp', '.jpg'),
                {
                  type: 'image/jpeg',
                },
              );

              const reader = new FileReader();
              reader.onload = (e) => {
                if (e.target && e.target.result) {
                  if (photoType === 'front') {
                    setFrontPhoto(jpegFile);
                    setFrontPhotoDataUrl(e.target.result as string);
                  } else {
                    setBackPhoto(jpegFile);
                    setBackPhotoDataUrl(e.target.result as string);
                  }
                }
              };
              reader.readAsDataURL(jpegFile);
            }
          },
          'image/jpeg',
          0.9,
        );
      };

      img.src = URL.createObjectURL(file);
    } else {
      // Handle non-WebP files normally
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          if (photoType === 'front') {
            setFrontPhoto(file);
            setFrontPhotoDataUrl(e.target.result as string);
          } else {
            setBackPhoto(file);
            setBackPhotoDataUrl(e.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateTerms = async () => {
    if (!id || !auth.token || !frontPhoto || !backPhoto) {
      toast.error(
        "Les photos recto et verso de la pièce d'identité sont requises",
      );
      return;
    }
    handleNextStep();
  };

  const handleSaveSignature = async () => {
    if (!id || !auth.token || !signatureDataUrl) {
      toast.error('Veuillez signer le document');
      return;
    }

    if (!rental || !rental.machineRented) {
      toast.error('Données de location non disponibles');
      return;
    }

    setLoading(true);
    try {
      updatePdfInstance(
        getTermsDocument(
          rental!,
          frontPhotoDataUrl!,
          backPhotoDataUrl!,
          signatureDataUrl!,
          signatureLocation!,
        ),
      );
    } catch (error) {
      console.error('Failed to save signature:', error);
      toast.error("Erreur lors de l'enregistrement de la signature");
      setLoading(false);
    }
  };

  useEffect(() => {
    const generatePdf = async () => {
      if (activeStep === 3 && !pdfInstance.loading) {
        try {
          if (!pdfInstance.blob || pdfInstance.error) {
            toast.error('Impossible de générer le PDF');
            console.error('Error generating PDF:', pdfInstance.error);
            setLoading(false);
            return;
          }

          if (pdfInstance.blob.size < 1000) {
            return;
          }

          // Now we need to send the complete PDF with ID cards and signature to the backend
          const result = await saveSignature(id!, auth.token, pdfInstance.blob);

          // Reload rental data
          const updatedRental = await fetchMachineRentalById(id!, auth.token);
          setRental(updatedRental);

          toast.success('Signature enregistrée avec succès');
          handleNextStep();
        } catch (error) {
          console.error('Failed to save signature:', error);
          toast.error("Erreur lors de l'enregistrement de la signature");
        } finally {
          setLoading(false);
        }
      }
    };
    generatePdf();
  }, [
    pdfInstance.blob,
    pdfInstance.error,
    pdfInstance.loading,
    pdfInstance.url,
  ]);

  const handleSignatureSave = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
  };

  const handleSendEmail = async (email?: string) => {
    if (!id || !auth.token) return;

    setLoadingSendEmail(true);
    try {
      await sendTermsEmail(id, auth.token, email);

      // Reload rental data
      const updatedRental = await fetchMachineRentalById(id, auth.token);
      setRental(updatedRental);

      toast.success('Email envoyé avec succès');
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setLoadingSendEmail(false);
    }
  };

  if (loading && !rental) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!rental) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Location introuvable</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Container>
    );
  }

  // Render the appropriate step content based on activeStep
  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return <ClientInfoStep rental={rental} onNextStep={handleNextStep} />;
      case 1:
        return (
          <PhotoCaptureStep
            frontPhotoDataUrl={frontPhotoDataUrl}
            backPhotoDataUrl={backPhotoDataUrl}
            loading={loading}
            frontPhoto={frontPhoto}
            backPhoto={backPhoto}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onPhotoTaken={(type, file) => {
              // Process the captured photo directly
              processImageFile(file, type);
            }}
            onGenerateTerms={handleGenerateTerms}
          />
        );
      case 2:
        return (
          <TermsGenerationStep
            loading={loading}
            rental={rental}
            frontPhotoDataUrl={frontPhotoDataUrl}
            backPhotoDataUrl={backPhotoDataUrl}
            signatureDataUrl={signatureDataUrl}
            signatureLocation={signatureLocation}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
          />
        );
      case 3:
        return (
          <SignatureStep
            loading={loading}
            rental={rental}
            signatureDataUrl={signatureDataUrl}
            onSaveSignature={handleSaveSignature}
            onSignatureSave={handleSignatureSave}
            onPrevStep={handlePrevStep}
            setSignatureLocation={setSignatureLocation}
            signatureLocation={signatureLocation}
          />
        );
      case 4:
        return (
          <FinalizationStep
            rental={rental}
            frontPhotoDataUrl={frontPhotoDataUrl}
            backPhotoDataUrl={backPhotoDataUrl}
            signatureDataUrl={signatureDataUrl}
            loading={loadingSendEmail}
            onSendEmail={handleSendEmail}
            onPrevStep={handlePrevStep}
            onBack={handleBack}
            token={auth.token}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, pb: 8 }}>
      <RentalHeader
        rental={rental}
        activeStep={activeStep}
        onBack={handleBack}
      />
      {getStepContent()}
    </Container>
  );
};

export default RentalDetail;
