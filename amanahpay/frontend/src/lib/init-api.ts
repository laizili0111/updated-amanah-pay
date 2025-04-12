import apiClient from './api-client';

export async function checkApiConnection(): Promise<boolean> {
  try {
    const response = await apiClient.get('/api/health');
    console.log('Backend API connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('Backend API connection failed:', error);
    return false;
  }
}

export async function initApi(): Promise<void> {
  try {
    const isConnected = await checkApiConnection();
    if (!isConnected) {
      console.warn('Unable to connect to backend API. Some features may not work.');
    }
  } catch (error) {
    console.error('API initialization error:', error);
  }
} 