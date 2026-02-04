import api from './config';
import { storageService } from './storage';

class AuthService {
  async login(usuario, contraseña) {
    const response = await api.post('/auth/login', { usuario, contraseña });
    
    if (response.data.token && response.data.usuario) {
      storageService.setAuth(response.data.token, response.data.usuario);
    }
    
    return response.data;
  }

  async register(datos) {
    const response = await api.post('/auth/register', datos);
    
    if (response.data.token && response.data.usuario) {
      storageService.setAuth(response.data.token, response.data.usuario);
    }
    
    return response.data;
  }

  logout() {
    storageService.clearAuth();
  }

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  async cambiarPassword(passwordActual, passwordNuevo) {
    const response = await api.post('/usuarios/cambiar-password', {
      passwordActual,
      passwordNuevo
    });
    return response.data;
  }

  // Metodos de utilidad
  isLoggedIn() {
    return storageService.isAuthenticated();
  }

  getUsuario() {
    return storageService.getUsuario();
  }

  getTipoUsuario() {
    const usuario = this.getUsuario();
    return usuario?.tipo_usuario || null;
  }

  isUsuario() {
    return this.getTipoUsuario() === 'usuario';
  }

  isAdmin() {
    return this.getTipoUsuario() === 'admin';
  }

  isSuperAdmin() {
    return this.getTipoUsuario() === 'superadmin';
  }

  isAdminOrSuper() {
    const tipo = this.getTipoUsuario();
    return tipo === 'admin' || tipo === 'superadmin';
  }

  hasPermission(requiredRole) {
    const roles = ['usuario', 'admin', 'superadmin'];
    const currentRole = this.getTipoUsuario();
    const currentIndex = roles.indexOf(currentRole);
    const requiredIndex = roles.indexOf(requiredRole);
    return currentIndex >= requiredIndex;
  }
}

export const authService = new AuthService();
