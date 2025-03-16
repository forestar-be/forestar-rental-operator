import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PDFViewer } from '@react-pdf/renderer';
import TermsDocument from './TermsDocument';
import { MachineRentalWithMachineRented } from '../utils/types';
import EmailIcon from '@mui/icons-material/Email';
import DownloadIcon from '@mui/icons-material/Download';
import ListIcon from '@mui/icons-material/List';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import { getRentalAgreement } from '../utils/api';
import { notifyError } from '../utils/notifications';

interface FinalizationStepProps {
  rental: MachineRentalWithMachineRented;
  frontPhotoDataUrl: string | null;
  backPhotoDataUrl: string | null;
  signatureDataUrl: string | null;
  loading: boolean;
  onSendEmail: (email?: string) => void;
  onPrevStep: () => void;
  onBack: () => void;
  token: string;
}

const FinalizationStep = ({
  rental,
  frontPhotoDataUrl,
  backPhotoDataUrl,
  signatureDataUrl,
  loading,
  onSendEmail,
  onPrevStep,
  onBack,
  token,
}: FinalizationStepProps): JSX.Element => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState(rental.clientEmail || '');
  const [emailError, setEmailError] = useState('');
  const [loadingAgreement, setLoadingAgreement] = useState(false);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    return () => {
      if (fileURL) {
        URL.revokeObjectURL(fileURL);
        setFileURL(null);
      }
    };
  }, [fileURL]);

  // Fonction pour ouvrir le PDF dans un nouvel onglet
  const openTermsInNewTab = async () => {
    if (fileURL) {
      const pdfWindow = window.open();
      if (pdfWindow) {
        pdfWindow.location.href = fileURL;
      } else {
        notifyError("Impossible d'ouvrir le PDF dans un nouvel onglet");
      }
      return;
    }

    if (rental.id) {
      try {
        setLoadingAgreement(true);
        // Use the API endpoint to get the rental agreement
        const rentalAgreementBlob = await getRentalAgreement(
          rental.id.toString(),
          token,
        );
        const file = new Blob([rentalAgreementBlob], {
          type: 'application/pdf',
        });

        // Create URL and open in new tab
        const newFileURL = URL.createObjectURL(file);
        setFileURL(newFileURL);

        const pdfWindow = window.open();
        if (pdfWindow) {
          pdfWindow.location.href = newFileURL;
        } else {
          notifyError("Impossible d'ouvrir le PDF dans un nouvel onglet");
        }
      } catch (error) {
        console.error('Error fetching rental agreement:', error);
        notifyError('Erreur lors de la récupération du contrat de location');
      } finally {
        setLoadingAgreement(false);
      }
    }
  };

  // Valider l'email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Gérer le clic sur "Envoyer par email"
  const handleSendEmail = () => {
    if (!rental.clientEmail || !validateEmail(rental.clientEmail)) {
      setEmailDialogOpen(true);
    } else {
      onSendEmail();
    }
  };

  // Gérer la confirmation du dialogue d'email
  const handleConfirmEmail = () => {
    if (!email) {
      setEmailError("L'email est requis");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Format d'email invalide");
      return;
    }

    setEmailError('');
    setEmailDialogOpen(false);
    onSendEmail(email);
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Finalisation
      </Typography>

      <Alert
        severity="success"
        sx={{ mb: 3, p: 2 }}
        icon={<CheckCircleIcon fontSize="large" />}
      >
        <AlertTitle>Document signé !</AlertTitle>
        Les conditions générales ont été signées avec succès.
      </Alert>

      <Box
        mt={3}
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'center' : 'center',
          gap: 2,
          width: '100%',
        }}
      >
        {rental.finalTermsPdfId && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<DescriptionIcon />}
            onClick={openTermsInNewTab}
            disabled={loading || loadingAgreement}
            sx={{
              height: isMobile ? '48px' : 'auto',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {loadingAgreement
              ? 'Chargement...'
              : 'Afficher les conditions générales'}
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          startIcon={<EmailIcon />}
          onClick={handleSendEmail}
          disabled={!rental || loading}
          sx={{
            height: isMobile ? '48px' : 'auto',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          {loading ? 'Envoi...' : 'Envoyer par email'}
        </Button>
      </Box>

      <Box
        mt={3}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={onBack}
          startIcon={<ListIcon />}
          sx={{
            height: isMobile ? '48px' : 'auto',
            width: isMobile ? 'auto' : 'auto',
          }}
        >
          Retour à la liste
        </Button>
      </Box>

      {/* Dialogue pour saisir l'email */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
        <DialogTitle>Adresse email du client</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Veuillez saisir l'adresse email du client pour envoyer les
            conditions générales.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
          />
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: isMobile ? 'center' : 'flex-end',
            gap: isMobile ? 2 : 1,
            p: isMobile ? 2 : 1,
          }}
        >
          <Button
            onClick={() => setEmailDialogOpen(false)}
            sx={{
              width: isMobile ? '100%' : 'auto',
              height: isMobile ? '48px' : 'auto',
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmEmail}
            variant="contained"
            color="primary"
            sx={{
              width: isMobile ? '100%' : 'auto',
              height: isMobile ? '48px' : 'auto',
            }}
          >
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FinalizationStep;
