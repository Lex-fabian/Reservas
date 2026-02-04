import { BaseService } from './BaseService';

class ConjuntoService extends BaseService {
  constructor() {
    super('conjuntos');
  }

}

export const conjuntoService = new ConjuntoService();
