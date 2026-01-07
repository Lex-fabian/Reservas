const { Usuario } = require('../models');
const { generarToken } = require('../middleware/auth');

const authController = {
  async register(req, res) {
    try {
      const { nombre, email, password, telefono, rol } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y password son requeridos' });
      }

      const usuarioExiste = await Usuario.findOne({ where: { email } });
      if (usuarioExiste) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const usuario = await Usuario.create({
        nombre,
        email,
        password,
        telefono,
        rol: rol || 'cliente'
      });

      const token = generarToken(usuario);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  },

  async login(req, res) {
    try {
      const { usuario, contraseña } = req.body;

      if (!usuario || !contraseña) {
        return res.status(400).json({ mensaje: 'Usuario y contraseña son requeridos' });
      }

      const usuarioEncontrado = await Usuario.findOne({ where: { usuario } });
      if (!usuarioEncontrado) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      }

      const contraseñaValida = await usuarioEncontrado.validarContraseña(contraseña);
      if (!contraseñaValida) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      }

      if (usuarioEncontrado.estado === 'inactivo') {
        return res.status(403).json({ mensaje: 'Usuario inactivo' });
      }

      const token = generarToken(usuarioEncontrado);

      res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: usuarioEncontrado.id,
          nombre: usuarioEncontrado.nombre,
          apellido: usuarioEncontrado.apellido,
          usuario: usuarioEncontrado.usuario,
          email: usuarioEncontrado.email,
          tipo_usuario: usuarioEncontrado.tipo_usuario
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
  },

  async getProfile(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.usuario.id, {
        attributes: { exclude: ['password'] }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ usuario });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }
};

module.exports = authController;
