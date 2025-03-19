import { Box, Typography, Paper } from '@mui/material';
import { RentalTerm, RentalTermType } from '../utils/types';

interface RentalTermsPreviewProps {
  terms: RentalTerm[];
}

const RentalTermsPreview = ({ terms }: RentalTermsPreviewProps) => {
  const getTermComponent = (term: RentalTerm) => {
    const { content, type } = term;

    switch (type) {
      case RentalTermType.TITLE:
        return (
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{ whiteSpace: 'pre-wrap' }}
          >
            {content}
          </Typography>
        );
      case RentalTermType.SUBTITLE:
        return (
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            fontWeight="bold"
            mt={2}
            sx={{ whiteSpace: 'pre-wrap' }}
          >
            {content}
          </Typography>
        );
      case RentalTermType.SUBTITLE2:
        return (
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            fontWeight="bold"
            mt={1.5}
            sx={{ whiteSpace: 'pre-wrap' }}
          >
            {content}
          </Typography>
        );
      case RentalTermType.PARAGRAPH:
      default:
        return (
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
            {content}
          </Typography>
        );
    }
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 3, bgcolor: '#fcfcfc' }}>
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          {terms.length === 0 ? (
            <Typography color="text.secondary" align="center">
              Aucune condition générale à afficher
            </Typography>
          ) : (
            terms.map((term) => (
              <Box key={term.id}>{getTermComponent(term)}</Box>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RentalTermsPreview;
