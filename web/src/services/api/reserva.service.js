import { BaseService } from './BaseService';

class ReservaService extends BaseService {
  constructor() {
    super('reservas');
  }

  async obtenerTodas(filtros = {}) {
    return this.obtenerTodos(filtros);
  }

  async obtenerPorUsuario(usuarioId) {
    return this.customRequest('GET', `/usuario/${usuarioId}`);
  }

  async obtenerDisponibilidad(areaId, fecha) {
    return this.customRequest('GET', `/disponibilidad/${areaId}?fecha=${fecha}`);
  }

  async confirmar(id) {
    return this.customRequest('PATCH', `/${id}/confirmar`);
  }

  async cancelar(id, motivo) {
    return this.customRequest('PATCH', `/${id}/cancelar`, { motivo });
  }

  async completar(id) {
    return this.customRequest('PATCH', `/${id}/completar`);
  }
}

export const reservaService = new ReservaService();
