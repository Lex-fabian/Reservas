const { AuditoriaLog, Usuario } = require('../models');
const { Op } = require('sequelize');

const auditoriaController = {
  // Obtener todos los logs de auditoría (solo superadmin)
  async obtenerTodos(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        usuarioId, 
        accion, 
        entidad,
        fechaDesde,
        fechaHasta 
      } = req.query;

      const whereClause = {};

      if (usuarioId) whereClause.usuarioId = usuarioId;
      if (accion) whereClause.accion = accion;
      if (entidad) whereClause.entidad = entidad;

      if (fechaDesde || fechaHasta) {
        whereClause.createdAt = {};
        if (fechaDesde) whereClause.createdAt[Op.gte] = new Date(fechaDesde);
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          whereClause.createdAt[Op.lte] = hasta;
        }
      }

      const offset = (page - 1) * limit;

      const { count, rows: logs } = await AuditoriaLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            attributes: ['id', 'usuario', 'nombre', 'apellido', 'tipo_usuario']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        logs,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo logs de auditoría:', error);
      res.status(500).json({ error: 'Error al obtener logs de auditoría' });
    }
  },

  // Obtener estadísticas de auditoría
  async obtenerEstadisticas(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;
      const whereClause = {};

      if (fechaDesde || fechaHasta) {
        whereClause.createdAt = {};
        if (fechaDesde) whereClause.createdAt[Op.gte] = new Date(fechaDesde);
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          whereClause.createdAt[Op.lte] = hasta;
        }
      }

      const [
        totalLogs,
        logsPorAccion,
        logsPorEntidad,
        usuariosMasActivos
      ] = await Promise.all([
        // Total de logs
        AuditoriaLog.count({ where: whereClause }),

        // Logs por tipo de acción
        AuditoriaLog.findAll({
          where: whereClause,
          attributes: [
            'accion',
            [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total']
          ],
          group: ['accion'],
          order: [[require('sequelize').literal('total'), 'DESC']]
        }),

        // Logs por entidad
        AuditoriaLog.findAll({
          where: whereClause,
          attributes: [
            'entidad',
            [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total']
          ],
          group: ['entidad'],
          order: [[require('sequelize').literal('total'), 'DESC']]
        }),

        // Usuarios más activos
        AuditoriaLog.findAll({
          where: whereClause,
          attributes: [
            'usuarioId',
            [require('sequelize').fn('COUNT', require('sequelize').col('AuditoriaLog.id')), 'total']
          ],
          include: [
            {
              model: Usuario,
              attributes: ['usuario', 'nombre', 'apellido', 'tipo_usuario']
            }
          ],
          group: ['usuarioId', 'Usuario.id'],
          order: [[require('sequelize').literal('total'), 'DESC']],
          limit: 10
        })
      ]);

      res.json({
        totalLogs,
        logsPorAccion,
        logsPorEntidad,
        usuariosMasActivos
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  // Crear log de auditoría (uso interno)
  async crear(usuarioId, accion, entidad, datos = {}) {
    try {
      const log = await AuditoriaLog.create({
        usuarioId,
        accion,
        entidad,
        entidadId: datos.entidadId || null,
        descripcion: datos.descripcion || null,
        datosAnteriores: datos.datosAnteriores ? JSON.stringify(datos.datosAnteriores) : null,
        datosNuevos: datos.datosNuevos ? JSON.stringify(datos.datosNuevos) : null,
        ip: datos.ip || null,
        userAgent: datos.userAgent || null
      });

      return log;
    } catch (error) {
      console.error('Error creando log de auditoría:', error);
      // No lanzamos error para no interrumpir la operación principal
      return null;
    }
  }
};

// Debug: verificar exportación
console.log('Exportando auditoriaController:', {
  obtenerTodos: typeof auditoriaController.obtenerTodos,
  obtenerEstadisticas: typeof auditoriaController.obtenerEstadisticas,
  crear: typeof auditoriaController.crear
});

module.exports = auditoriaController;
