const { Usuario, Conjunto } = require('../models');
const { generarToken } = require('../middleware/auth');

class AuthService {
  async verificarUsuarioExistente(email, usuario, cedula) {
    const usuarioExiste = await Usuario.findOne({
      where: {
        $or: [
          { email },
          { usuario },
          { cedula: cedula || null }
        ]
      }
    });

    return usuarioExiste;
  }

  /**
   * REGISTRA UN NUEVO USUARIO
   */
  async registrar(datosUsuario) {
    const { 
      nombre, 
      apellido, 
      email, 
      telefono, 
      cedula, 
      usuario, 
      contraseña, 
      tipo_usuario, 
      conjuntos 
    } = datosUsuario;

    // VALIDAR SI EL USUARIO, EMAIL O CEDULA YA EXISTE
    const usuarioExiste = await this.verificarUsuarioExistente(email, usuario, cedula);
    
    if (usuarioExiste) {
      const error = new Error('El email, usuario o cédula ya están registrados');
      error.statusCode = 400;
      throw error;
    }

    // CREAR NUEVO USUARIO
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

    // ASIGNAR CONJUNTOS SI SE PROPORCIONAN
    if (conjuntos && Array.isArray(conjuntos) && conjuntos.length > 0) {
      await nuevoUsuario.setConjuntos(conjuntos);
    }

    // OBTENER USUARIO COMPLETO CON RELACIONES
    const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id, {
      attributes: { exclude: ['contraseña'] },
      include: [{
        model: Conjunto,
        as: 'conjuntos',
        attributes: ['id', 'nombre_conjunto'],
        through: { attributes: [] }
      }]
    });

    return usuarioCreado;
  }

  /**
   * AUTENTICA UN USUARIO Y GENERA TOKEN JWT
   */
  async login(usuario, contraseña) {
    // BUSCAR USUARIO CON SUS CONJUNTOS
    const usuarioEncontrado = await Usuario.findOne({
      where: { usuario },
      include: [{
        model: Conjunto,
        as: 'conjuntos',
        attributes: ['id', 'nombre_conjunto'],
        through: { attributes: [] }
      }]
    });

    // VALIDAR EXISTENCIA DEL USUARIO
    if (!usuarioEncontrado) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // VALIDAR CONTRASEÑA
    const contraseñaValida = await usuarioEncontrado.validarContraseña(contraseña);
    if (!contraseñaValida) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // VALIDAR ESTADO DEL USUARIO
    if (usuarioEncontrado.estado === 'inactivo') {
      const error = new Error('Usuario inactivo');
      error.statusCode = 403;
      throw error;
    }

    // GENERAR TOKEN
    const token = generarToken(usuarioEncontrado);

    // PREPARAR RESPUESTA
    return {
      token,
      debe_cambiar_password: usuarioEncontrado.debe_cambiar_password || false,
      usuario: {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        apellido: usuarioEncontrado.apellido,
        usuario: usuarioEncontrado.usuario,
        email: usuarioEncontrado.email,
        tipo_usuario: usuarioEncontrado.tipo_usuario,
        conjuntos: usuarioEncontrado.conjuntos || []
      }
    };
  }

  /**
   * Obtiene el perfil completo de un usuario
   */
  async obtenerPerfil(usuarioId) {
    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: { exclude: ['contraseña', 'password'] },
      include: [{
        model: Conjunto,
        as: 'conjuntos',
        attributes: ['id', 'nombre_conjunto'],
        through: { attributes: [] }
      }]
    });

    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return usuario;
  }
}

module.exports = new AuthService();
