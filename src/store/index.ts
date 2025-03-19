import { configureStore } from '@reduxjs/toolkit';
import machineRentalReducer from './slices/machineRentalSlice';
import rentalTermsReducer from './slices/rentalTermsSlice';

// Configure the store
const store = configureStore({
  reducer: {
    machineRental: machineRentalReducer,
    rentalTerms: rentalTermsReducer,
  },
});

// Define RootState type
export type RootState = ReturnType<typeof store.getState>;
// Define AppDispatch type
export type AppDispatch = typeof store.dispatch;

export default store;
