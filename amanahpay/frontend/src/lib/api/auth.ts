import apiClient from '../api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  walletAddress: string;
  fullName?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  wallet_address: string;
  full_name: string | null;
  kyc_status: string;
  kyc_document_url: string | null;
  created_at: string;
  updated_at: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return {
    token: response.data.token,
    user: response.data.data?.user || null
  };
};

export const register = async (data: RegisterData) => {
  // Convert frontend property names to backend expected format
  const backendData = {
    username: data.username,
    email: data.email,
    password: data.password,
    wallet_address: data.walletAddress,
    full_name: data.fullName
  };
  
  const response = await apiClient.post('/api/auth/register', backendData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return {
    token: response.data.token,
    user: response.data.data?.user || null
  };
};

export const verifyEmail = async (token: string) => {
  const response = await apiClient.post('/api/auth/verify-email', { token });
  return response.data;
};

export const resetPassword = async (email: string) => {
  const response = await apiClient.post('/api/auth/reset-password', { email });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/api/auth/me');
  return response.data.data?.user || response.data.user || response.data;
};

export const connectWallet = async (walletAddress: string) => {
  const response = await apiClient.post('/api/auth/connect-wallet', { wallet_address: walletAddress });
  return response.data.data?.user || response.data.user || response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
}; 