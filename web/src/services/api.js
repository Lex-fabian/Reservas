import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.108:10000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  async login(usuario, contraseña) {
    const response = await api.post('/auth/login', { usuario, contraseña });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  async register(nombre, apellido, email, telefono, cedula, usuario, contraseña) {
    const response = await api.post('/auth/register', {
      nombre,
      apellido,
      email,
      telefono,
      cedula,
      usuario,
      contraseña
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

export const usuarioService = {
  async obtenerTodos() {
    const response = await api.get('/usuarios');
    return response.data;
  },

  async obtenerPorId(id) {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  async crear(usuarioData) {
    const response = await api.post('/usuarios', usuarioData);
    return response.data;
  },

  async actualizar(id, usuarioData) {
    const response = await api.put(`/usuarios/${id}`, usuarioData);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
};

export const conjuntoService = {
  async obtenerTodos() {
    const response = await api.get('/conjuntos');
    return response.data;
  },

  async obtenerPorId(id) {
    const response = await api.get(`/conjuntos/${id}`);
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

  async obtenerPorConjunto(conjuntoId) {
    const response = await api.get(`/areas/conjunto/${conjuntoId}`);
    return response.data;
  },

  async obtenerPorId(id) {
    const response = await api.get(`/areas/${id}`);
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

  async obtenerPorUsuario(usuarioId) {
    const response = await api.get(`/reservas/usuario/${usuarioId}`);
    return response.data;
  },

  async obtenerPorId(id) {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  },

  async obtenerDisponibilidad(areaId, fecha) {
    const response = await api.get(`/reservas/disponibilidad/${areaId}?fecha=${fecha}`);
    return response.data;
  },

  async actualizar(id, reservaData) {
    const response = await api.put(`/reservas/${id}`, reservaData);
    return response.data;
  },

  async confirmar(id) {
    const response = await api.patch(`/reservas/${id}/confirmar`);
    return response.data;
  },

  async cancelar(id, motivo) {
    const response = await api.patch(`/reservas/${id}/cancelar`, { motivo });
    return response.data;
  },

  async completar(id) {
    const response = await api.patch(`/reservas/${id}/completar`);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
  },
};

export default api;
