const areaService = require('../services/area.service');

const areaController = {
  async crear(req, res) {
    try {
      const area = await areaService.crear(req.body, req.usuario);

      res.status(201).json({
        mensaje: 'Área creada exitosamente',
        area
      });
    } catch (error) {
      console.error('Error al crear área:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        error: error.message || 'Error al crear área' 
      });
    }
  },

  async obtenerTodas(req, res) {
    try {
      const areas = await areaService.obtenerTodas(req.query, req.usuario);

      res.json({ areas });
    } catch (error) {
      console.error('Error al obtener áreas:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        error: error.message || 'Error al obtener áreas' 
      });
    }
  },

  async obtenerPorConjunto(req, res) {
    try {
      const areas = await areaService.obtenerPorConjunto(req.params.conjuntoId);

      res.json({ areas });
    } catch (error) {
      console.error('Error al obtener áreas:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        error: error.message || 'Error al obtener áreas' 
      });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const area = await areaService.obtenerPorId(req.params.id);

      res.json({ area });
    } catch (error) {
      console.error('Error al obtener área:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        error: error.message || 'Error al obtener área' 
      });
    }
  },

  async actualizar(req, res) {
    try {
      const area = await areaService.actualizar(req.params.id, req.body);

      res.json({
        mensaje: 'Área actualizada exitosamente',
        area
      });
    } catch (error) {
      console.error('Error al actualizar área:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        error: error.message || 'Error al actualizar área'
      });
    }
  },

  async eliminar(req, res) {
    try {
      const resultado = await areaService.eliminar(req.params.id);

      res.json(resultado);
    } catch (error) {
      console.error('Error al eliminar área:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        error: error.message || 'Error al eliminar área' 
      });
    }
  }
};

module.exports = areaController;
