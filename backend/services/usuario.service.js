const { Usuario, Reserva, Conjunto } = require('../models');
const { enviarCredenciales, enviarCambioContraseña } = require('./email.service');
const { generarPasswordSeguro, validarPasswordSeguro } = require('../validators/password.validator');

class UsuarioService {
  /**
   * GENERA UNA CONTRASEÑA TEMPORAL SEGURA
   */
  generarContraseñaTemporal() {
    return generarPasswordSeguro(12);
  }

  validarPermisoCrearRol(usuarioActual, tipo_usuario) {
    const esSuperAdmin = usuarioActual.tipo_usuario === 'superadmin';
    
    if (!esSuperAdmin && (tipo_usuario === 'admin' || tipo_usuario === 'superadmin')) {
      const error = new Error('No tienes permisos para crear este rol');
      error.statusCode = 403;
      throw error;
    }
  }

  validarConjuntosScope(esSuperAdmin, scopeConjuntos, conjuntos) {
    if (!esSuperAdmin && conjuntos && conjuntos.length > 0) {
      const conjuntosValidos = conjuntos.every(id => scopeConjuntos.includes(id));
      if (!conjuntosValidos) {
        const error = new Error('No puedes asignar conjuntos fuera de tu jurisdicción');
        error.statusCode = 403;
        throw error;
      }
    }
  }

  async verificarEmailDisponible(email, excludeId = null) {
    const whereClause = { email };
    if (excludeId) {
      whereClause.id = { [require('sequelize').Op.ne]: excludeId };
    }

    const emailExiste = await Usuario.findOne({ where: whereClause });
    if (emailExiste) {
      const error = new Error('El email ya está registrado');
      error.statusCode = 400;
      throw error;
    }
  }

  async verificarUsuarioDisponible(usuario, excludeId = null) {
    const whereClause = { usuario };
    if (excludeId) {
      whereClause.id = { [require('sequelize').Op.ne]: excludeId };
    }

    const usuarioExiste = await Usuario.findOne({ where: whereClause });
    if (usuarioExiste) {
      const error = new Error('El nombre de usuario ya está en uso');
      error.statusCode = 400;
      throw error;
    }
  }

  async construirFiltrosUsuarios(usuarioActual, filtros) {
    const { estado, tipo_usuario } = filtros;
    const whereClause = {};

    if (estado) whereClause.estado = estado;
    if (tipo_usuario) whereClause.tipo_usuario = tipo_usuario;
    if (!usuarioActual.esSuperAdmin && usuarioActual.scopeConjuntos) {
      const usuariosIds = await Usuario.findAll({
        include: [{
          model: Conjunto,
          as: 'conjuntos',
          where: { id: usuarioActual.scopeConjuntos },
          attributes: []
        }],
        attributes: ['id']
      });
      
      whereClause.id = usuariosIds.map(u => u.id);
    }

    return whereClause;
  }

  async obtenerTodos(usuarioActual, filtros = {}) {
    const whereClause = await this.construirFiltrosUsuarios(usuarioActual, filtros);

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
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return usuarios;
  }

  validarAccesoUsuario(usuarioActual, usuarioObjetivo) {
    if (!usuarioActual.esSuperAdmin && usuarioActual.scopeConjuntos) {
      const pertenece = usuarioObjetivo.conjuntos.some(c => 
        usuarioActual.scopeConjuntos.includes(c.id)
      );
      
      if (!pertenece && usuarioObjetivo.tipo_usuario !== 'admin') {
        if (usuarioObjetivo.id !== usuarioActual.id) {
          const error = new Error('Acceso denegado a este usuario');
          error.statusCode = 403;
          throw error;
        }
      }
    }
  }

