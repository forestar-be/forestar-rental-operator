import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchMachineRental } from './slices/machineRentalSlice';
import { useAuth } from '../hooks/AuthProvider';
import { ALLOWED_ROLES } from '../hooks/session';
// Import selectors - these can be used to check if data is already loaded
import {
  getMachineRentalList,
} from './selectors';

/**
 * A component that initializes the Redux store with data when the app starts
 */
export const StoreInitializer = (): null => {
  const dispatch = useAppDispatch();
  const { token, hasRole, ssoEnabled } = useAuth();

  // Use selectors to check if data is already loaded
  const machineRentalList = useAppSelector(getMachineRentalList);

  // Le rôle est vérifié ici, pas seulement dans la garde de route.
  //
  // En mode SSO, `token` est une sentinelle non vide : elle est vraie pour
  // *toute* session authentifiée, y compris une session sans rôle admis. Cet
  // effet vit au-dessus de `AuthRoute`, donc il partait quand même, repartait
  // en 403, et `notifyError` affichait « Erreur lors de la récupération des
  // locations de machines » à côté de l'écran de refus — l'écran racontait deux
  // choses à la fois (retour R027 n° 23).
  const allowed = !ssoEnabled || hasRole(...ALLOWED_ROLES);

  useEffect(() => {
    if (token && allowed) {
      if (machineRentalList.length === 0) {
        dispatch(fetchMachineRental(token));
      }
    }
  }, [
    dispatch,
    token,
    allowed,
    machineRentalList.length,
  ]);

  return null;
};
