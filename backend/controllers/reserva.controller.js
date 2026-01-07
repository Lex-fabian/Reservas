const { Reserva, Usuario } = require('../models');
const { Op } = require('sequelize');

const reservaController = {
  // Crear nueva reserva
  async crear(req, res) {
    try {
      const { servicio, fecha, hora, duracion, notas, precio } = req.body;
      const usuarioId = req.usuario.id;

      if (!servicio || !fecha || !hora) {
        return res.status(400).json({ error: 'Servicio, fecha y hora son requeridos' });
      }

      const reserva = await Reserva.create({
        usuarioId,
        servicio,
        fecha,
        hora,
        duracion: duracion || 60,
        notas,
        precio,
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

  // Obtener todas las reservas (admin ve todas, cliente solo las suyas)
  async obtenerTodas(req, res) {
    try {
      const { estado, fecha } = req.query;
      const whereClause = {};

      // Si no es admin, solo ver sus reservas
      if (req.usuario.rol !== 'admin') {
        whereClause.usuarioId = req.usuario.id;
      }

      // Filtros opcionales
      if (estado) whereClause.estado = estado;
      if (fecha) whereClause.fecha = fecha;

      const reservas = await Reserva.findAll({
        where: whereClause,
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email', 'telefono']
        }],
        order: [['fecha', 'DESC'], ['hora', 'DESC']]
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
      if (req.usuario.rol !== 'admin' && reserva.usuarioId !== req.usuario.id) {
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
      if (req.usuario.rol !== 'admin' && reserva.usuarioId !== req.usuario.id) {
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
      if (estado && req.usuario.rol === 'admin') {
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

  // Cancelar reserva
  async cancelar(req, res) {
    try {
      const { id } = req.params;

      const reserva = await Reserva.findByPk(id);

      if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Verificar permisos
      if (req.usuario.rol !== 'admin' && reserva.usuarioId !== req.usuario.id) {
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
