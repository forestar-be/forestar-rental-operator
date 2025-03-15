import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { MachineRentalWithMachineRented } from '../utils/types';
import SignatureCapture from './SignatureCapture';

interface SignatureStepProps {
  loading: boolean;
  rental: MachineRentalWithMachineRented | null;
  signatureDataUrl: string | null;
  onSaveSignature: () => void;
  onSignatureSave: (dataUrl: string) => void;
  onPrevStep: () => void;
}

const SignatureStep = ({
  loading,
  rental,
  signatureDataUrl,
  onSaveSignature,
  onSignatureSave,
  onPrevStep,
}: SignatureStepProps): JSX.Element => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Signature du contrat
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : !rental ? (
        <Typography>Chargement des données...</Typography>
      ) : (
        <Box>
          <Box
            mb={2}
            p={2}
            bgcolor="info.light"
            color="info.contrastText"
            borderRadius={1}
          >
            <Typography variant="body1">
              👉 Veuillez signer dans le cadre ci-dessous en utilisant votre
              doigt (écran tactile) ou votre souris. La signature apparaîtra en
              noir et doit être bien visible pour être valide.
            </Typography>
          </Box>

          <SignatureCapture
            onSave={onSignatureSave}
            onFinalize={onSaveSignature}
            signatureDataUrl={signatureDataUrl}
          />
           <Box mt={3} mb={3} display="flex" justifyContent="space-between">
              <Button onClick={onPrevStep} variant="outlined">
                Retour
              </Button>

            </Box>
        </Box>
      )}
    </Box>
  );
};

export default SignatureStep;
