import React from 'react';
import { Paper, Typography, Grid, Box, Button } from '@mui/material';
import { MachineRentalWithMachineRented } from '../utils/types';
import dayjs from 'dayjs';

interface ClientInfoStepProps {
  rental: MachineRentalWithMachineRented;
  onNextStep: () => void;
}

const ClientInfoStep = ({
  rental,
  onNextStep,
}: ClientInfoStepProps): JSX.Element => {
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Informations client
      </Typography>

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
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Adresse</Typography>
          <Typography variant="body1" gutterBottom>
            {rental.clientAddress}
            <br />
            {rental.clientPostal} {rental.clientCity}
          </Typography>

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
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button variant="contained" color="primary" onClick={onNextStep}>
          Continuer
        </Button>
      </Box>
    </Paper>
  );
};

export default ClientInfoStep;
