import axios, { AxiosError } from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://mellamate.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include auth headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const merchantId = localStorage.getItem('merchant_id');
    
    // Only add auth headers if both token and merchantId exist
    if (token && merchantId) {
      config.headers['X-API-Key'] = token;
      config.headers['X-Merchant-Id'] = merchantId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Clear invalid credentials
        localStorage.removeItem('token');
        localStorage.removeItem('merchant_id');
        window.location.href = '/login'; // Redirect to login page
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Merchant API
export const merchantApi = {
  // Register a new merchant
  register: async (email: string, businessName: string) => {
    try {
      // Generate a username from the email by taking the part before @ and removing special characters
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      
      // First, register the user and create merchant account
      await api.post('/signup', { 
        username,
        email, 
        password: 'temporary_password', // In a real app, you should collect this from the user
        business_name: businessName 
      });
      
      // After successful signup, login to get the token
      const loginResponse = await api.post('/token', 
        `username=${encodeURIComponent(username)}&password=temporary_password`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      if (!loginResponse.data.access_token) {
        throw new Error('Failed to get access token after registration');
      }

      // Get the merchant stats which includes the API keys
      const statsResponse = await api.get('/api/v1/merchant/stats', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.access_token}`,
          'X-API-Key': loginResponse.data.access_token, // Using token as API key for now
          'X-Merchant-Id': email // Using email as merchant ID for now
        }
      });
      
      // Generate API keys if not returned in the response
      const apiPublicKey = statsResponse.data.api_public_key || `pk_test_${Math.random().toString(36).substring(2, 18)}`;
      const apiSecretKey = statsResponse.data.api_secret_key || `sk_test_${Math.random().toString(36).substring(2, 42)}`;
      
      // Return the combined response with login and merchant data
      return {
        ...loginResponse.data,
        ...statsResponse.data,
        email: email,
        merchant_id: statsResponse.data.merchant_id || email,
        business_name: businessName,
        api_public_key: apiPublicKey,
        api_secret_key: apiSecretKey
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
      }
      throw error;
    }
  },

  // Get merchant stats
  getStats: async () => {
    const response = await api.get('/api/v1/merchant/stats');
    return response.data;
  },

  // Get transaction history
  getTransactions: async (limit = 10, offset = 0) => {
    const response = await api.get('/api/v1/merchant/transactions', {
      params: { limit, offset }
    });
    return response.data;
  },

  // Create a new payment
  createPayment: async (amount: string, currency: string, description: string = '') => {
    const response = await api.post('/api/v1/payments', {
      amount,
      currency,
      description
    });
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId: string) => {
    const response = await api.get(`/api/v1/payments/${paymentId}`);
    return response.data;
  },

  // Process a payment
  processPayment: async (paymentId: string, walletAddress: string, secretKey: string) => {
    const response = await api.post(`/api/v1/payments/${paymentId}/process`, {
      wallet_address: walletAddress,
      secret_key: secretKey
    });
    return response.data;
  },
};

export default api;
