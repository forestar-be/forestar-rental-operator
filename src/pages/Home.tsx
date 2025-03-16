import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMachineRental } from '../store/slices/machineRentalSlice';
import { MachineRentalWithMachineRented } from '../utils/types';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import ConstructionIcon from '@mui/icons-material/Construction';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { alpha } from '@mui/material/styles';
import {
  getMachineRentalList,
  getMachineRentalLoading,
} from '../store/selectors/machineRentalSelectors';

// Extend Day.js with plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// Set dayjs locale globally
dayjs.locale('fr');

const Home = (): JSX.Element => {
  const auth = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loading = useAppSelector(getMachineRentalLoading);
  const rentals: MachineRentalWithMachineRented[] =
    useAppSelector(getMachineRentalList);

  const filteredRentals = rentals.filter((rental) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      rental.clientFirstName.toLowerCase().includes(searchLower) ||
      rental.clientLastName.toLowerCase().includes(searchLower) ||
      rental.clientEmail.toLowerCase().includes(searchLower) ||
      rental.clientPhone.toLowerCase().includes(searchLower) ||
      rental.machineRented.name.toLowerCase().includes(searchLower)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRentals = filteredRentals.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
    // Scroll to top when changing page
    window.scrollTo(0, 0);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    setItemsPerPage(event.target.value as number);
    setPage(1); // Reset to first page when changing items per page
  };

  const handleRentalSelect = (rental: MachineRentalWithMachineRented) => {
    navigate(`/rental/${rental.id}`);
  };

  // Reset to page 1 when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Render rental card for mobile/tablet view
  const renderRentalCard = (rental: MachineRentalWithMachineRented) => {
    return (
      <Card
        key={rental.id}
        sx={{
          mb: 2,
          position: 'relative',
          border: rental.finalTermsPdfId
            ? `1px solid ${theme.palette.success.main}`
            : 'none',
        }}
      >
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {rental.machineRented.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body1">
              {rental.clientFirstName} {rental.clientLastName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {rental.rentalDate ? dayjs(rental.rentalDate).format('L') : 'N/A'}
              {' → '}
              {rental.returnDate ? dayjs(rental.returnDate).format('L') : 'N/A'}
            </Typography>
          </Box>

          {rental.finalTermsPdfId && (
            <Chip
              label="Signé"
              color="success"
              size="small"
              sx={{ position: 'absolute', top: 10, right: 10 }}
            />
          )}
        </CardContent>
        <CardActions>
          <Button
            size="small"
            variant="contained"
            onClick={() => handleRentalSelect(rental)}
          >
            Gérer
          </Button>
        </CardActions>
      </Card>
    );
  };

  // Render pagination controls
  const renderPaginationControls = () => {
    return (
      <Box
        sx={{
          mt: 3,
          pb: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={isMobile ? 1 : 2}
          alignItems="center"
          flexWrap="nowrap"
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          <Typography variant="body2">Résultats par page:</Typography>
          <FormControl size="small">
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              displayEmpty
              sx={{ minWidth: 80 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
          size={'medium'}
          sx={{ flexShrink: 0, flexWrap: 'nowrap' }}
        />
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: isMobile ? 2 : 4 }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          gutterBottom
        >
          Gestion des Locations
        </Typography>
        <Typography
          variant={isMobile ? 'body2' : 'body1'}
          color="text.secondary"
          gutterBottom={!isMobile}
        >
          Sélectionnez une location pour générer et faire signer les conditions
          générales.
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par client ou machine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mt: isMobile ? 1 : 2 }}
          size={isMobile ? 'small' : 'medium'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isMobile || isTablet ? (
            // Mobile and Tablet view - cards
            <Grid container spacing={1}>
              {paginatedRentals.length > 0 ? (
                paginatedRentals.map((rental) => (
                  <Grid item xs={12} sm={6} key={rental.id}>
                    {renderRentalCard(rental)}
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body1" align="center" sx={{ my: 4 }}>
                    Aucune location trouvée.
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            // Desktop view - table
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Machine</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Date de location</TableCell>
                    <TableCell>Date de retour</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRentals.length > 0 ? (
                    paginatedRentals.map((rental) => (
                      <TableRow
                        key={rental.id}
                        sx={{
                          backgroundColor: rental.finalTermsPdfId
                            ? alpha(theme.palette.success.light, 0.1)
                            : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ConstructionIcon
                              sx={{ mr: 1, color: 'text.secondary' }}
                            />
                            {rental.machineRented.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {rental.clientFirstName} {rental.clientLastName}
                        </TableCell>
                        <TableCell>{rental.clientPhone}</TableCell>
                        <TableCell>
                          {rental.rentalDate
                            ? dayjs(rental.rentalDate).format('L')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {rental.returnDate
                            ? dayjs(rental.returnDate).format('L')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {rental.finalTermsPdfId ? (
                            <Chip label="Signé" color="success" size="small" />
                          ) : (
                            <Chip
                              label="Non signé"
                              color="default"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleRentalSelect(rental)}
                          >
                            Gérer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Aucune location trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination controls */}
          {filteredRentals.length > 0 && renderPaginationControls()}
        </>
      )}
    </Container>
  );
};

export default Home;
