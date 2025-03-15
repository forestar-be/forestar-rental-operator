import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchMachineRental } from './slices/machineRentalSlice';
import { useAuth } from '../hooks/AuthProvider';
// Import selectors - these can be used to check if data is already loaded
import {
  getMachineRentalList,
} from './selectors';

/**
 * A component that initializes the Redux store with data when the app starts
 */
export const StoreInitializer = (): null => {
  const dispatch = useAppDispatch();
  const { token } = useAuth();

  // Use selectors to check if data is already loaded
  const machineRentalList = useAppSelector(getMachineRentalList);

  useEffect(() => {
    if (token) {
      if (machineRentalList.length === 0) {
        dispatch(fetchMachineRental(token));
      }
    }
  }, [
    dispatch,
    token,
    machineRentalList.length,
  ]);

  return null;
};
