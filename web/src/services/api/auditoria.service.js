import { BaseService } from './BaseService';

class AuditoriaService extends BaseService {
  constructor() {
    super('auditoria');
  }

  async obtenerLogs(filtros = {}) {
    return this.obtenerTodos(filtros);
  }
}

export const auditoriaService = new AuditoriaService();
