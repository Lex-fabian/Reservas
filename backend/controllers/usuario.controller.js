const usuarioService = require('../services/usuario.service');

const usuarioController = {
  async obtenerTodos(req, res) {
    try {
      const usuarioActual = {
        esSuperAdmin: req.esSuperAdmin,
        scopeConjuntos: req.scopeConjuntos
      };

      const usuarios = await usuarioService.obtenerTodos(usuarioActual, req.query);

      res.json({ usuarios });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al obtener usuarios' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const usuarioActual = {
        id: req.usuario.id,
        esSuperAdmin: req.esSuperAdmin,
        scopeConjuntos: req.scopeConjuntos
      };

      const usuario = await usuarioService.obtenerPorId(req.params.id, usuarioActual);

      res.json({ usuario });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al obtener usuario' });
    }
  },

  async crear(req, res) {
    try {
      const usuarioActual = {
        tipo_usuario: req.usuario.tipo_usuario,
        esSuperAdmin: req.esSuperAdmin,
        scopeConjuntos: req.scopeConjuntos
      };

      const resultado = await usuarioService.crear(usuarioActual, req.body);

      res.status(201).json({
        mensaje: resultado.correoEnviado 
          ? 'Usuario creado y credenciales enviadas' 
          : 'Usuario creado, pero falló el envío de correo',
        usuario: resultado.usuario,
        contraseñaTemporal: resultado.contraseñaTemporal
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al crear usuario' });
    }
  },

  async actualizar(req, res) {
    try {
      const usuarioActual = {
        esSuperAdmin: req.esSuperAdmin,
        scopeConjuntos: req.scopeConjuntos
      };

      const resultado = await usuarioService.actualizar(req.params.id, usuarioActual, req.body);

      res.json({
        mensaje: resultado.contraseñaCambiada 
          ? 'Usuario actualizado y nueva contraseña enviada por correo' 
          : 'Usuario actualizado exitosamente',
        usuario: resultado.usuario
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al actualizar usuario' });
    }
  },

  async eliminar(req, res) {
    try {
      await usuarioService.eliminar(req.params.id);

      res.json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al eliminar usuario' });
    }
  },

  async cambiarEstado(req, res) {
    try {
      const usuarioActual = {
        esSuperAdmin: req.esSuperAdmin
      };

      const usuario = await usuarioService.cambiarEstado(
        req.params.id, 
        req.body.estado, 
        usuarioActual
      );

      res.json({ mensaje: `Usuario ${req.body.estado} correctamente`, usuario });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al cambiar estado del usuario' });
    }
  },

  async cambiarContraseñaPropia(req, res) {
    try {
      const { contraseñaActual, contraseñaNueva } = req.body;

      await usuarioService.cambiarContraseñaPropia(
        req.usuario.id,
        contraseñaActual,
        contraseñaNueva
      );

      res.json({ mensaje: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al cambiar la contraseña' });
    }
  },

  async cambiarPasswordObligatoria(req, res) {
    try {
      const { contraseñaActual, contraseñaNueva } = req.body;

      await usuarioService.cambiarPasswordObligatoria(
        req.usuario.id,
        contraseñaActual,
        contraseñaNueva
      );

      res.json({ 
        mensaje: 'Contraseña cambiada exitosamente',
        debe_cambiar_password: false
      });
    } catch (error) {
      console.error('Error al cambiar contraseña obligatoria:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Error al cambiar la contraseña' });
    }
  }
};

module.exports = usuarioController;
