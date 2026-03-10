// Tipos principales de la aplicación

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cedula?: string;
  usuario: string;
  tipo_usuario: 'superadmin' | 'admin' | 'usuario';
  estado: 'activo' | 'inactivo';
  conjuntos?: Conjunto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Conjunto {
  id: number;
  nombre_conjunto: string;
  direccion: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  estado: 'activo' | 'inactivo';
  createdAt?: string;
  updatedAt?: string;
}

export interface Area {
  id: number;
  nombre: string;
  descripcion?: string;
  capacidad: number;
  foto?: string;
  costo_reserva: number;
  tiempo_minimo_horas: number;
  estado: 'activo' | 'inactivo';
  conjunto_id: number;
  conjunto?: Conjunto;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reserva {
  id: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  total_pago: number;
  foto_comprobante?: string;
  observaciones?: string;
  usuario_id: number;
  area_id: number;
  usuario?: Usuario;
  area?: Area;
  createdAt?: string;
  updatedAt?: string;
}

export interface Configuracion {
  id: number;
  banco: string;
  tipo_cuenta: 'Ahorro' | 'Corriente';
  numero_cuenta: string;
  nombre_titular: string;
  cedula_titular?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Respuestas de la API
export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: Usuario;
  debe_cambiar_password?: boolean;
}

export interface ApiResponse<T> {
  mensaje?: string;
  data?: T;
  error?: string;
}

export interface UsuariosResponse {
  usuarios: Usuario[];
}

export interface ConjuntosResponse {
  conjuntos: Conjunto[];
}

export interface AreasResponse {
  areas: Area[];
}

export interface ReservasResponse {
  reservas: Reserva[];
}

// Tipos de formularios
export interface LoginFormData {
  usuario: string;
  contraseña: string;
}

export interface CambioPasswordFormData {
  contraseñaActual: string;
  contraseñaNueva: string;
  confirmarContraseña?: string;
}

export interface ReservaFormData {
  area_id: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  foto_comprobante?: string;
  observaciones?: string;
}

export interface UsuarioFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cedula?: string;
  usuario: string;
  tipo_usuario?: 'admin' | 'usuario';
  estado?: 'activo' | 'inactivo';
  conjuntos?: number[];
}

export interface ConjuntoFormData {
  nombre_conjunto: string;
  direccion: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  estado?: 'activo' | 'inactivo';
}

export interface AreaFormData {
  nombre: string;
  descripcion?: string;
  capacidad: number;
  foto?: string;
  costo_reserva: number;
  tiempo_minimo_horas: number;
  estado?: 'activo' | 'inactivo';
  conjunto_id: number;
}

// Tipos de filtros
export interface FiltrosReserva {
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  fecha_inicio?: string;
  fecha_fin?: string;
  area_id?: number;
  usuario_id?: number;
}

export interface FiltrosUsuario {
  estado?: 'activo' | 'inactivo';
  tipo_usuario?: 'superadmin' | 'admin' | 'usuario';
}
