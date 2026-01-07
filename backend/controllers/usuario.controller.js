const { Usuario, Reserva } = require('../models');

const usuarioController = {
  async obtenerTodos(req, res) {
    try {
      const { estado, tipo_usuario } = req.query;
      const whereClause = {};

      if (estado) whereClause.estado = estado;
      if (tipo_usuario) whereClause.tipo_usuario = tipo_usuario;

      const usuarios = await Usuario.findAll({
        where: whereClause,
        attributes: { exclude: ['contraseña'] },
        include: [{
          model: Reserva,
          as: 'Reservas',
          attributes: ['id', 'estado']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({ usuarios });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ['contraseña'] },
        include: [{
          model: Reserva,
          as: 'Reservas'
        }]
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ usuario });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, email, telefono, cedula, estado, tipo_usuario } = req.body;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await usuario.update({
        nombre: nombre || usuario.nombre,
        apellido: apellido || usuario.apellido,
        email: email || usuario.email,
        telefono: telefono || usuario.telefono,
        cedula: cedula || usuario.cedula,
        estado: estado || usuario.estado,
        tipo_usuario: tipo_usuario || usuario.tipo_usuario
      });

      const usuarioActualizado = await Usuario.findByPk(id, {
        attributes: { exclude: ['contraseña'] }
      });

      res.json({
        mensaje: 'Usuario actualizado exitosamente',
        usuario: usuarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await usuario.destroy();

      res.json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }
};

module.exports = usuarioController;
