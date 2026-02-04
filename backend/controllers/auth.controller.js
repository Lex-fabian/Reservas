const authService = require('../services/auth.service');

const authController = {
  async register(req, res) {
    try {
      const usuarioCreado = await authService.registrar(req.body);

      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        usuario: usuarioCreado
      });
    } catch (error) {
      console.error('Error en registro:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        error: error.message || 'Error al registrar usuario' 
      });
    }
  },

  async login(req, res) {
    try {
      const { usuario, contraseña } = req.body;
      
      const resultado = await authService.login(usuario, contraseña);

      res.json({
        mensaje: 'Login exitoso',
        ...resultado
      });
    } catch (error) {
      console.error('Error en login:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        mensaje: error.message || 'Error al iniciar sesión' 
      });
    }
  },

  async getProfile(req, res) {
    try {
      const usuario = await authService.obtenerPerfil(req.usuario.id);

      res.json({ usuario });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        error: error.message || 'Error al obtener perfil' 
      });
    }
  }
};

module.exports = authController;

