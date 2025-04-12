import apiClient from '../api-client';

export interface Proposal {
  id: number;
  title: string;
  description: string;
  charityId: number;
  campaignId: number | null;
  requestedAmount: string;
  proposerId: number;
  startTime: string;
  endTime: string;
  status: string;
  transactionId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalCreate {
  title: string;
  description: string;
  charityId: number;
  campaignId?: number;
  requestedAmount: string;
  startTime: string;
  endTime: string;
}

export interface ProposalUpdate {
  title?: string;
  description?: string;
  requestedAmount?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}

export interface Vote {
  id: number;
  proposalId: number;
  userId: number;
  voteWeight: string;
  voteType: string;
  createdAt: string;
}

export const getProposals = async (): Promise<Proposal[]> => {
  const response = await apiClient.get('/api/admin/proposals');
  return response.data;
};

export const getProposal = async (id: number): Promise<Proposal> => {
  const response = await apiClient.get(`/api/admin/proposals/${id}`);
  return response.data;
};

export const createProposal = async (proposal: ProposalCreate): Promise<Proposal> => {
  const response = await apiClient.post('/api/admin/proposals', proposal);
  return response.data;
};

export const updateProposal = async (id: number, proposal: ProposalUpdate): Promise<Proposal> => {
  const response = await apiClient.put(`/api/admin/proposals/${id}`, proposal);
  return response.data;
};

export const voteOnProposal = async (proposalId: number, voteType: string) => {
  const response = await apiClient.post(`/api/admin/proposals/${proposalId}/vote`, { voteType });
  return response.data;
};

export const getProposalVotes = async (proposalId: number): Promise<Vote[]> => {
  const response = await apiClient.get(`/api/admin/proposals/${proposalId}/votes`);
  return response.data;
}; 