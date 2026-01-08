const { Reserva, Usuario, Area } = require('../models');
const { Op } = require('sequelize');

const reservaController = {
  async crear(req, res) {
    try {
      const { conjuntoId, areaId, fecha_reserva, hora_inicio, hora_fin, personas, observaciones } = req.body;
      const usuarioId = req.usuario.id;

      if (!conjuntoId || !areaId || !fecha_reserva || !hora_inicio || !hora_fin || !personas) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      const reserva = await Reserva.create({
        usuarioId,
        conjuntoId,
        areaId,
        fecha_reserva,
        hora_inicio,
        hora_fin,
        personas,
        observaciones,
        estado: 'pendiente'
      });

      res.status(201).json({
        message: 'Reserva creada exitosamente',
        reserva
      });
    } catch (error) {
      console.error('Error al crear reserva:', error);
      res.status(500).json({ error: 'Error al crear reserva' });
    }
  },

  async obtenerTodas(req, res) {
    try {
      const { estado, fecha_reserva, areaId, fecha_desde, fecha_hasta, todas } = req.query;
      const whereClause = {};

      // Si no se solicita ver todas y el usuario es tipo 'usuario', filtrar por sus reservas
      if (req.usuario.tipo_usuario === 'usuario' && todas !== 'true') {
        whereClause.usuarioId = req.usuario.id;
      }

      if (estado) whereClause.estado = estado;
      if (fecha_reserva) whereClause.fecha_reserva = fecha_reserva;
      if (areaId) whereClause.areaId = areaId;
      
      // Filtro de rango de fechas para el calendario
      if (fecha_desde && fecha_hasta) {
        whereClause.fecha_reserva = {
          [Op.between]: [fecha_desde, fecha_hasta]
        };
      }

      const reservas = await Reserva.findAll({
        where: whereClause,
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

      res.json({ reservas });
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      res.status(500).json({ error: 'Error al obtener reservas' });
    }
  },

  // Obtener una reserva por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const reserva = await Reserva.findByPk(id, {
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email', 'telefono']
        }]
      });

      if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Verificar permisos
      const esAdmin = req.usuario.tipo_usuario === 'admin' || req.usuario.tipo_usuario === 'superadmin';
      if (!esAdmin && reserva.usuarioId !== req.usuario.id) {
        return res.status(403).json({ error: 'No tienes permiso para ver esta reserva' });
      }

      res.json({ reserva });
    } catch (error) {
      console.error('Error al obtener reserva:', error);
      res.status(500).json({ error: 'Error al obtener reserva' });
    }
  },

  // Actualizar reserva
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { servicio, fecha, hora, duracion, estado, notas, precio } = req.body;

      const reserva = await Reserva.findByPk(id);

      if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Verificar permisos
      const esAdmin = req.usuario.tipo_usuario === 'admin' || req.usuario.tipo_usuario === 'superadmin';
      if (!esAdmin && reserva.usuarioId !== req.usuario.id) {
        return res.status(403).json({ error: 'No tienes permiso para modificar esta reserva' });
      }

      // Actualizar campos
      if (servicio) reserva.servicio = servicio;
      if (fecha) reserva.fecha = fecha;
      if (hora) reserva.hora = hora;
      if (duracion) reserva.duracion = duracion;
      if (notas !== undefined) reserva.notas = notas;
      if (precio !== undefined) reserva.precio = precio;
      
      // Solo admin puede cambiar el estado
      if (estado && esAdmin) {
        reserva.estado = estado;
      }

      await reserva.save();

      res.json({
        message: 'Reserva actualizada exitosamente',
        reserva
      });
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      res.status(500).json({ error: 'Error al actualizar reserva' });
    }
  },

  // Confirmar reserva (solo admin/superadmin)
  async confirmar(req, res) {
    try {
      const { id } = req.params;

      const reserva = await Reserva.findByPk(id);

      if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      reserva.estado = 'confirmada';
      await reserva.save();

      res.json({
        message: 'Reserva confirmada exitosamente',
        reserva
      });
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      res.status(500).json({ error: 'Error al confirmar reserva' });
    }
  },

  // Cancelar reserva
  async cancelar(req, res) {
    try {
      const { id } = req.params;

      const reserva = await Reserva.findByPk(id);

      if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Verificar permisos
      const esAdmin = req.usuario.tipo_usuario === 'admin' || req.usuario.tipo_usuario === 'superadmin';
      if (!esAdmin && reserva.usuarioId !== req.usuario.id) {
        return res.status(403).json({ error: 'No tienes permiso para cancelar esta reserva' });
      }

      reserva.estado = 'cancelada';
      await reserva.save();

      res.json({
        message: 'Reserva cancelada exitosamente',
        reserva
      });
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      res.status(500).json({ error: 'Error al cancelar reserva' });
    }
  },

  // Eliminar reserva (solo admin)
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const reserva = await Reserva.findByPk(id);

      if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      await reserva.destroy();

      res.json({ message: 'Reserva eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      res.status(500).json({ error: 'Error al eliminar reserva' });
    }
  }
};

module.exports = reservaController;
