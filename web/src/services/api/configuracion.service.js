import api from './config';

class ConfiguracionService {
  async obtener() {
    const response = await api.get('/configuracion');
    return response.data;
  }

  async actualizar(data) {
    const response = await api.post('/configuracion', data);
    return response.data;
  }
}

export const configuracionService = new ConfiguracionService();
