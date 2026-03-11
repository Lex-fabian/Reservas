import api from './config';

export class BaseService {
  constructor(resource) {
    this.resource = resource;
  }

  async obtenerTodos(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/${this.resource}?${query}` : `/${this.resource}`;
    const response = await api.get(url);
    return response.data;
  }

  async obtenerPorId(id) {
    const response = await api.get(`/${this.resource}/${id}`);
    return response.data;
  }

  async crear(data) {
    const response = await api.post(`/${this.resource}`, data);
    return response.data;
  }

  async actualizar(id, data) {
    const response = await api.put(`/${this.resource}/${id}`, data);
    return response.data;
  }

  async eliminar(id) {
    const response = await api.delete(`/${this.resource}/${id}`);
    return response.data;
  }

  async actualizarParcial(id, data) {
    const response = await api.patch(`/${this.resource}/${id}`, data);
    return response.data;
  }

  async customRequest(method, endpoint, data = null, config = {}) {
    const url = `/${this.resource}${endpoint}`;
    const requestConfig = {
      method,
      url,
      ...config
    };

    // Avoid sending literal JSON null for body-less requests (e.g. PATCH confirmar)
    // because strict JSON parsers may reject primitive payloads.
    if (data !== null && data !== undefined) {
      requestConfig.data = data;
    }

    const response = await api.request(requestConfig);
    return response.data;
  }
}
