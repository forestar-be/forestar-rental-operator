import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  Box,
  Button,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  TextField,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';

interface SignatureCaptureProps {
  onSave: (signatureDataUrl: string) => void;
  onFinalize?: () => void;
  setSignatureLocation?: (location: string) => void;
  width?: number | string;
  height?: number | string;
  signatureDataUrl?: string | null;
  signatureLocation: string | null;
}

const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSave,
  onFinalize,
  setSignatureLocation,
  width = 400,
  height = 200,
  signatureDataUrl,
  signatureLocation,
}) => {
  const signatureCanvasRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(!signatureDataUrl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Effet pour restaurer la signature si signatureDataUrl est défini
  useEffect(() => {
    if (signatureCanvasRef.current && signatureDataUrl) {
      // Efface d'abord le canvas
      signatureCanvasRef.current.clear();

      // Crée une image temporaire pour charger la signature
      const img = new Image();
      img.onload = () => {
        const ctx = signatureCanvasRef.current?.getCanvas().getContext('2d');
        if (ctx) {
          // Dessine l'image sur le canvas
          ctx.drawImage(img, 0, 0);
          setIsEmpty(false);
        }
      };
      img.src = signatureDataUrl;
    } else if (signatureCanvasRef.current && !signatureDataUrl) {
      signatureCanvasRef.current.clear();
      setIsEmpty(true);
    }
  }, [signatureDataUrl]);

  const handleClear = () => {
    if (signatureCanvasRef.current) {
      signatureCanvasRef.current.clear();
      setIsEmpty(true);
      onSave('');
    }
  };

  const handleSave = () => {
    if (signatureCanvasRef.current && !isEmpty) {
      const signatureDataUrl = signatureCanvasRef.current.toDataURL();
      onSave(signatureDataUrl);
    }
  };

  const handleBeginStroke = () => {
    setIsEmpty(false);
  };

  const handleEndStroke = () => {
    if (signatureCanvasRef.current && !isEmpty) {
      const signatureDataUrl = signatureCanvasRef.current.toDataURL();
      onSave(signatureDataUrl);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    if (setSignatureLocation) {
      setSignatureLocation(newLocation);
    }
  };

  const handleFinalize = () => {
    const isConfirmed = window.confirm(
      'Êtes-vous sûr de vouloir valider la signature et finaliser le contrat ? Cette action est définitive et vous ne pourrez plus revenir en arrière.',
    );

    if (isConfirmed && onFinalize) {
      onFinalize();
    }
  };

  // Style de CSS pour s'assurer que le canvas est correctement affiché
  const canvasStyles = {
    // width: '100%',
    // height: '100%',
    touchAction: 'none', // Important pour les appareils tactiles
    cursor: 'crosshair',
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Lieu de signature
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Veuillez indiquer le lieu où le contrat sera signé.
      </Typography>

      <Box sx={{ mb: 2, mt: 1 }}>
        <TextField
          label="Fait à"
          variant="outlined"
          fullWidth
          size="small"
          value={signatureLocation}
          onChange={handleLocationChange}
          placeholder="Ville où le contrat est signé"
          sx={{ mb: 2 }}
        />
      </Box>
      <Typography variant="subtitle1" gutterBottom>
        Signature du client
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Veuillez signer dans le cadre ci-dessous.
      </Typography>

      <Box
        sx={{
          width: '100%',
          height: height,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <Box
          sx={{
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: 1,
            backgroundColor: '#f8f8f8',
            width: width,
            height: height,
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <SignatureCanvas
            ref={signatureCanvasRef}
            canvasProps={{
              width: typeof width === 'number' ? width : 600,
              height: typeof height === 'number' ? height : 200,
              className: 'signature-canvas',
              style: canvasStyles,
            }}
            onBegin={handleBeginStroke}
            onEnd={handleEndStroke}
            penColor="black"
            // velocityFilterWeight={0.7}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'center' : 'space-between',
          gap: 2,
          width: '100%',
          mt: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClear}
          sx={{
            height: isMobile ? '48px' : 'auto',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          Effacer
        </Button>
        {onFinalize && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleFinalize}
            disabled={!signatureDataUrl || !signatureLocation}
            sx={{
              height: isMobile ? '48px' : 'auto',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Valider la signature et finaliser le contrat
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default SignatureCapture;
