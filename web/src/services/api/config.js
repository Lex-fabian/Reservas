import axios from 'axios';
import { storageService } from './storage';

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:10000/api',
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
    // Error de autenticación
    if (error.response?.status === 401) {
      storageService.clearAuth();
      window.location.href = '/login';
    }
    
    // Timeout o error de red
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
      return Promise.reject({
        message: '⚠️ El sistema no está disponible en este momento. Por favor, intenta nuevamente en unos minutos.',
        status: 503,
        isNetworkError: true
      });
    }
    
    // Error del servidor (500+)
    if (error.response?.status >= 500) {
      return Promise.reject({
        message: '⚠️ El servidor está experimentando problemas. Por favor, intenta nuevamente en unos minutos.',
        status: error.response.status,
        isServerError: true
      });
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
