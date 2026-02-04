const configuracionService = require('../services/configuracion.service');

const configuracionController = {
  async getConfig(req, res) {
    try {
      const config = await configuracionService.obtener();
      res.json(config);
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al obtener configuración' });
    }
  },

  // CREAR O ACTUALIZAR LA CONFIGURACIÓN
  async updateConfig(req, res) {
    try {
      // VERIFICAR PERMISOS
      configuracionService.validarPermisos(req.usuario);

      const config = await configuracionService.actualizarOCrear(req.body);

      res.json({
        message: 'Configuración actualizada exitosamente',
        config
      });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al actualizar configuración' });
    }
  }
};

module.exports = configuracionController;
