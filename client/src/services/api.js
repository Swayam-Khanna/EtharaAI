import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Inject JWT Bearer Token into headers
API.interceptors.request.use(
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

// Response interceptor: Global error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear token and logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    
    // Format error message to be read by frontend easily
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'An unexpected error occurred';
      
    const formattedError = new Error(message);
    formattedError.status = error.response ? error.response.status : 500;
    formattedError.data = error.response ? error.response.data : null;
    
    return Promise.reject(formattedError);
  }
);

export default API;
