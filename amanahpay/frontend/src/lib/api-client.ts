import axios from 'axios';

// Create API client instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 30000, // Increase timeout from 10s to 30s
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle auth errors
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Improve error message for timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout exceeded. Please try again.');
      error.message = 'Request timeout exceeded. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 