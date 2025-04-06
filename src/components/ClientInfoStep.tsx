import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  Slider,
  Divider,
} from '@mui/material';
import { MachineRentalWithMachineRented } from '../utils/types';
import dayjs from 'dayjs';
import { formatPriceNumberToFrenchFormatStr } from '../utils/common.utils';

interface ClientInfoStepProps {
  rental: MachineRentalWithMachineRented;
  onNextStep: () => void;
  onUpdateRental: (data: {
    depositToPay?: boolean;
    operatingHours?: number;
    fuelLevel?: number;
  }) => Promise<void>;
}

const ClientInfoStep = ({
  rental,
  onNextStep,
  onUpdateRental,
}: ClientInfoStepProps): JSX.Element => {
  const [depositToPay, setDepositToPay] = useState<boolean>(
    rental.depositToPay || false,
  );
  const [operatingHours, setOperatingHours] = useState<number | string>(
    rental.machineRented.operatingHours || '',
  );
  const [fuelLevel, setFuelLevel] = useState<number>(
    rental.machineRented.fuelLevel || 0,
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await onUpdateRental({
        depositToPay,
        operatingHours:
          operatingHours !== '' ? Number(operatingHours) : undefined,
        fuelLevel,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      await onUpdateRental({
        depositToPay,
        operatingHours:
          operatingHours !== '' ? Number(operatingHours) : undefined,
        fuelLevel,
      });
      onNextStep();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Nom complet</Typography>
          <Typography variant="body1" gutterBottom>
            {rental.clientFirstName} {rental.clientLastName}
          </Typography>

          <Typography variant="subtitle2">Téléphone</Typography>
          <Typography variant="body1" gutterBottom>
            {rental.clientPhone}
          </Typography>

          <Typography variant="subtitle2">Email</Typography>
          <Typography variant="body1" gutterBottom>
            {rental.clientEmail}
          </Typography>
          <Typography variant="subtitle2">Adresse</Typography>
          <Typography variant="body1" gutterBottom>
            {rental.clientAddress}
            <br />
            {rental.clientPostal} {rental.clientCity}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Machine louée</Typography>
          <Typography variant="body1" gutterBottom>
            {rental.machineRented.name}
          </Typography>

          <Typography variant="subtitle2">Période de location</Typography>
          <Typography variant="body1" gutterBottom>
            {rental.rentalDate ? dayjs(rental.rentalDate).format('LL') : 'N/A'}
            {' → '}
            {rental.returnDate ? dayjs(rental.returnDate).format('LL') : 'N/A'}
          </Typography>
          <Typography variant="subtitle2">Prix total</Typography>
          <Typography variant="body1" gutterBottom>
            {rental.totalPrice
              ? formatPriceNumberToFrenchFormatStr(rental.totalPrice)
              : 'Non spécifié'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        État de la machine
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!depositToPay}
                onChange={(e) => setDepositToPay(!e.target.checked)}
              />
            }
            label="Caution payée par le client"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Heures de fonctionnement
          </Typography>
          <TextField
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            variant="outlined"
            type="number"
            inputProps={{ min: 0, step: 0.1 }}
            fullWidth
            placeholder="0"
            size="small"
          />
          {rental.machineRented.lastMeasurementUpdate && (
            <Typography variant="caption" color="text.secondary">
              Dernière mise à jour:{' '}
              {dayjs(rental.machineRented.lastMeasurementUpdate).format(
                'DD/MM/YYYY HH:mm',
              )}
              {rental.machineRented.lastMeasurementUser &&
                ` par ${rental.machineRented.lastMeasurementUser}`}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Niveau de carburant ({fuelLevel}%)
          </Typography>
          <Slider
            value={fuelLevel}
            onChange={(_, value) => setFuelLevel(value as number)}
            aria-labelledby="fuel-level-slider"
            step={5}
            marks
            min={0}
            max={100}
          />
          {rental.machineRented.lastMeasurementUpdate && (
            <Typography variant="caption" color="text.secondary">
              Dernière mise à jour:{' '}
              {dayjs(rental.machineRented.lastMeasurementUpdate).format(
                'DD/MM/YYYY HH:mm',
              )}
              {rental.machineRented.lastMeasurementUser &&
                ` par ${rental.machineRented.lastMeasurementUser}`}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSaveChanges}
            disabled={isSaving}
            sx={{ mr: 2 }}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleContinue}
          disabled={isSaving}
        >
          Continuer
        </Button>
      </Box>
    </Paper>
  );
};

export default ClientInfoStep;
