import apiClient from '../api-client';

export interface Campaign {
  id: number;
  charityId: number;
  name: string;
  description: string;
  imageUrl: string | null;
  goal: string;
  totalDonations: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignCreate {
  charityId: number;
  name: string;
  description: string;
  imageUrl?: string;
  goal: string;
  isActive?: boolean;
}

export interface CampaignUpdate {
  name?: string;
  description?: string;
  imageUrl?: string;
  goal?: string;
  isActive?: boolean;
}

export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await apiClient.get('/api/campaigns');
  return response.data;
};

export const getCampaign = async (id: number): Promise<Campaign> => {
  const response = await apiClient.get(`/api/admin/campaigns/${id}`);
  return response.data;
};

export const createCampaign = async (campaign: CampaignCreate): Promise<Campaign> => {
  const response = await apiClient.post('/api/admin/campaigns', campaign);
  return response.data;
};

export const updateCampaign = async (id: number, campaign: CampaignUpdate): Promise<Campaign> => {
  const response = await apiClient.put(`/api/admin/campaigns/${id}`, campaign);
  return response.data;
};

export const getCampaignDonations = async (id: number) => {
  const response = await apiClient.get(`/api/donations/campaign/${id}`);
  return response.data;
};

export const getCharityCampaigns = async (charityId: number): Promise<Campaign[]> => {
  const response = await apiClient.get(`/api/admin/charities/${charityId}/campaigns`);
  return response.data;
}; 