import apiClient from '../api-client';

export interface Donation {
  id: number;
  userId: number;
  donorAddress: string;
  campaignId: number;
  roundId: number;
  amount: string;
  fiatAmount: number | null;
  fiatCurrency: string;
  transactionHash: string | null;
  createdAt: string;
}

export interface DonationCreate {
  userId: number;
  campaignId: number;
  amount: string;
  fiatAmount?: number;
  fiatCurrency?: string;
}

export const createDonation = async (donation: DonationCreate) => {
  const response = await apiClient.post('/api/donations', donation);
  return response.data;
};

export const getDonation = async (id: number) => {
  const response = await apiClient.get(`/api/donations/${id}`);
  return response.data;
};

export const getUserDonations = async (userId: number) => {
  const response = await apiClient.get(`/api/donations/user/${userId}`);
  return response.data;
};

export const getCampaignDonations = async (campaignId: number) => {
  const response = await apiClient.get(`/api/donations/campaign/${campaignId}`);
  return response.data;
};

export const getCurrentUserDonations = async () => {
  // Try the /me endpoint first
  try {
    const response = await apiClient.get('/api/donations/me');
    return response.data;
  } catch (err) {
    // If /me endpoint fails, try the alternate endpoint
    try {
      const response = await apiClient.get('/api/donations/my-donations');
      return response.data;
    } catch (err2) {
      // As a last resort, try getting the user ID and fetching by ID
      const userResponse = await apiClient.get('/api/auth/me');
      const userId = userResponse.data?.data?.user?.id || userResponse.data?.id;
      
      if (!userId) {
        throw new Error('Could not determine user ID');
      }
      
      const donationsResponse = await apiClient.get(`/api/donations/user/${userId}`);
      return donationsResponse.data;
    }
  }
}; 