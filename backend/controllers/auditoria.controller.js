const auditoriaService = require('../services/auditoria.service');

const auditoriaController = {
  async obtenerTodos(req, res) {
    try {
      const { page, limit, usuarioId, accion, entidad, fechaDesde, fechaHasta } = req.query;
      
      const filtros = { usuarioId, accion, entidad, fechaDesde, fechaHasta };
      const paginacion = { page, limit };

      const resultado = await auditoriaService.obtenerLogs(filtros, paginacion);

      res.json(resultado);
    } catch (error) {
      console.error('Error obteniendo logs de auditoría:', error);
      res.status(500).json({ error: 'Error al obtener logs de auditoría' });
    }
  },

  async obtenerEstadisticas(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;
      
      const filtros = { fechaDesde, fechaHasta };
      const estadisticas = await auditoriaService.obtenerEstadisticas(filtros);

      res.json(estadisticas);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  async crear(usuarioId, accion, entidad, datos = {}) {
    return await auditoriaService.crear(usuarioId, accion, entidad, datos);
  }
};

module.exports = auditoriaController;
