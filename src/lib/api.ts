import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://mellamate.onrender.com', // Your backend URL
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        console.log('Adding token to request:', token.substring(0, 10) + '...'); // Debug log
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No access token found in localStorage');
      }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error
      // You might want to redirect to login or refresh the token here
      console.error('Authentication error:', error.response?.data?.detail || 'Unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;
