import { BaseService } from './BaseService';

class AreaService extends BaseService {
  constructor() {
    super('areas');
  }

  async obtenerTodas() {
    return this.obtenerTodos();
  }

  async obtenerPorConjunto(conjuntoId) {
    return this.customRequest('GET', `/conjunto/${conjuntoId}`);
  }
}

export const areaService = new AreaService();
