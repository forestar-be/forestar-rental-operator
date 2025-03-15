import { configureStore } from '@reduxjs/toolkit';
import machineRentalReducer from './slices/machineRentalSlice';

// Configure the store
const store = configureStore({
  reducer: {
    machineRental: machineRentalReducer,
  },
});

// Define RootState type
export type RootState = ReturnType<typeof store.getState>;
// Define AppDispatch type
export type AppDispatch = typeof store.dispatch;

export default store;
