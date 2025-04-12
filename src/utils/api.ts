import {
  ConfigElement,
  MachineRental,
  MachineRentalToCreate,
  MachineRentalWithMachineRented,
  MachineRented,
  MachineRentedCreated,
  MachineRentedUpdatedData,
  MachineRentedWithImage,
} from './types';

const API_URL = process.env.REACT_APP_API_URL;

const apiRequest = async (
  endpoint: string,
  method: string,
  token: string,
  body?: any,
  additionalHeaders: HeadersInit = { 'Content-Type': 'application/json' },
  stringifyBody: boolean = true,
  throwError: boolean = true,
) => {
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...additionalHeaders,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = stringifyBody ? JSON.stringify(body) : body;
  }

  const response: Response = await fetch(`${API_URL}${endpoint}`, options);

  let data;

  try {
    // Check if the response is a binary type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType && contentType.includes('text/html')) {
      data = await response.text();
    } else {
      data = await response.blob();
    }
  } catch (error) {
    console.warn('Error parsing response', response, error);
  }

  if (
    response.status === 403 &&
    data?.message &&
    data?.message === 'jwt expired'
  ) {
    window.location.href = `/login?redirect=${window.location.pathname}`;
    return;
  }

  if (throwError && !response.ok) {
    console.error(`${response.statusText} ${response.status}`, data);
    if (typeof data === 'string' && data) {
      throw new Error(data);
    }
    throw new Error(
      data?.message || `${response.statusText} ${response.status}`,
    );
  }

  return data;
};

export const login = async (data: any) => {
  return apiRequest('/rental-operator/login', 'POST', '', data);
};

export const getAllMachineRented = async (
  token: string,
  withImages = false,
) => {
  const response = await apiRequest(
    '/rental-operator/machine-rented',
    'POST',
    token,
    {
      filter: {},
      withImages,
    },
  );
  return response.data;
};

export const fetchMachineById = async (
  id: string,
  token: string,
): Promise<MachineRentedWithImage> => {
  const response = await apiRequest(
    `/rental-operator/machine-rented/${id}`,
    'GET',
    token,
  );
  return response as MachineRentedWithImage;
};

export const updateMachine = async (
  id: string,
  data: MachineRentedUpdatedData,
  token: string,
): Promise<
  MachineRented & { eventUpdateType: 'update' | 'delete' | 'create' | 'none' }
> => {
  return await apiRequest(
    `/rental-operator/machine-rented/${id}`,
    'PATCH',
    token,
    data,
  );
};

export const deleteMachineApi = async (id: string, token: string) => {
  await apiRequest(`/rental-operator/machine-rented/${id}`, 'DELETE', token);
};

export const addMachineRented = async (
  newMachine: MachineRentedCreated & { image: File },
  token: string,
) => {
  const formData = new FormData();
  Object.keys(newMachine).forEach((key) => {
    formData.append(key, (newMachine as Record<string, any>)[key]);
  });

  return await apiRequest(
    '/rental-operator/machine-rented',
    'PUT',
    token,
    formData,
    {},
    false,
  );
};

export const updateMachineRentedImage = async (
  id: string,
  image: File,
  token: string,
): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', image);

  return await apiRequest(
    `/rental-operator/machine-rented/${id}/image`,
    'PATCH',
    token,
    formData,
    {},
    false,
  );
};

export const createMachineRental = async (
  machineId: string,
  rental: MachineRentalToCreate,
  token: string,
): Promise<MachineRental | { errorKey: string; message: string }> => {
  return await apiRequest(
    `/rental-operator/machine-rented/${machineId}/rental`,
    'PUT',
    token,
    rental,
    undefined,
    undefined,
    false,
  );
};

export const getAllMachineRental = async (
  token: string,
): Promise<MachineRentalWithMachineRented[]> => {
  return await apiRequest('/rental-operator/machine-rental', 'GET', token);
};

export const deleteMachineRentalApi = async (id: string, token: string) => {
  await apiRequest(`/rental-operator/machine-rental/${id}`, 'DELETE', token);
};

export const fetchMachineRentalById = async (
  id: string,
  token: string,
): Promise<MachineRentalWithMachineRented> => {
  const response = await apiRequest(
    `/rental-operator/machine-rental/${id}`,
    'GET',
    token,
  );
  return response as MachineRentalWithMachineRented;
};

