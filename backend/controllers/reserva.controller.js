const reservaService = require('../services/reserva.service');

const reservaController = {
  async crear(req, res) {
    try {
      const reserva = await reservaService.crear(req.usuario, req.body);

      res.status(201).json({
        message: 'Reserva creada exitosamente',
        reserva
      });
    } catch (error) {
      console.error('Error al crear reserva:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al crear reserva' });
    }
  },

  async obtenerTodas(req, res) {
    try {
      const reservas = await reservaService.obtenerTodas(req.usuario, req.query);

      res.json({ reservas });
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al obtener reservas' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const reserva = await reservaService.obtenerPorId(req.params.id, req.usuario);

      res.json({ reserva });
    } catch (error) {
      console.error('Error al obtener reserva:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al obtener reserva' });
    }
  },

  async actualizar(req, res) {
    try {
      const reserva = await reservaService.actualizar(req.params.id, req.usuario, req.body);

      res.json({
        message: 'Reserva actualizada exitosamente',
        reserva
      });
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al actualizar reserva' });
    }
  },

  async confirmar(req, res) {
    try {
      const reserva = await reservaService.confirmar(req.params.id);

      res.json({
        message: 'Reserva confirmada exitosamente',
        reserva
      });
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al confirmar reserva' });
    }
  },

  async cancelar(req, res) {
    try {
      const reserva = await reservaService.cancelar(req.params.id, req.usuario);

      res.json({
        message: 'Reserva cancelada exitosamente',
        reserva
      });
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al cancelar reserva' });
    }
  },

  async eliminar(req, res) {
    try {
      await reservaService.eliminar(req.params.id);

      res.json({ message: 'Reserva eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al eliminar reserva' });
    }
  }
};

module.exports = reservaController;