  async obtenerPorId(id, usuarioActual) {
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['contraseña'] },
      include: [
        { model: Reserva, as: 'Reservas' },
        {
          model: Conjunto,
          as: 'conjuntos',
          attributes: ['id', 'nombre_conjunto'],
          through: { attributes: [] }
        }
      ]
    });

    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    this.validarAccesoUsuario(usuarioActual, usuario);

    return usuario;
  }


  async crear(usuarioActual, datos) {
    const { nombre, apellido, email, telefono, cedula, usuario, tipo_usuario, estado, conjuntos } = datos;
    this.validarPermisoCrearRol(usuarioActual, tipo_usuario);
    this.validarConjuntosScope(usuarioActual.esSuperAdmin, usuarioActual.scopeConjuntos, conjuntos);
    await this.verificarEmailDisponible(email);
    await this.verificarUsuarioDisponible(usuario);
    const contraseñaTemporal = this.generarContraseñaTemporal();

    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email,
      telefono: telefono || null,
      cedula: cedula || null,
      usuario,
      contraseña: contraseñaTemporal,
      tipo_usuario: tipo_usuario || 'usuario',
      estado: estado || 'activo',
      debe_cambiar_password: true
    });

    if (conjuntos && Array.isArray(conjuntos) && conjuntos.length > 0) {
      await nuevoUsuario.setConjuntos(conjuntos);
    }

    const correoEnviado = await enviarCredenciales(email, usuario, contraseñaTemporal);
    const usuarioCreado = await Usuario.findByPk(nuevoUsuario.id, {
      attributes: { exclude: ['contraseña'] },
      include: [{
        model: Conjunto,
        as: 'conjuntos',
        attributes: ['id', 'nombre_conjunto'],
        through: { attributes: [] }
      }]
    });

    return {
      usuario: usuarioCreado,
      contraseñaTemporal,
      correoEnviado
    };
  }

  async actualizar(id, usuarioActual, datos) {
    const { nombre, apellido, email, telefono, cedula, estado, tipo_usuario, contraseña, conjuntos } = datos;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const updateData = {
      nombre: nombre || usuario.nombre,
      apellido: apellido || usuario.apellido,
      email: email || usuario.email,
      telefono: telefono || usuario.telefono,
      cedula: cedula || usuario.cedula,
      estado: estado || usuario.estado,
      tipo_usuario: tipo_usuario || usuario.tipo_usuario
    };

    let contraseñaCambiada = false;
    if (contraseña && contraseña.trim() !== '') {
      updateData.contraseña = contraseña;
      contraseñaCambiada = true;
    }

    await usuario.update(updateData);

    if (conjuntos && Array.isArray(conjuntos)) {
      this.validarConjuntosScope(usuarioActual.esSuperAdmin, usuarioActual.scopeConjuntos, conjuntos);
      await usuario.setConjuntos(conjuntos);
    }

    if (contraseñaCambiada) {
      try {
        await enviarCambioContraseña(usuario.email, usuario.usuario, contraseña);
      } catch (emailError) {
        console.error(' Error al enviar correo de cambio de contraseña:', emailError.message);
      }
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

    return {
      usuario: usuarioActualizado,
      contraseñaCambiada
    };
  }

  async eliminar(id) {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    await usuario.destroy();
    return usuario;
  }

  async cambiarEstado(id, estado, usuarioActual) {
    if (!['activo', 'inactivo'].includes(estado)) {
      const error = new Error('Estado inválido');
      error.statusCode = 400;
      throw error;
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (!usuarioActual.esSuperAdmin && usuario.tipo_usuario === 'superadmin') {
      const error = new Error('No tienes permiso para modificar a un SuperAdmin');
      error.statusCode = 403;
      throw error;
    }

    usuario.estado = estado;
    await usuario.save();

    return usuario;
  }

  async cambiarContraseñaPropia(usuarioId, contraseñaActual, contraseñaNueva) {
    if (!contraseñaActual || !contraseñaNueva) {
      const error = new Error('Se requieren ambas contraseñas');
      error.statusCode = 400;
      throw error;
    }

    const usuario = await Usuario.findByPk(usuarioId);
    
    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const contraseñaValida = await usuario.validarContraseña(contraseñaActual);
    if (!contraseñaValida) {
      const error = new Error('Contraseña actual incorrecta');
      error.statusCode = 401;
      throw error;
    }

    usuario.contraseña = contraseñaNueva;
    usuario.debe_cambiar_password = false;
    await usuario.save();

    try {
      await enviarCambioContraseña(usuario.email, usuario.usuario, contraseñaNueva);
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
    }

    return usuario;
  }

  async cambiarPasswordObligatoria(usuarioId, contraseñaActual, contraseñaNueva) {
    // Validar que la nueva contraseña sea segura
    const validacion = validarPasswordSeguro(contraseñaNueva);
    if (!validacion.valido) {
      const error = new Error(validacion.errores.join('. '));
      error.statusCode = 400;
      throw error;
    }

    const usuario = await Usuario.findByPk(usuarioId);
    
    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (!usuario.debe_cambiar_password) {
      const error = new Error('No es necesario cambiar la contraseña');
      error.statusCode = 400;
      throw error;
    }

    const contraseñaValida = await usuario.validarContraseña(contraseñaActual);
    if (!contraseñaValida) {
      const error = new Error('Contraseña temporal incorrecta');
      error.statusCode = 401;
      throw error;
    }

    usuario.contraseña = contraseñaNueva;
    usuario.debe_cambiar_password = false;
    await usuario.save();

    return usuario;
  }
}

module.exports = new UsuarioService();
