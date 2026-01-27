const { Usuario, Conjunto } = require('../models');
const { generarToken } = require('../middleware/auth');

const authController = {
  async register(req, res) {
    try {
      const { nombre, apellido, email, telefono, cedula, usuario, contraseña, tipo_usuario, conjuntos } = req.body;

      // Validaciones manejadas por express-validator

      const usuarioExiste = await Usuario.findOne({ 
        where: { 
          $or: [
            { email },
            { usuario },
            { cedula: cedula || null }
          ]
        }
      });
      
      if (usuarioExiste) {
        return res.status(400).json({ error: 'El email, usuario o cédula ya están registrados' });
      }

      const nuevoUsuario = await Usuario.create({
        nombre,
        apellido,
        email,
        telefono,
        cedula,
        usuario,
        contraseña,
        tipo_usuario: tipo_usuario || 'usuario'
      });

      // Asignar conjuntos si se proporcionan
      if (conjuntos && Array.isArray(conjuntos) && conjuntos.length > 0) {
        await nuevoUsuario.setConjuntos(conjuntos);
      }

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
        mensaje: 'Usuario registrado exitosamente',
        usuario: usuarioCreado
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  },

  async login(req, res) {
    try {
      const { usuario, contraseña } = req.body;

      // Validaciones manejadas por express-validator

      const usuarioEncontrado = await Usuario.findOne({ 
        where: { usuario },
        include: [{
          model: Conjunto,
          as: 'conjuntos',
          attributes: ['id', 'nombre_conjunto'],
          through: { attributes: [] }
        }]
      });
      
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
          tipo_usuario: usuarioEncontrado.tipo_usuario,
          conjuntos: usuarioEncontrado.conjuntos || []
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
