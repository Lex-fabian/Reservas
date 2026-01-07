import axios from 'axios';

// Cambiar esta URL según el entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
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

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  async register(nombre, email, password, telefono) {
    const response = await api.post('/auth/register', {
      nombre,
      email,
      password,
      telefono,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  getUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },
};

export const reservaService = {
  async crear(reservaData) {
    const response = await api.post('/reservas', reservaData);
    return response.data;
  },

  async obtenerTodas(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    const response = await api.get(`/reservas?${params}`);
    return response.data;
  },

  async obtenerPorId(id) {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  },

  async actualizar(id, reservaData) {
    const response = await api.put(`/reservas/${id}`, reservaData);
    return response.data;
  },

  async cancelar(id) {
    const response = await api.patch(`/reservas/${id}/cancelar`);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
  },
};

export default api;
