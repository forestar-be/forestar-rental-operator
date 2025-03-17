import React, { useRef, useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  Stack,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface PhotoCaptureStepProps {
  frontPhotoDataUrl: string | null;
  backPhotoDataUrl: string | null;
  machinePhotoDataUrls: string[];
  loading: boolean;
  frontPhoto: File | null;
  backPhoto: File | null;
  onPrevStep: () => void;
  onNextStep: () => void;
  onPhotoTaken: (type: 'front' | 'back', file: File) => void;
  onMachinePhotoTaken: (file: File) => void;
  onMachinePhotoRemove: (index: number) => void;
  onGenerateTerms: () => void;
}

const PhotoCaptureStep = ({
  frontPhotoDataUrl,
  backPhotoDataUrl,
  machinePhotoDataUrls,
  loading,
  frontPhoto,
  backPhoto,
  onPrevStep,
  onNextStep,
  onPhotoTaken,
  onMachinePhotoTaken,
  onMachinePhotoRemove,
  onGenerateTerms,
}: PhotoCaptureStepProps): JSX.Element => {
  // Create refs for the hidden file inputs
  const frontPhotoInputRef = useRef<HTMLInputElement>(null);
  const backPhotoInputRef = useRef<HTMLInputElement>(null);
  const machinePhotoInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (
    type: 'front' | 'back',
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      onPhotoTaken(type, event.target.files[0]);
    }
  };

  // Handle machine photo selection
  const handleMachinePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      onMachinePhotoTaken(event.target.files[0]);
      // Reset the input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  // Trigger the file input click
  const triggerFileInput = (type: 'front' | 'back' | 'machine') => {
    if (type === 'front' && frontPhotoInputRef.current) {
      frontPhotoInputRef.current.click();
    } else if (type === 'back' && backPhotoInputRef.current) {
      backPhotoInputRef.current.click();
    } else if (type === 'machine' && machinePhotoInputRef.current) {
      machinePhotoInputRef.current.click();
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Photos pièce d'identité
      </Typography>

      <Typography variant="body1" paragraph>
        Prenez en photo le recto et le verso de la pièce d'identité du client
        pour générer les conditions générales.
      </Typography>

      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={frontPhotoInputRef}
        onChange={(e) => handleFileChange('front', e)}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={backPhotoInputRef}
        onChange={(e) => handleFileChange('back', e)}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={machinePhotoInputRef}
        onChange={handleMachinePhotoChange}
        style={{ display: 'none' }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Recto
              </Typography>
              {frontPhotoDataUrl ? (
                <CardMedia
                  component="img"
                  image={frontPhotoDataUrl}
                  alt="Front ID"
                  sx={{ height: 200, objectFit: 'contain' }}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => triggerFileInput('front')}
                  >
                    Prendre photo
                  </Button>
                </Box>
              )}
              {frontPhotoDataUrl && (
                <Button
                  variant="text"
                  onClick={() => triggerFileInput('front')}
                  sx={{ mt: 1 }}
                >
                  Reprendre la photo
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Verso
              </Typography>
              {backPhotoDataUrl ? (
                <CardMedia
                  component="img"
                  image={backPhotoDataUrl}
                  alt="Back ID"
                  sx={{ height: 200, objectFit: 'contain' }}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => triggerFileInput('back')}
                  >
                    Prendre photo
                  </Button>
                </Box>
              )}
              {backPhotoDataUrl && (
                <Button
                  variant="text"
                  onClick={() => triggerFileInput('back')}
                  sx={{ mt: 1 }}
                >
                  Reprendre la photo
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Machine Photos Section */}
      <Box mt={4}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Photos de la machine (facultatif)
        </Typography>
        <Typography variant="body1" paragraph>
          Ajoutez des photos de l'état de la machine au moment de la location
          (10 photos maximum).
        </Typography>

        <Grid container spacing={2}>
          {machinePhotoDataUrls.map((photoUrl, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  image={photoUrl}
                  alt={`Machine photo ${index + 1}`}
                  sx={{ height: 120, objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    p: 1,
                  }}
                >
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => onMachinePhotoRemove(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}

          {machinePhotoDataUrls.length < 10 && (
            <Grid item xs={6} sm={4} md={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 2,
                  cursor: 'pointer',
                  border: '1px dashed',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => triggerFileInput('machine')}
              >
                <AddPhotoAlternateIcon
                  sx={{ fontSize: 40, color: 'primary.main' }}
                />
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Ajouter une photo
                </Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      <Box mt={3} display="flex" justifyContent="center">
        {frontPhoto && backPhoto ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<DescriptionIcon />}
            onClick={onGenerateTerms}
            disabled={loading}
          >
            {loading ? 'Génération...' : 'Générer les conditions générales'}
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Veuillez prendre les deux photos d'identité pour générer les
            conditions générales.
          </Typography>
        )}
      </Box>

      <Box mt={3} display="flex" justifyContent="space-between">
        <Button onClick={onPrevStep}>Retour</Button>
      </Box>
    </Paper>
  );
};

export default PhotoCaptureStep;
