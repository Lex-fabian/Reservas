const STORAGE_KEYS = {
  TOKEN: 'token',
  USUARIO: 'usuario',
};

export const storageService = {
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  getUsuario() {
    const usuario = localStorage.getItem(STORAGE_KEYS.USUARIO);
    try {
      return usuario ? JSON.parse(usuario) : null;
    } catch {
      return null;
    }
  },

  setUsuario(usuario) {
    localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuario));
  },

  removeUsuario() {
    localStorage.removeItem(STORAGE_KEYS.USUARIO);
  },

  setAuth(token, usuario) {
    this.setToken(token);
    this.setUsuario(usuario);
  },

  clearAuth() {
    this.removeToken();
    this.removeUsuario();
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
