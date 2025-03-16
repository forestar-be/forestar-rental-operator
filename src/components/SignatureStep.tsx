import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { MachineRentalWithMachineRented } from '../utils/types';
import SignatureCapture from './SignatureCapture';
import { Loading } from './Loading';

interface SignatureStepProps {
  loading: boolean;
  rental: MachineRentalWithMachineRented | null;
  signatureDataUrl: string | null;
  onSaveSignature: () => void;
  onSignatureSave: (dataUrl: string) => void;
  onPrevStep: () => void;
  setSignatureLocation: (location: string) => void;
  signatureLocation: string | null;
}

const SignatureStep = ({
  loading,
  rental,
  signatureDataUrl,
  onSaveSignature,
  onSignatureSave,
  onPrevStep,
  setSignatureLocation,
  signatureLocation,
}: SignatureStepProps): JSX.Element => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Signature du contrat {loading}
      </Typography>
      {loading ? (
        <Loading />
      ) : !rental ? (
        <Typography>Chargement des données...</Typography>
      ) : (
        <Box>
          <SignatureCapture
            onSave={onSignatureSave}
            onFinalize={onSaveSignature}
            setSignatureLocation={setSignatureLocation}
            signatureLocation={signatureLocation}
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
