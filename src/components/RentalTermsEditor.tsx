import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { RootState } from '../store';
import {
  fetchAllRentalTerms,
  createRentalTerm,
  modifyRentalTerm,
  removeRentalTerm,
  reorderTerms,
} from '../store/slices/rentalTermsSlice';
import { RentalTerm, RentalTermType } from '../utils/types';

interface FormData {
  content: string;
  type: RentalTermType;
}

const RentalTermsEditor = () => {
  const dispatch = useDispatch();
  const { terms, loading } = useSelector(
    (state: RootState) => state.rentalTerms,
  );
  const [token, setToken] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    content: '',
    type: RentalTermType.PARAGRAPH,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState<number | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      dispatch(fetchAllRentalTerms(storedToken) as any);
    }
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      content: '',
      type: RentalTermType.PARAGRAPH,
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const handleOpenDialog = (term?: RentalTerm) => {
    if (term) {
      setFormData({
        content: term.content,
        type: term.type as RentalTermType,
      });
      setEditMode(true);
      setCurrentId(term.id);
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleSubmit = () => {
    const { content, type } = formData;
    if (!content.trim()) return;

    if (editMode && currentId !== null) {
      dispatch(
        modifyRentalTerm({
          token,
          id: currentId,
          updates: { content, type },
        }) as any,
      );
    } else {
      const order =
        terms.length > 0 ? Math.max(...terms.map((t) => t.order)) + 1 : 0;
      dispatch(
        createRentalTerm({
          token,
          content,
          type,
          order,
        }) as any,
      );
    }

    handleCloseDialog();
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<RentalTermType>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleDeleteClick = (id: number) => {
    setTermToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (termToDelete !== null) {
      dispatch(removeRentalTerm({ token, id: termToDelete }) as any);
    }
    setDeleteDialogOpen(false);
    setTermToDelete(null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(terms);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const newOrderIds = items.map((item) => item.id);
    dispatch(reorderTerms({ token, termIds: newOrderIds }) as any);
  };

  const getTermStyle = (type: RentalTermType) => {
    switch (type) {
      case RentalTermType.TITLE:
        return { fontWeight: 'bold', fontSize: '1.5rem' };
      case RentalTermType.SUBTITLE:
        return { fontWeight: 'bold', fontSize: '1.3rem' };
      case RentalTermType.SUBTITLE2:
        return { fontWeight: 'bold', fontSize: '1.1rem' };
      default:
        return { fontSize: '1rem' };
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" component="h2">
          Conditions Générales de Location
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Ajouter une section
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Utilisez cet éditeur pour modifier les conditions générales de
          location qui apparaîtront dans les contrats. Vous pouvez réorganiser
          les sections en les faisant glisser.
        </Typography>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
          {terms.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography color="text.secondary">
                Aucune condition générale n'a été définie. Cliquez sur "Ajouter
                une section" pour commencer.
              </Typography>
            </Box>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="terms">
                {(provided) => (
                  <List {...provided.droppableProps} ref={provided.innerRef}>
                    {terms.map((term, index) => (
                      <Draggable
                        key={term.id}
                        draggableId={term.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              borderBottom:
                                index < terms.length - 1
                                  ? '1px solid #eee'
                                  : 'none',
                              bgcolor:
                                index % 2 === 0
                                  ? 'rgba(0,0,0,0.01)'
                                  : 'inherit',
                            }}
                          >
                            <Box
                              {...provided.dragHandleProps}
                              sx={{ mr: 1, color: 'text.secondary' }}
                            >
                              <DragHandleIcon />
                            </Box>
                            <ListItemText
                              primary={
                                <Typography
                                  component="div"
                                  sx={{
                                    ...getTermStyle(
                                      term.type as RentalTermType,
                                    ),
                                    whiteSpace: 'pre-wrap',
                                  }}
                                >
                                  {term.content}
                                </Typography>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {term.type}
                                </Typography>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => handleOpenDialog(term)}
                                aria-label="edit"
                                size="small"
                                sx={{ mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                edge="end"
                                onClick={() => handleDeleteClick(term.id)}
                                aria-label="delete"
                                size="small"
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Modifier une section' : 'Ajouter une section'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="term-type-label">Type</InputLabel>
              <Select
                labelId="term-type-label"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Type"
              >
                <MenuItem value={RentalTermType.TITLE}>Titre</MenuItem>
                <MenuItem value={RentalTermType.SUBTITLE}>Sous-titre</MenuItem>
                <MenuItem value={RentalTermType.SUBTITLE2}>
                  Sous-titre 2
                </MenuItem>
                <MenuItem value={RentalTermType.PARAGRAPH}>Paragraphe</MenuItem>
              </Select>
            </FormControl>

            <TextField
              autoFocus
              margin="dense"
              id="content"
              name="content"
              label="Contenu"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={formData.content}
              onChange={handleChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette section ? Cette action est
            irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalTermsEditor;
