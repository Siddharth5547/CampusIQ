import axios from 'axios';

const getBaseUrl = () => {
  // 1. In browser production (any non-localhost domain), use relative '/api' for same-origin reliability
  if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
    return '/api';
  }
  // 2. Explicit custom API URL from environment variable
  if (import.meta.env.VITE_API_URL) {
    const envUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  // 3. Local Vite development server proxy
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return '/api';
  }
  // 4. Default local development backend
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuscare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthPage = typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/register');
      if (!isAuthPage) {
        localStorage.removeItem('campuscare_token');
        localStorage.removeItem('campuscare_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
