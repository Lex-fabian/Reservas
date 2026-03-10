import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Usuario,
  LoginResponse,
  LoginFormData,
  Reserva,
  ReservaFormData,
  FiltrosReserva,
  Conjunto,
  ConjuntoFormData,
  Area,
  AreaFormData,
  UsuarioFormData,
  UsuariosResponse,
  ConjuntosResponse,
  AreasResponse,
  ReservasResponse,
  Configuracion,
  CambioPasswordFormData,
} from '../types';

const API_URL = 'https://reservas-725o.onrender.com/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Error de autenticación
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
    }
    
    // Timeout o error de red
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
      const networkError: any = new Error('⚠️ El sistema no está disponible en este momento. Por favor, intenta nuevamente en unos minutos.');
      networkError.isNetworkError = true;
      networkError.code = error.code;
      return Promise.reject(networkError);
    }
    
    // Error del servidor (500+)
    if (error.response?.status && error.response.status >= 500) {
      const serverError: any = new Error('⚠️ El servidor está experimentando problemas. Por favor, intenta nuevamente en unos minutos.');
      serverError.isServerError = true;
      serverError.status = error.response.status;
      return Promise.reject(serverError);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  async login(usuario: string, contraseña: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', { 
      usuario, 
      contraseña 
    });
    
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
  },

  async getProfile(): Promise<{ usuario: Usuario }> {
    const response = await api.get<{ usuario: Usuario }>('/auth/profile');
    return response.data;
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },

  async getUsuario(): Promise<Usuario | null> {
    const usuarioStr = await AsyncStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  },
};

// ============================================
// RESERVA SERVICE
// ============================================
export const reservaService = {
  async crear(reservaData: ReservaFormData): Promise<{ mensaje: string; reserva: Reserva }> {
    const response = await api.post<{ mensaje: string; reserva: Reserva }>('/reservas', reservaData);
    return response.data;
  },

  async obtenerTodas(filtros: FiltrosReserva = {}): Promise<ReservasResponse> {
    const params = new URLSearchParams(filtros as any).toString();
    const response = await api.get<ReservasResponse>(`/reservas?${params}`);
    return response.data;
  },

  async obtenerPorId(id: number): Promise<{ reserva: Reserva }> {
    const response = await api.get<{ reserva: Reserva }>(`/reservas/${id}`);
    return response.data;
  },

  async actualizar(id: number, reservaData: Partial<ReservaFormData>): Promise<{ mensaje: string; reserva: Reserva }> {
    const response = await api.put<{ mensaje: string; reserva: Reserva }>(`/reservas/${id}`, reservaData);
    return response.data;
  },

  async confirmar(id: number): Promise<{ mensaje: string; reserva: Reserva }> {
    const response = await api.patch<{ mensaje: string; reserva: Reserva }>(`/reservas/${id}/confirmar`);
    return response.data;
  },

  async cancelar(id: number): Promise<{ mensaje: string; reserva: Reserva }> {
    const response = await api.patch<{ mensaje: string; reserva: Reserva }>(`/reservas/${id}/cancelar`);
    return response.data;
  },

  async eliminar(id: number): Promise<{ mensaje: string }> {
    const response = await api.delete<{ mensaje: string }>(`/reservas/${id}`);
    return response.data;
  },
};

// ============================================
// CONJUNTO SERVICE
// ============================================
export const conjuntoService = {
  async obtenerTodos(): Promise<ConjuntosResponse> {
    const response = await api.get<ConjuntosResponse>('/conjuntos');
    return response.data;
  },

  async crear(conjuntoData: ConjuntoFormData): Promise<{ mensaje: string; conjunto: Conjunto }> {
    const response = await api.post<{ mensaje: string; conjunto: Conjunto }>('/conjuntos', conjuntoData);
    return response.data;
  },

  async actualizar(id: number, conjuntoData: Partial<ConjuntoFormData>): Promise<{ mensaje: string; conjunto: Conjunto }> {
    const response = await api.put<{ mensaje: string; conjunto: Conjunto }>(`/conjuntos/${id}`, conjuntoData);
    return response.data;
  },

  async eliminar(id: number): Promise<{ mensaje: string }> {
    const response = await api.delete<{ mensaje: string }>(`/conjuntos/${id}`);
    return response.data;
  },
};

// ============================================
// AREA SERVICE
// ============================================
export const areaService = {
  async obtenerTodas(): Promise<AreasResponse> {
    const response = await api.get<AreasResponse>('/areas');
    return response.data;
  },

  async crear(areaData: AreaFormData): Promise<{ mensaje: string; area: Area }> {
    const response = await api.post<{ mensaje: string; area: Area }>('/areas', areaData);
    return response.data;
  },

  async actualizar(id: number, areaData: Partial<AreaFormData>): Promise<{ mensaje: string; area: Area }> {
    const response = await api.put<{ mensaje: string; area: Area }>(`/areas/${id}`, areaData);
    return response.data;
  },

  async eliminar(id: number): Promise<{ mensaje: string }> {
    const response = await api.delete<{ mensaje: string }>(`/areas/${id}`);
    return response.data;
  },
};

// ============================================
// USUARIO SERVICE
// ============================================
export const usuarioService = {
  async obtenerTodos(): Promise<UsuariosResponse> {
    const response = await api.get<UsuariosResponse>('/usuarios');
    return response.data;
  },

  async crear(usuarioData: UsuarioFormData): Promise<{ 
    mensaje: string; 
    usuario: Usuario;
    contraseñaTemporal?: string;
  }> {
    // YA NO enviar contraseña - el backend la genera automáticamente
    const response = await api.post<{ 
      mensaje: string; 
      usuario: Usuario;
      contraseñaTemporal?: string;
    }>('/usuarios', usuarioData);
    return response.data;
  },

  async actualizar(id: number, usuarioData: Partial<UsuarioFormData>): Promise<{ mensaje: string; usuario: Usuario }> {
    const response = await api.put<{ mensaje: string; usuario: Usuario }>(`/usuarios/${id}`, usuarioData);
    return response.data;
  },

  async eliminar(id: number): Promise<{ mensaje: string }> {
    const response = await api.delete<{ mensaje: string }>(`/usuarios/${id}`);
    return response.data;
  },

  async cambiarEstado(id: number, estado: 'activo' | 'inactivo'): Promise<{ mensaje: string; usuario: Usuario }> {
    const response = await api.patch<{ mensaje: string; usuario: Usuario }>(`/usuarios/${id}/estado`, { estado });
    return response.data;
  },

  async cambiarContraseñaPropia(datos: CambioPasswordFormData): Promise<{ mensaje: string }> {
    const response = await api.post<{ mensaje: string }>('/usuarios/cambiar-password', datos);
    return response.data;
  },

  // NUEVO: Cambiar contraseña obligatoria (primer login)
  async cambiarPasswordObligatoria(datos: { 
    contraseñaActual: string; 
    contraseñaNueva: string 
  }): Promise<{ mensaje: string; debe_cambiar_password: boolean }> {
    const response = await api.post<{ mensaje: string; debe_cambiar_password: boolean }>(
      '/usuarios/cambiar-password-obligatoria', 
      datos
    );
    return response.data;
  },
};

// ============================================
// CONFIGURACION SERVICE
// ============================================
export const configuracionService = {
  async obtener(): Promise<Configuracion> {
    const response = await api.get<Configuracion>('/configuracion');
    return response.data;
  },
};

export default api;
