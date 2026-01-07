import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.108:10000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
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
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(usuario, contraseña) {
    const response = await api.post('/auth/login', { usuario, contraseña });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(response.data.usuario));
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
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async isLoggedIn() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },

  async getUsuario() {
    const usuario = await AsyncStorage.getItem('usuario');
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

export const conjuntoService = {
  async obtenerTodos() {
    const response = await api.get('/conjuntos');
    return response.data;
  },

  async crear(conjuntoData) {
    const response = await api.post('/conjuntos', conjuntoData);
    return response.data;
  },

  async actualizar(id, conjuntoData) {
    const response = await api.put(`/conjuntos/${id}`, conjuntoData);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/conjuntos/${id}`);
    return response.data;
  },
};

export const areaService = {
  async obtenerTodas() {
    const response = await api.get('/areas');
    return response.data;
  },

  async crear(areaData) {
    const response = await api.post('/areas', areaData);
    return response.data;
  },

  async actualizar(id, areaData) {
    const response = await api.put(`/areas/${id}`, areaData);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/areas/${id}`);
    return response.data;
  },
};

export default api;