export const updateMachineRental = async (
  id: string,
  data: Partial<MachineRental>,
  token: string,
): Promise<
  | MachineRental
  | {
      errorKey: string;
      message: string;
    }
> => {
  const response = await apiRequest(
    `/rental-operator/machine-rental/${id}`,
    'PATCH',
    token,
    data,
    undefined,
    undefined,
    false,
  );
  return response as
    | MachineRental
    | {
        errorKey: string;
        message: string;
      };
};

export async function getKnownEmails(token: string): Promise<string[]> {
  return await apiRequest('/rental-operator/known-emails', 'GET', token);
}

export const getAvailableParts = async (
  token: string,
): Promise<{ parts: string[] }> => {
  return await apiRequest(
    '/rental-operator/machine-rented/parts',
    'GET',
    token,
  );
};

export const fetchConfig = (token: string) =>
  apiRequest('/rental-operator/config', 'GET', token);

export const addConfig = (
  token: string,
  config: { key: string; value: string },
) => apiRequest('/rental-operator/config', 'PUT', token, config);

export const deleteConfig = (token: string, key: string) =>
  apiRequest(`/rental-operator/config/${key}`, 'DELETE', token);

export const updateConfig = (token: string, configToUpdate: ConfigElement) =>
  apiRequest(
    `/rental-operator/config/${configToUpdate.key}`,
    'PATCH',
    token,
    configToUpdate,
  );

// New functions for client ID photos and terms & conditions

export const generateTermsAndConditions = async (
  rentalId: string,
  frontPhoto: File,
  backPhoto: File,
  token: string,
): Promise<{ pdfBase64: string; pdfId: string }> => {
  const formData = new FormData();
  formData.append('frontPhoto', frontPhoto);
  formData.append('backPhoto', backPhoto);

  return await apiRequest(
    `/rental-operator/machine-rental/${rentalId}/generate-terms`,
    'POST',
    token,
    formData,
    {},
    false,
  );
};

export const saveSignature = async (
  rentalId: string,
  token: string,
  pdfFile: File | Blob,
): Promise<{ finalPdfId: string }> => {
  const formData = new FormData();
  formData.append('pdfFile', pdfFile);

  return await apiRequest(
    `/rental-operator/machine-rental/${rentalId}/save-signature`,
    'POST',
    token,
    formData,
    {}, // No content-type header, browser will set it with boundary
    false, // Don't stringify the FormData
  );
};

export const sendTermsEmail = async (
  rentalId: string,
  token: string,
  email?: string,
): Promise<{ success: boolean; message: string }> => {
  return await apiRequest(
    `/rental-operator/machine-rental/${rentalId}/send-terms-email`,
    'POST',
    token,
    email ? { email } : undefined,
  );
};

export const getRentalAgreement = async (
  rentalId: string,
  token: string,
): Promise<Blob> => {
  return await apiRequest(
    `/rental-operator/machine-rental/${rentalId}/rental-agreement`,
    'GET',
    token,
  );
};

// Rental Terms API functions
export const fetchRentalTerms = async (token: string) => {
  return await apiRequest('/rental-operator/rental-terms', 'GET', token);
};

export const addRentalTerm = async (
  token: string,
  term: { content: string; type: string; order: number },
) => {
  return await apiRequest('/rental-operator/rental-terms', 'POST', token, term);
};

export const updateRentalTerm = async (
  token: string,
  id: number,
  updates: { content?: string; type?: string; order?: number },
) => {
  return await apiRequest(
    `/rental-operator/rental-terms/${id}`,
    'PATCH',
    token,
    updates,
  );
};

export const deleteRentalTerm = async (token: string, id: number) => {
  return await apiRequest(
    `/rental-operator/rental-terms/${id}`,
    'DELETE',
    token,
  );
};

export const reorderRentalTerms = async (token: string, termIds: number[]) => {
  return await apiRequest(
    '/rental-operator/rental-terms/reorder',
    'POST',
    token,
    { termIds },
  );
};

export const updateMachineRentalState = async (
  id: string,
  token: string,
  data: {
    depositToPay?: boolean;
    operatingHours?: number;
    fuelLevel?: number;
  },
): Promise<MachineRentalWithMachineRented> => {
  return await apiRequest(
    `/rental-operator/machine-rental/${id}/update-state`,
    'PATCH',
    token,
    data,
  );
};
