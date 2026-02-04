const { Reserva, Usuario, Area } = require('../models');
const { Op } = require('sequelize');

class ReservaService {
  /**
   * VALIDA CAMPOS REQUERIDOS
   */
  validarCamposRequeridos(datos) {
    const { conjuntoId, areaId, fecha_reserva, hora_inicio, hora_fin, personas } = datos;

    if (!conjuntoId || !areaId || !fecha_reserva || !hora_inicio || !hora_fin || !personas) {
      const error = new Error('Todos los campos son requeridos');
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * VALIDA COMPROBANTE DE PAGO
   */
  validarComprobante(usuario, foto_comprobante) {
    if (usuario.tipo_usuario === 'usuario' && !foto_comprobante) {
      const error = new Error('El comprobante de pago es obligatorio para realizar la reserva');
      error.statusCode = 400;
      throw error;
    }

    if (foto_comprobante && typeof foto_comprobante !== 'string') {
      const error = new Error('El formato del comprobante no es válido');
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * CREA UNA NUEVA RESERVA
   */
  async crear(usuario, datos) {
    this.validarCamposRequeridos(datos);
    this.validarComprobante(usuario, datos.foto_comprobante);

    const { conjuntoId, areaId, fecha_reserva, hora_inicio, hora_fin, personas, observaciones, foto_comprobante } = datos;

    const reserva = await Reserva.create({
      usuarioId: usuario.id,
      conjuntoId,
      areaId,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      personas,
      observaciones,
      foto_comprobante,
      estado: 'pendiente'
    });

    return reserva;
  }

  /**
   * CONSTRUYE LA CLAUSULA WHERE SEGUN FILTROS Y PERMISOS RBAC
   */
  construirFiltros(usuario, queryParams) {
    const { estado, fecha_reserva, areaId, fecha_desde, fecha_hasta, todas } = queryParams;
    const whereClause = {};

    if (usuario.tipo_usuario === 'usuario' && todas !== 'true') {
      whereClause.usuarioId = usuario.id;
    }

    if (estado) {
      whereClause.estado = estado;
    }

    if (areaId) {
      whereClause.areaId = areaId;
    }

    if (fecha_desde && fecha_hasta) {
      whereClause.fecha_reserva = {
        [Op.between]: [fecha_desde, fecha_hasta]
      };
    } else if (fecha_reserva) {
      whereClause.fecha_reserva = fecha_reserva;
    }

    return whereClause;
  }

  async obtenerTodas(usuario, filtros) {
    const whereClause = this.construirFiltros(usuario, filtros);

    const reservas = await Reserva.findAll({
      where: whereClause,
      attributes: [
        'id', 'usuarioId', 'conjuntoId', 'areaId', 'fecha_reserva', 
        'hora_inicio', 'hora_fin', 'personas', 'foto_comprobante', 
        'estado', 'observaciones', 'cancelado_por', 'motivo_cancelacion', 
        'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        {
          model: Area,
          attributes: ['id', 'nombre_area', 'maximo_personas', 'conjuntoId']
        }
      ],
      order: [['fecha_reserva', 'DESC'], ['hora_inicio', 'DESC']]
    });

    return reservas;
  }

  /**
   * VERIFICA SI EL USUARIO TIENE PERMISO PARA ACCEDER A UNA RESERVA
   */
  verificarPermisos(reserva, usuario) {
    const esAdmin = usuario.tipo_usuario === 'admin' || usuario.tipo_usuario === 'superadmin';
    
    if (!esAdmin && reserva.usuarioId !== usuario.id) {
      const error = new Error('No tienes permiso para ver esta reserva');
      error.statusCode = 403;
      throw error;
    }
  }

  /**
   * OBTIENE UNA RESERVA POR ID CON VALIDACIÓN DE PERMISOS
   */
  async obtenerPorId(id, usuario) {
    const reserva = await Reserva.findByPk(id, {
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'email', 'telefono']
      }]
    });

    if (!reserva) {
      const error = new Error('Reserva no encontrada');
      error.statusCode = 404;
      throw error;
    }

    this.verificarPermisos(reserva, usuario);

    return reserva;
  }

  /**
   * ACTUALIZA UNA RESERVA EXISTENTE CON VALIDACIÓN DE PERMISOS
   */
  async actualizar(id, usuario, datos) {
    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
      const error = new Error('Reserva no encontrada');
      error.statusCode = 404;
      throw error;
    }

    this.verificarPermisos(reserva, usuario);

    const esAdmin = usuario.tipo_usuario === 'admin' || usuario.tipo_usuario === 'superadmin';
    const { servicio, fecha, hora, duracion, estado, notas, precio } = datos;

    if (servicio) reserva.servicio = servicio;
    if (fecha) reserva.fecha = fecha;
    if (hora) reserva.hora = hora;
    if (duracion) reserva.duracion = duracion;
    if (notas !== undefined) reserva.notas = notas;
    if (precio !== undefined) reserva.precio = precio;
    if (estado && esAdmin) {
      reserva.estado = estado;
    }

    await reserva.save();

    return reserva;
  }

  /**
   * CONFIRMA UNA RESERVA (SOLO ADMIN/SUPERADMIN)
   */
  async confirmar(id) {
    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
      const error = new Error('Reserva no encontrada');
      error.statusCode = 404;
      throw error;
    }

    reserva.estado = 'confirmada';
    await reserva.save();

    return reserva;
  }

  /**
   * CANCELA UNA RESERVA CON VALIDACIÓN DE PERMISOS
   */
  async cancelar(id, usuario) {
    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
      const error = new Error('Reserva no encontrada');
      error.statusCode = 404;
      throw error;
    }

    this.verificarPermisos(reserva, usuario);

    reserva.estado = 'cancelada';
    await reserva.save();

    return reserva;
  }

  /**
   * ELIMINA UNA RESERVA
   */
  async eliminar(id) {
    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
      const error = new Error('Reserva no encontrada');
      error.statusCode = 404;
      throw error;
    }

    await reserva.destroy();

    return reserva;
  }
}

module.exports = new ReservaService();
