import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PDFViewer } from '@react-pdf/renderer';
import TermsDocument from './TermsDocument';
import ArticleIcon from '@mui/icons-material/Article';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { MachineRentalWithMachineRented } from '../utils/types';

interface TermsGenerationStepProps {
  loading: boolean;
  rental: MachineRentalWithMachineRented | null;
  frontPhotoDataUrl: string | null;
  backPhotoDataUrl: string | null;
  signatureDataUrl: string | null;
  onPrevStep: () => void;
  onNextStep: () => void;
}

const TermsGenerationStep = ({
  loading,
  rental,
  frontPhotoDataUrl,
  backPhotoDataUrl,
  signatureDataUrl,
  onPrevStep,
  onNextStep,
}: TermsGenerationStepProps): JSX.Element => {
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
                <PDFViewer className="pdf-viewer">
                  <TermsDocument
                    rental={rental}
                    machine={rental?.machineRented || null}
                    frontIdCardImage={frontPhotoDataUrl || undefined}
                    backIdCardImage={backPhotoDataUrl || undefined}
                    signatureDataUrl={signatureDataUrl || undefined}
                  />
                </PDFViewer>
              </div>
            </Box>
            <Box mt={3} mb={3} display="flex" justifyContent="space-between">
              <Button onClick={onPrevStep} variant="outlined">
                Retour
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onNextStep}
                endIcon={<NavigateNextIcon />}
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
