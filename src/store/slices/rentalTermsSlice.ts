import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchRentalTerms,
  addRentalTerm,
  updateRentalTerm,
  deleteRentalTerm,
  reorderRentalTerms,
} from '../../utils/api';
import { RentalTerm, RentalTermType } from '../../utils/types';
import { notifyError, notifySuccess } from '../../utils/notifications';

// Define the state type
interface RentalTermsState {
  terms: RentalTerm[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: RentalTermsState = {
  terms: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllRentalTerms = createAsyncThunk(
  'rentalTerms/fetchAllRentalTerms',
  async (token: string, { rejectWithValue }) => {
    try {
      const data = await fetchRentalTerms(token);
      return data;
    } catch (error) {
      notifyError('Erreur lors de la récupération des conditions générales');
      console.error('Error fetching rental terms: ', error);
      return rejectWithValue('Failed to fetch rental terms');
    }
  },
);

export const createRentalTerm = createAsyncThunk(
  'rentalTerms/createRentalTerm',
  async (
    {
      token,
      content,
      type,
      order,
    }: { token: string; content: string; type: RentalTermType; order: number },
    { rejectWithValue },
  ) => {
    try {
      const data = await addRentalTerm(token, { content, type, order });
      notifySuccess('Condition générale ajoutée avec succès');
      return data;
    } catch (error) {
      notifyError("Erreur lors de l'ajout de la condition générale");
      console.error('Error adding rental term: ', error);
      return rejectWithValue('Failed to add rental term');
    }
  },
);

export const modifyRentalTerm = createAsyncThunk(
  'rentalTerms/modifyRentalTerm',
  async (
    {
      token,
      id,
      updates,
    }: {
      token: string;
      id: number;
      updates: { content?: string; type?: string; order?: number };
    },
    { rejectWithValue },
  ) => {
    try {
      const data = await updateRentalTerm(token, id, updates);
      notifySuccess('Condition générale mise à jour avec succès');
      return data;
    } catch (error) {
      notifyError('Erreur lors de la mise à jour de la condition générale');
      console.error('Error updating rental term: ', error);
      return rejectWithValue('Failed to update rental term');
    }
  },
);

export const removeRentalTerm = createAsyncThunk(
  'rentalTerms/removeRentalTerm',
  async ({ token, id }: { token: string; id: number }, { rejectWithValue }) => {
    try {
      await deleteRentalTerm(token, id);
      notifySuccess('Condition générale supprimée avec succès');
      return id;
    } catch (error) {
      notifyError('Erreur lors de la suppression de la condition générale');
      console.error('Error deleting rental term: ', error);
      return rejectWithValue('Failed to delete rental term');
    }
  },
);

export const reorderTerms = createAsyncThunk(
  'rentalTerms/reorderTerms',
  async (
    { token, termIds }: { token: string; termIds: number[] },
    { rejectWithValue },
  ) => {
    try {
      const data = await reorderRentalTerms(token, termIds);
      notifySuccess('Ordre des conditions générales mis à jour avec succès');
      return data;
    } catch (error) {
      notifyError('Erreur lors de la réorganisation des conditions générales');
      console.error('Error reordering rental terms: ', error);
      return rejectWithValue('Failed to reorder rental terms');
    }
  },
);

// Create the slice
const rentalTermsSlice = createSlice({
  name: 'rentalTerms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all terms
      .addCase(fetchAllRentalTerms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllRentalTerms.fulfilled,
        (state, action: PayloadAction<RentalTerm[]>) => {
          state.terms = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchAllRentalTerms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create term
      .addCase(createRentalTerm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createRentalTerm.fulfilled,
        (state, action: PayloadAction<RentalTerm>) => {
          state.terms.push(action.payload);
          state.terms.sort((a, b) => a.order - b.order);
          state.loading = false;
        },
      )
      .addCase(createRentalTerm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update term
      .addCase(modifyRentalTerm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        modifyRentalTerm.fulfilled,
        (state, action: PayloadAction<RentalTerm>) => {
          const index = state.terms.findIndex(
            (term) => term.id === action.payload.id,
          );
          if (index !== -1) {
            state.terms[index] = action.payload;
            state.terms.sort((a, b) => a.order - b.order);
          }
          state.loading = false;
        },
      )
      .addCase(modifyRentalTerm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete term
      .addCase(removeRentalTerm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        removeRentalTerm.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.terms = state.terms.filter(
            (term) => term.id !== action.payload,
          );
          state.loading = false;
        },
      )
      .addCase(removeRentalTerm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reorder terms
      .addCase(reorderTerms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        reorderTerms.fulfilled,
        (state, action: PayloadAction<RentalTerm[]>) => {
          state.terms = action.payload;
          state.loading = false;
        },
      )
      .addCase(reorderTerms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default rentalTermsSlice.reducer;
