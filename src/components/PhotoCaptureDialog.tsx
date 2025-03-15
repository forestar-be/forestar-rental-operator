import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

interface PhotoCaptureDialogProps {
  open: boolean;
  photoType: 'front' | 'back';
  onClose: () => void;
  onPhotoTaken: (file: File) => void;
}

const PhotoCaptureDialog = ({
  open,
  photoType,
  onClose,
  onPhotoTaken,
}: PhotoCaptureDialogProps): JSX.Element => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dragActive, setDragActive] = useState(false);
  const photoRef = useRef<HTMLCanvasElement | null>(null);
  const dropAreaRef = useRef<HTMLDivElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onPhotoTaken(e.dataTransfer.files[0]);
      onClose();
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onPhotoTaken(file);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Prendre une photo ({photoType === 'front' ? 'Recto' : 'Verso'})
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {isMobile ? (
            <>
              {/* Native camera input for mobile devices */}
              <Typography variant="body1" align="center">
                Utilisez l'appareil photo de votre téléphone pour prendre une
                photo
              </Typography>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
                id="camera-input"
              />
              <label htmlFor="camera-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                >
                  Prendre une photo
                </Button>
              </label>
            </>
          ) : (
            <>
              {/* Standard file input for laptops/desktops with drag-and-drop */}
              <Typography variant="body1" align="center">
                Sélectionnez une image depuis votre ordinateur
              </Typography>
              <Box
                ref={dropAreaRef}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                sx={{
                  width: '100%',
                  minHeight: '200px',
                  border: '2px dashed',
                  borderColor: dragActive ? 'primary.main' : 'grey.400',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 3,
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: dragActive
                    ? 'rgba(25, 118, 210, 0.05)'
                    : 'transparent',
                }}
              >
                <PhotoCameraIcon
                  sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }}
                />
                <Typography variant="body1" align="center" gutterBottom>
                  {dragActive
                    ? "Déposez l'image ici"
                    : 'Glissez-déposez une image ici'}
                </Typography>
                <Typography
                  variant="caption"
                  align="center"
                  color="textSecondary"
                  gutterBottom
                >
                  ou
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <Button
                    variant="contained"
                    component="span"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Parcourir
                  </Button>
                </label>
              </Box>
            </>
          )}
          {/* Keep the canvas for compatibility with existing code */}
          <canvas ref={photoRef} style={{ display: 'none' }} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoCaptureDialog;
