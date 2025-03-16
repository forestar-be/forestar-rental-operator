import React, { useRef } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';

interface PhotoCaptureStepProps {
  frontPhotoDataUrl: string | null;
  backPhotoDataUrl: string | null;
  loading: boolean;
  frontPhoto: File | null;
  backPhoto: File | null;
  onPrevStep: () => void;
  onNextStep: () => void;
  onPhotoTaken: (type: 'front' | 'back', file: File) => void;
  onGenerateTerms: () => void;
}

const PhotoCaptureStep = ({
  frontPhotoDataUrl,
  backPhotoDataUrl,
  loading,
  frontPhoto,
  backPhoto,
  onPrevStep,
  onNextStep,
  onPhotoTaken,
  onGenerateTerms,
}: PhotoCaptureStepProps): JSX.Element => {
  // Create refs for the hidden file inputs
  const frontPhotoInputRef = useRef<HTMLInputElement>(null);
  const backPhotoInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (
    type: 'front' | 'back',
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      onPhotoTaken(type, event.target.files[0]);
    }
  };

  // Trigger the file input click
  const triggerFileInput = (type: 'front' | 'back') => {
    if (type === 'front' && frontPhotoInputRef.current) {
      frontPhotoInputRef.current.click();
    } else if (type === 'back' && backPhotoInputRef.current) {
      backPhotoInputRef.current.click();
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
        capture
        ref={frontPhotoInputRef}
        onChange={(e) => handleFileChange('front', e)}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        accept="image/*"
        capture
        ref={backPhotoInputRef}
        onChange={(e) => handleFileChange('back', e)}
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
            Veuillez prendre les deux photos pour générer les conditions
            générales.
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
