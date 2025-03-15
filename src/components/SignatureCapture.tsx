import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Box, Button, Paper, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';

interface SignatureCaptureProps {
  onSave: (signatureDataUrl: string) => void;
  onFinalize?: () => void;
  width?: number | string;
  height?: number | string;
  signatureDataUrl?: string | null;
}

const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSave,
  onFinalize,
  width = 400,
  height = 200,
  signatureDataUrl,
}) => {
  const signatureCanvasRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(!signatureDataUrl);

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
        Signature du client
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Veuillez signer dans le cadre ci-dessous:
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
        display="flex"
        justifyContent="space-between"
        sx={{ width: '100%', mt: 2 }}
      >
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClear}
        >
          Effacer
        </Button>
        {onFinalize && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleFinalize}
            disabled={!signatureDataUrl}
          >
            Valider la signature et finaliser le contrat
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default SignatureCapture;
