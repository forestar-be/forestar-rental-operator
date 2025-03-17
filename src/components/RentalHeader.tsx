import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MachineRentalWithMachineRented } from '../utils/types';

interface RentalHeaderProps {
  rental: MachineRentalWithMachineRented;
  activeStep: number;
  onBack: () => void;
}

const steps = [
  'Informations client',
  'Photos',
  'Conditions générales',
  'Signature',
  'Finalisation',
];

const RentalHeader = ({
  rental,
  activeStep,
  onBack,
}: RentalHeaderProps): JSX.Element => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <Box mb={3} display="flex" alignItems="start" flexDirection="column">
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mr: 2 }}>
          Retour à la liste des locations
        </Button>
        <Typography variant="h5" component="h1">
          Location #{rental.id} - {rental.machineRented.name}
        </Typography>
      </Box>

      <Stepper
        activeStep={activeStep}
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{ mb: 4 }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </>
  );
};

export default RentalHeader;
