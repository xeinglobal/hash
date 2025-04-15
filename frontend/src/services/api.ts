import axios from 'axios';

// Checking for API_URL in a more secure way
let API_URL = process.env.NEXT_PUBLIC_API_URL;

// If environment variable is not defined, use default value
if (!API_URL) {
  API_URL = 'http://localhost:8000/api';
  console.warn('NEXT_PUBLIC_API_URL is not defined, using default value:', API_URL);
} else {
  // Remove trailing slash if present and add /api
  API_URL = `${API_URL.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // No need to send cookies since JWT token is used
});

// Request interceptor - adds token
api.interceptors.request.use(
  (config) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Show only 10 characters for security
        const maskedToken = token.length > 10 ? 
          `${token.substring(0, 5)}...${token.substring(token.length - 5)}` : token;
      } else {
        console.warn(`API request: ${config.method?.toUpperCase()} ${config.url} (no token!)`);
      }
    } catch (error) {
      console.error("Request interceptor error:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request could not be sent:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - catches token errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`API response error: ${error.config?.url} - ${error.response.status} ${error.response.statusText}`);
      console.error('Error details:', error.response.data);
    } else if (error.request) {
      console.error('No API response received:', error.request);
    } else {
      console.error('API request error:', error.message);
    }
    
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("401 error received, token is invalid. Logging user out.");
      // Token error - log the user out
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 