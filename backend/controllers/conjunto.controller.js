const conjuntoService = require('../services/conjunto.service');

const conjuntoController = {
  async crear(req, res) {
    try {
      const conjunto = await conjuntoService.crear(req.body);

      res.status(201).json({
        mensaje: 'Conjunto creado exitosamente',
        conjunto
      });
    } catch (error) {
      console.error('Error al crear conjunto:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al crear conjunto' });
    }
  },

  async obtenerTodos(req, res) {
    try {
      const conjuntos = await conjuntoService.obtenerTodos(req.usuario, req.query);

      res.json({ conjuntos });
    } catch (error) {
      console.error('Error al obtener conjuntos:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al obtener conjuntos' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const conjunto = await conjuntoService.obtenerPorId(req.params.id);

      res.json({ conjunto });
    } catch (error) {
      console.error('Error al obtener conjunto:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al obtener conjunto' });
    }
  },

  async actualizar(req, res) {
    try {
      const conjunto = await conjuntoService.actualizar(req.params.id, req.body);

      res.json({
        mensaje: 'Conjunto actualizado exitosamente',
        conjunto
      });
    } catch (error) {
      console.error('Error al actualizar conjunto:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al actualizar conjunto' });
    }
  },

  async eliminar(req, res) {
    try {
      await conjuntoService.eliminar(req.params.id);

      res.json({ mensaje: 'Conjunto eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar conjunto:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al eliminar conjunto' });
    }
  }
};

module.exports = conjuntoController;
