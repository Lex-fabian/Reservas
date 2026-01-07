const { Usuario, Reserva, Conjunto } = require('../models');

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
        include: [
          {
            model: Reserva,
            as: 'Reservas',
            attributes: ['id', 'estado']
          },
          {
            model: Conjunto,
            as: 'conjuntos',
            attributes: ['id', 'nombre_conjunto'],
            through: { attributes: [] } // Excluir atributos de la tabla intermedia
          }
        ],
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
        include: [
          {
            model: Reserva,
            as: 'Reservas'
          },
          {
            model: Conjunto,
            as: 'conjuntos',
            attributes: ['id', 'nombre_conjunto'],
            through: { attributes: [] }
          }
        ]
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

  async crear(req, res) {
    try {
      const { nombre, apellido, email, telefono, cedula, usuario, contraseña, tipo_usuario, estado, conjuntos } = req.body;

      // Validar campos requeridos
      if (!nombre || !apellido || !email || !usuario || !contraseña) {
        return res.status(400).json({ error: 'Nombre, apellido, email, usuario y contraseña son requeridos' });
      }

      // Verificar si el email ya existe
      const emailExiste = await Usuario.findOne({ where: { email } });
      if (emailExiste) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Verificar si el usuario ya existe
      const usuarioExiste = await Usuario.findOne({ where: { usuario } });
      if (usuarioExiste) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }

      // Crear el usuario
      const nuevoUsuario = await Usuario.create({
        nombre,
        apellido,
        email,
        telefono: telefono || null,
        cedula: cedula || null,
        usuario,
        contraseña,
        tipo_usuario: tipo_usuario || 'usuario',
        estado: estado || 'activo'
      });

      // Asignar conjuntos si se proporcionan
      if (conjuntos && Array.isArray(conjuntos) && conjuntos.length > 0) {
        await nuevoUsuario.setConjuntos(conjuntos);
      }

      // Obtener el usuario creado con sus conjuntos
      const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id, {
        attributes: { exclude: ['contraseña'] },
        include: [{
          model: Conjunto,
          as: 'conjuntos',
          attributes: ['id', 'nombre_conjunto'],
          through: { attributes: [] }
        }]
      });

      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        usuario: usuarioCreado
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, email, telefono, cedula, estado, tipo_usuario, conjuntos } = req.body;

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

      // Actualizar conjuntos si se proporcionan
      if (conjuntos && Array.isArray(conjuntos)) {
        await usuario.setConjuntos(conjuntos);
      }

      const usuarioActualizado = await Usuario.findByPk(id, {
        attributes: { exclude: ['contraseña'] },
        include: [{
          model: Conjunto,
          as: 'conjuntos',
          attributes: ['id', 'nombre_conjunto'],
          through: { attributes: [] }
        }]
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
