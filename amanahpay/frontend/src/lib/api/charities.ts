import apiClient from '../api-client';

export interface Charity {
  id: number;
  name: string;
  description: string;
  adminAddress: string;
  adminUserId: number | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CharityCreate {
  name: string;
  description: string;
  adminAddress: string;
  adminUserId?: number;
}

export interface CharityUpdate {
  name?: string;
  description?: string;
  adminAddress?: string;
  isActive?: boolean;
}

export const getCharities = async (): Promise<Charity[]> => {
  const response = await apiClient.get('/charities');
  return response.data;
};

export const getCharity = async (id: number): Promise<Charity> => {
  const response = await apiClient.get(`/charities/${id}`);
  return response.data;
};

export const createCharity = async (charity: CharityCreate): Promise<Charity> => {
  const response = await apiClient.post('/charities', charity);
  return response.data;
};

export const updateCharity = async (id: number, charity: CharityUpdate): Promise<Charity> => {
  const response = await apiClient.put(`/charities/${id}`, charity);
  return response.data;
};

export const verifyCharity = async (id: number) => {
  const response = await apiClient.post(`/charities/${id}/verify`);
  return response.data;
}; 