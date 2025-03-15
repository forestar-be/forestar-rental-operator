import React from 'react';
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
  onOpenPhotoDialog: (type: 'front' | 'back') => void;
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
  onOpenPhotoDialog,
  onGenerateTerms,
}: PhotoCaptureStepProps): JSX.Element => {
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Photos pièce d'identité
      </Typography>

      <Typography variant="body1" paragraph>
        Prenez en photo le recto et le verso de la pièce d'identité du client
        pour générer les conditions générales.
      </Typography>

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
                    onClick={() => onOpenPhotoDialog('front')}
                  >
                    Prendre photo
                  </Button>
                </Box>
              )}
              {frontPhotoDataUrl && (
                <Button
                  variant="text"
                  onClick={() => onOpenPhotoDialog('front')}
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
                    onClick={() => onOpenPhotoDialog('back')}
                  >
                    Prendre photo
                  </Button>
                </Box>
              )}
              {backPhotoDataUrl && (
                <Button
                  variant="text"
                  onClick={() => onOpenPhotoDialog('back')}
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
