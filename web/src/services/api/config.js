import axios from 'axios';
import { storageService } from './storage';

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://192.168.1.108:10000/api',
  TIMEOUT: 60000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

api.interceptors.request.use(
  (config) => {
    const token = storageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storageService.clearAuth();
      window.location.href = '/login';
    }
    
    const errorMessage = error.response?.data?.error 
      || error.response?.data?.message 
      || error.message 
      || 'Error desconocido';
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default api;
