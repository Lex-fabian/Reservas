import { BaseService } from './BaseService';

class UsuarioService extends BaseService {
  constructor() {
    super('usuarios');
  }

  async cambiarContraseñaPropia(passwordActual, passwordNuevo) {
    return this.customRequest('POST', '/cambiar-password', {
      passwordActual,
      passwordNuevo
    });
  }

  async cambiarEstado(id, estado) {
    return this.customRequest('PATCH', `/${id}/estado`, { estado });
  }

  async obtenerTodos(filtros = {}) {
    return super.obtenerTodos(filtros);
  }
}

export const usuarioService = new UsuarioService();
