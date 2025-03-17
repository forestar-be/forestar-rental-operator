import React, { useEffect, useState, useMemo } from 'react';
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
  GlobalStyles,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import ConstructionIcon from '@mui/icons-material/Construction';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { alpha } from '@mui/material/styles';
import {
  getMachineRentalList,
  getMachineRentalLoading,
} from '../store/selectors/machineRentalSelectors';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { StyledAgGridWrapper } from '../components/styles/AgGridStyles';
import { AG_GRID_LOCALE_FR } from '@ag-grid-community/locale';
import SortIcon from '@mui/icons-material/Sort';

// Extend Day.js with plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// Set dayjs locale globally
dayjs.locale('fr');

// Type definition for cell renderer params
interface RentalCellRendererParams extends ICellRendererParams {
  data: MachineRentalWithMachineRented;
}

const Home = (): JSX.Element => {
  const auth = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Grid API reference
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [signedFilter, setSignedFilter] = useState<
    'all' | 'signed' | 'unsigned'
  >('all');

  // Add sort state
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt', // Default sort by creation date
    direction: 'desc' as 'asc' | 'desc', // Default sort direction
  });

  const loading = useAppSelector(getMachineRentalLoading);
  const rentals: MachineRentalWithMachineRented[] =
    useAppSelector(getMachineRentalList);

  const filteredRentals = rentals
    .filter((rental) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        rental.clientFirstName.toLowerCase().includes(searchLower) ||
        rental.clientLastName.toLowerCase().includes(searchLower) ||
        rental.clientEmail.toLowerCase().includes(searchLower) ||
        rental.clientPhone.toLowerCase().includes(searchLower) ||
        rental.machineRented.name.toLowerCase().includes(searchLower);

      // Apply the signed filter
      if (signedFilter === 'all') {
        return matchesSearch;
      } else if (signedFilter === 'signed') {
        return matchesSearch && !!rental.finalTermsPdfId;
      } else {
        return matchesSearch && !rental.finalTermsPdfId;
      }
    })
    .sort((a, b) => {
      // Apply the selected sort configuration
      const { key, direction } = sortConfig;
      let comparison = 0;

      switch (key) {
        case 'machineName':
          comparison = (a.machineRented.name || '').localeCompare(
            b.machineRented.name || '',
          );
          break;
        case 'clientName':
          const clientA = `${a.clientFirstName} ${a.clientLastName}`;
          const clientB = `${b.clientFirstName} ${b.clientLastName}`;
          comparison = clientA.localeCompare(clientB);
          break;
        case 'rentalDate':
          if (!a.rentalDate) return 1;
          if (!b.rentalDate) return -1;
          comparison =
            new Date(a.rentalDate).getTime() - new Date(b.rentalDate).getTime();
          break;
        case 'returnDate':
          if (!a.returnDate) return 1;
          if (!b.returnDate) return -1;
          comparison =
            new Date(a.returnDate).getTime() - new Date(b.returnDate).getTime();
          break;
        case 'createdAt':
        default:
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      // Apply sort direction
      return direction === 'asc' ? comparison : -comparison;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRentals = filteredRentals.slice(startIndex, endIndex);

  // AG Grid column definitions
  const columnDefs = useMemo<ColDef<MachineRentalWithMachineRented>[]>(
    () => [
      {
        headerName: 'Machine',
        sortable: true,
        filter: true,
        cellRenderer: (params: RentalCellRendererParams) => {
          if (!params.data) return null;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ConstructionIcon sx={{ mr: 1, color: 'text.secondary' }} />
              {params.data.machineRented.name}
            </Box>
          );
        },
      },
      {
        headerName: 'Créé le',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (!params.value || !params.data) return 'N/A';
          return params.data.createdAt
            ? dayjs(params.data.createdAt).format('L LT')
            : 'N/A';
        },
        valueGetter: (
          params: ValueGetterParams<MachineRentalWithMachineRented>,
        ) => {
          if (!params.data) return null;
          return params.data.createdAt;
        },
        sort: 'desc', // Set default sort to descending (newest first)
      },
      {
        headerName: 'Début',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (!params.value || !params.data) return 'N/A';
          return params.data.rentalDate
            ? dayjs(params.data.rentalDate).format('L')
            : 'N/A';
        },
        valueGetter: (
          params: ValueGetterParams<MachineRentalWithMachineRented>,
        ) => {
          if (!params.data) return null;
          return params.data.rentalDate;
        },
      },
      {
        headerName: 'Retour',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (!params.value || !params.data) return 'N/A';
          return params.data.returnDate
            ? dayjs(params.data.returnDate).format('L')
            : 'N/A';
        },
        valueGetter: (
          params: ValueGetterParams<MachineRentalWithMachineRented>,
        ) => {
          if (!params.data) return null;
          return params.data.returnDate;
        },
      },
      {
        headerName: 'Client',
        sortable: true,
        filter: true,
        valueGetter: (
          params: ValueGetterParams<MachineRentalWithMachineRented>,
        ) => {
          if (!params.data) return '';
          return `${params.data.clientFirstName} ${params.data.clientLastName}`;
        },
      },
      {
        headerName: 'Contact',
        sortable: true,
        filter: true,
        valueGetter: (
          params: ValueGetterParams<MachineRentalWithMachineRented>,
        ) => {
          if (!params.data) return '';
          return params.data.clientPhone;
        },
      },
      {
        headerName: 'Statut',
        sortable: true,
        filter: true,
        cellRenderer: (params: RentalCellRendererParams) => {
          if (!params.data) return null;
          return params.data.finalTermsPdfId ? (
            <Chip label="Signé" color="success" size="small" />
          ) : (
            <Chip label="Non signé" color="default" size="small" />
          );
        },
      },
      {
        headerName: 'Actions',
        sortable: false,
        filter: false,
        cellRenderer: (params: RentalCellRendererParams) => {
          if (!params.data) return null;
          return (
            <Button
              variant="contained"
              size="small"
              onClick={() => handleRentalSelect(params.data)}
            >
              Gérer
            </Button>
          );
        },
      },
    ],
    [],
  );

  // AG Grid default column definitions
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      resizable: true,
    }),
    [],
  );

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

  // Reset to page 1 when search term or signed filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, signedFilter]);

  // Handle sort change
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const [key, direction] = value.split('-');
    setSortConfig({ key, direction: direction as 'asc' | 'desc' });
  };

  // Handle signed filter change
  const handleSignedFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: 'all' | 'signed' | 'unsigned' | null,
  ) => {
    if (newValue !== null) {
      setSignedFilter(newValue);
    }
  };

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

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Créé le:{' '}
              {rental.createdAt
                ? dayjs(rental.createdAt).format('L LT')
                : 'N/A'}
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
      <Box sx={{ mb: isMobile ? 1 : 2 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          component="h1"
          gutterBottom
        >
          Gestion des Locations
        </Typography>
        {!isMobile && (
          <Typography
            variant={'body2'}
            color="text.secondary"
            gutterBottom={!isMobile}
          >
            Sélectionnez une location pour générer et faire signer les
            conditions générales.
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            mt: isMobile ? 1 : 2,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par client ou machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size={'small'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Add sort dropdown for mobile/tablet view */}
            {(isMobile || isTablet) && (
              <FormControl
                sx={{ minWidth: isMobile ? 115 : 150, flexShrink: 0 }}
                size={isMobile || isTablet ? 'small' : 'medium'}
              >
                <Select
                  value={`${sortConfig.key}-${sortConfig.direction}`}
                  onChange={handleSortChange}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="createdAt-desc">Plus récent</MenuItem>
                  <MenuItem value="createdAt-asc">Plus ancien</MenuItem>
                  <MenuItem value="machineName-asc">Machine ↑</MenuItem>
                  <MenuItem value="machineName-desc">Machine ↓</MenuItem>
                  <MenuItem value="clientName-asc">Client ↑</MenuItem>
                  <MenuItem value="clientName-desc">Client ↓</MenuItem>
                  <MenuItem value="rentalDate-asc">Date début ↑</MenuItem>
                  <MenuItem value="rentalDate-desc">Date début ↓</MenuItem>
                  <MenuItem value="returnDate-asc">Date retour ↑</MenuItem>
                  <MenuItem value="returnDate-desc">Date retour ↓</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>

          {/* Add signed filter toggle buttons */}
          <ToggleButtonGroup
            value={signedFilter}
            exclusive
            onChange={handleSignedFilterChange}
            aria-label="Filtre de signature"
            size={'small'}
            sx={{
              alignSelf: 'flex-start',
              '.MuiToggleButtonGroup-grouped': {
                border: 1,
                borderColor: 'divider',
                '&.Mui-selected': {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.1),
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.15),
                  },
                },
              },
            }}
          >
            <ToggleButton value="all">Toutes</ToggleButton>
            <ToggleButton value="signed">
              <CheckCircleOutlineIcon sx={{ mr: 0.5 }} fontSize="small" />
              Signées
            </ToggleButton>
            <ToggleButton value="unsigned">Non signées</ToggleButton>
          </ToggleButtonGroup>
        </Box>
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
            // Desktop view - AG Grid table
            <Paper
              sx={{
                width: '100%',
                height: '500px', // Fixed height instead of calc
                minHeight: '400px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                p: 0, // Remove padding
              }}
            >
              <StyledAgGridWrapper
                className={`ag-theme-quartz${theme.palette.mode === 'dark' ? '-dark' : ''}`}
                style={{
                  height: '100%',
                  width: '100%',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {paginatedRentals.length > 0 ? (
                  <>
                    <AgGridReact
                      rowData={paginatedRentals}
                      columnDefs={columnDefs}
                      defaultColDef={defaultColDef}
                      animateRows={true}
                      rowHeight={52}
                      headerHeight={48}
                      domLayout="normal"
                      localeText={AG_GRID_LOCALE_FR}
                      suppressPaginationPanel={true}
                      enableCellTextSelection={true}
                      onGridReady={(params: GridReadyEvent) => {
                        try {
                          setGridApi(params.api);

                          // Resize columns to fit the available width
                          if (params.api) {
                            params.api.sizeColumnsToFit();

                            // Handle window resize events
                            const handleResize = () => {
                              setTimeout(() => {
                                params.api.sizeColumnsToFit();
                              }, 100);
                            };

                            window.addEventListener('resize', handleResize);

                            // Clean up the event listener on component unmount
                            return () => {
                              window.removeEventListener(
                                'resize',
                                handleResize,
                              );
                            };
                          }
                        } catch (error) {
                          console.error(
                            'Error during grid initialization:',
                            error,
                          );
                        }
                      }}
                    />
                  </>
                ) : (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Typography variant="body1">
                      Aucune location trouvée.
                    </Typography>
                  </Box>
                )}
              </StyledAgGridWrapper>
            </Paper>
          )}

          {/* Pagination controls */}
          {filteredRentals.length > 0 && renderPaginationControls()}
        </>
      )}
    </Container>
  );
};

export default Home;
