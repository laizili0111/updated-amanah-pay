import apiClient from '../api-client';

export interface Round {
  id: number;
  startTime: string;
  endTime: string;
  matchingPool: string;
  totalDonations: string;
  isDistributed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getRounds = async (): Promise<Round[]> => {
  const response = await apiClient.get('/api/rounds');
  return response.data;
};

export const getCurrentRound = async (): Promise<Round> => {
  const response = await apiClient.get('/api/rounds/current');
  return response.data;
};

export const getRound = async (id: number): Promise<Round> => {
  const response = await apiClient.get(`/api/rounds/${id}`);
  return response.data;
};

export const finalizeRound = async () => {
  const response = await apiClient.post('/api/rounds/finalize');
  return response.data;
};

export const addToMatchingPool = async (amount: string) => {
  const response = await apiClient.post('/api/rounds/matching-pool', { amount });
  return response.data;
}; 