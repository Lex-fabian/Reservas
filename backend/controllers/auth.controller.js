const { Usuario } = require('../models');
const { generarToken } = require('../middleware/auth');

const authController = {
  // Registro de usuario
  async register(req, res) {
    try {
      const { nombre, email, password, telefono, rol } = req.body;

      // Validar datos
      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y password son requeridos' });
      }

      // Verificar si el usuario ya existe
      const usuarioExiste = await Usuario.findOne({ where: { email } });
      if (usuarioExiste) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Crear usuario
      const usuario = await Usuario.create({
        nombre,
        email,
        password,
        telefono,
        rol: rol || 'cliente'
      });

      // Generar token
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

  // Login de usuario
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar datos
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y password son requeridos' });
      }

      // Buscar usuario
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar password
      const passwordValido = await usuario.validarPassword(password);
      if (!passwordValido) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar si está activo
      if (!usuario.activo) {
        return res.status(403).json({ error: 'Usuario inactivo' });
      }

      // Generar token
      const token = generarToken(usuario);

      res.json({
        message: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  },

  // Obtener perfil del usuario autenticado
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
