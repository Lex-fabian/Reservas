const { AuditoriaLog, Usuario } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

class AuditoriaService {
  construirFiltros(filtros) {
    const { usuarioId, accion, entidad, fechaDesde, fechaHasta } = filtros;
    const whereClause = {};

    if (usuarioId) whereClause.usuarioId = usuarioId;
    if (accion) whereClause.accion = accion;
    if (entidad) whereClause.entidad = entidad;
    if (fechaDesde || fechaHasta) {
      whereClause.createdAt = {};
      
      if (fechaDesde) {
        whereClause.createdAt[Op.gte] = new Date(fechaDesde);
      }
      
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = hasta;
      }
    }

    return whereClause;
  }

  async obtenerLogs(filtros, paginacion) {
    const { page = 1, limit = 50 } = paginacion;
    const whereClause = this.construirFiltros(filtros);
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

    return {
      logs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * OBTENER ESTADISTICAR DE AUDITORIA
   */
  async obtenerEstadisticas(filtros) {
    const whereClause = this.construirFiltros(filtros);

    const [
      totalLogs,
      logsPorAccion,
      logsPorEntidad,
      usuariosMasActivos
    ] = await Promise.all([
      this.contarTotalLogs(whereClause),
      this.agruparPorAccion(whereClause),
      this.agruparPorEntidad(whereClause),
      this.obtenerUsuariosMasActivos(whereClause)
    ]);

    return {
      totalLogs,
      logsPorAccion,
      logsPorEntidad,
      usuariosMasActivos
    };
  }

  /**
   * CONTEO TOTAL DE LOGS
   */
  async contarTotalLogs(whereClause) {
    return await AuditoriaLog.count({ where: whereClause });
  }

  /**
   * AGRUPACIONES DE LOGS DEPENDIENDO DE TIPO
   */
  async agruparPorAccion(whereClause) {
    return await AuditoriaLog.findAll({
      where: whereClause,
      attributes: [
        'accion',
        [fn('COUNT', col('id')), 'total']
      ],
      group: ['accion'],
      order: [[literal('total'), 'DESC']]
    });
  }

  /**
   * AGRUPACIONES DE LOGS DEPENDIENDO DE ENTIDAD
   */
  async agruparPorEntidad(whereClause) {
    return await AuditoriaLog.findAll({
      where: whereClause,
      attributes: [
        'entidad',
        [fn('COUNT', col('id')), 'total']
      ],
      group: ['entidad'],
      order: [[literal('total'), 'DESC']]
    });
  }

  /**
   * USUARIOS MAS ACTIVOS
   */
  async obtenerUsuariosMasActivos(whereClause) {
    return await AuditoriaLog.findAll({
      where: whereClause,
      attributes: [
        'usuarioId',
        [fn('COUNT', col('AuditoriaLog.id')), 'total']
      ],
      include: [
        {
          model: Usuario,
          attributes: ['usuario', 'nombre', 'apellido', 'tipo_usuario']
        }
      ],
      group: ['usuarioId', 'Usuario.id'],
      order: [[literal('total'), 'DESC']],
      limit: 10
    });
  }

  /**
   * CREA UN NUEVO REGISTRO DE AUDITORIA
   */
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
      return null;
    }
  }
}

module.exports = new AuditoriaService();
