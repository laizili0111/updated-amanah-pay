import apiClient from '../api-client';

export interface Certificate {
  id: number;
  donationId: number;
  tokenId: number | null;
  tier: string;
  imageUrl: string | null;
  metadataUrl: string | null;
  ownerAddress: string;
  createdAt: string;
}

export const getCertificates = async (): Promise<Certificate[]> => {
  const response = await apiClient.get('/api/certificates');
  return response.data;
};

export const getCertificate = async (id: number): Promise<Certificate> => {
  const response = await apiClient.get(`/api/certificates/${id}`);
  return response.data;
};

export const getUserCertificates = async (userId: number): Promise<Certificate[]> => {
  const response = await apiClient.get(`/api/certificates/user/${userId}`);
  return response.data;
};

export const getCertificateMetadata = async (tokenId: number) => {
  const response = await apiClient.get(`/api/certificates/metadata/${tokenId}`);
  return response.data;
};

export const getCurrentUserCertificates = async (): Promise<Certificate[]> => {
  const response = await apiClient.get('/api/certificates/user/me');
  return response.data;
}; 