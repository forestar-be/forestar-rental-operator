import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import PDFtoIMG from './PDFtoIMG';
import { pdf } from '@react-pdf/renderer';
import TermsDocument from './TermsDocument';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { MachineRentalWithMachineRented, RentalTerm } from '../utils/types';

interface TermsGenerationStepProps {
  loading: boolean;
  rental: MachineRentalWithMachineRented | null;
  frontPhotoDataUrl: string | null;
  backPhotoDataUrl: string | null;
  machinePhotoDataUrls: string[];
  signatureDataUrl: string | null;
  onPrevStep: () => void;
  onNextStep: () => void;
  signatureLocation: string | null;
  terms: RentalTerm[];
}

const TermsGenerationStep = ({
  loading,
  rental,
  frontPhotoDataUrl,
  backPhotoDataUrl,
  machinePhotoDataUrls,
  signatureDataUrl,
  signatureLocation,
  onPrevStep,
  onNextStep,
  terms = [],
}: TermsGenerationStepProps): JSX.Element => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generatePdf = async () => {
      if (rental && frontPhotoDataUrl && backPhotoDataUrl) {
        try {
          const doc = (
            <TermsDocument
              rental={rental}
              machine={rental?.machineRented || null}
              frontIdCardImage={frontPhotoDataUrl || undefined}
              backIdCardImage={backPhotoDataUrl || undefined}
              machinePhotos={machinePhotoDataUrls}
              signatureDataUrl={signatureDataUrl || undefined}
              signatureLocation={signatureLocation || undefined}
              terms={terms}
            />
          );

          const pdfDoc = await pdf(doc).toBlob();
          setPdfBlob(pdfDoc);
          setError(null);
        } catch (err) {
          console.error('Error generating PDF:', err);
          setError('Failed to generate PDF document: ' + String(err));
        }
      }
    };

    generatePdf();
  }, [
    rental,
    frontPhotoDataUrl,
    backPhotoDataUrl,
    machinePhotoDataUrls,
    signatureDataUrl,
    terms,
  ]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Conditions Générales de Location
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : !rental ? (
        <Typography>Chargement des données...</Typography>
      ) : frontPhotoDataUrl && backPhotoDataUrl ? (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Veuillez vérifier le document avant de continuer
          </Alert>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              className="terms-document-wrapper"
            >
              <div className="terms-document-container">
                {pdfBlob ? (
                  <PDFtoIMG file={pdfBlob}>
                    {({
                      pages,
                      loading,
                    }: {
                      pages: string[];
                      loading: boolean;
                    }) => {
                      if (loading)
                        return (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              width: '100%',
                              my: 2,
                            }}
                          >
                            <CircularProgress />
                          </Box>
                        );

                      if (!pages.length) {
                        console.error('No pages rendered from PDF');
                        return (
                          <Alert severity="error">
                            Le document PDF n'a pas pu être rendu correctement.
                            Veuillez réessayer ou contacter le support
                            technique.
                          </Alert>
                        );
                      }

                      return pages.map((page: string, index: number) => {
                        if (!page || page === 'data:,') {
                          console.error(`Empty page at index ${index}`);
                          return (
                            <Alert
                              key={index}
                              severity="warning"
                              sx={{ mb: 2 }}
                            >
                              La page {index + 1} n'a pas pu être rendue
                            </Alert>
                          );
                        }

                        return (
                          <React.Fragment key={index}>
                            <img
                              src={page}
                              alt={`Page ${index + 1}`}
                              style={{ width: '100%', marginBottom: '10px' }}
                              onError={(e) => {
                                console.error(
                                  `Error loading image for page ${index + 1}`,
                                  e,
                                );
                                (e.target as HTMLImageElement).style.display =
                                  'none';
                              }}
                            />
                            {index < pages.length - 1 && (
                              <Divider sx={{ my: 2 }} />
                            )}
                          </React.Fragment>
                        );
                      });
                    }}
                  </PDFtoIMG>
                ) : (
                  <CircularProgress />
                )}
              </div>
            </Box>
            <Box
              mt={3}
              mb={3}
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: isMobile ? 'center' : 'space-between',
                gap: 2,
                width: '100%',
              }}
            >
              <Button
                onClick={onPrevStep}
                variant="outlined"
                sx={{
                  height: isMobile ? '48px' : 'auto',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                Retour
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onNextStep}
                endIcon={<NavigateNextIcon />}
                sx={{
                  height: isMobile ? '48px' : 'auto',
                  width: isMobile ? '100%' : 'auto',
                }}
                disabled={error !== null}
              >
                Continuer vers la signature
              </Button>
            </Box>
          </>
        </Box>
      ) : (
        <Alert severity="warning">
          Veuillez d'abord ajouter les photos de la pièce d'identité
        </Alert>
      )}
    </Box>
  );
};

export default TermsGenerationStep;
