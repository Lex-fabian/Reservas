const { Conjunto, Area, Usuario } = require('../models');

class ConjuntoService {
  validarCamposRequeridos(datos) {
    const { nombre_conjunto, direccion } = datos;
    
    if (!nombre_conjunto || !direccion) {
      const error = new Error('Nombre y dirección son requeridos');
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * CREA UN NUEVO CONJUNTO
   */
  async crear(datos) {
    this.validarCamposRequeridos(datos);

    const { nombre_conjunto, direccion, estado } = datos;

    const conjunto = await Conjunto.create({
      nombre_conjunto,
      direccion,
      estado: estado || 'activo'
    });

    return conjunto;
  }

  async obtenerConjuntosAccesibles(usuario) {
    if (usuario.tipo_usuario === 'superadmin') {
      return null; 
    }

    const usuarioCompleto = await Usuario.findByPk(usuario.id, {
      include: [{
        model: Conjunto,
        as: 'conjuntos',
        attributes: ['id']
      }]
    });

    if (!usuarioCompleto) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const conjuntosIds = usuarioCompleto.conjuntos.map(c => c.id);
    return conjuntosIds;
  }

  /**
   * Obtiene todos los conjuntos con filtros y RBAC
   */
  async obtenerTodos(usuario, filtros = {}) {
    const { estado } = filtros;
    const whereClause = {};

    if (estado) {
      whereClause.estado = estado;
    }

    // Aplicar RBAC
    const conjuntosAccesibles = await this.obtenerConjuntosAccesibles(usuario);

    if (conjuntosAccesibles !== null) {
      // Usuario no es SuperAdmin
      if (conjuntosAccesibles.length === 0) {
        // Si no tiene conjuntos asignados, retornar vacío
        return [];
      }
      whereClause.id = conjuntosAccesibles;
    }

    const conjuntos = await Conjunto.findAll({
      where: whereClause,
      include: [{
        model: Area,
        as: 'Areas',
        attributes: ['id', 'nombre_area', 'estado']
      }],
      order: [['nombre_conjunto', 'ASC']]
    });

    return conjuntos;
  }

  /**
   * Obtiene un conjunto por ID con sus áreas
   */
  async obtenerPorId(id) {
    const conjunto = await Conjunto.findByPk(id, {
      include: [{
        model: Area,
        as: 'Areas'
      }]
    });

    if (!conjunto) {
      const error = new Error('Conjunto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return conjunto;
  }

  /**
   * Actualiza un conjunto existente
   */
  async actualizar(id, datos) {
    const conjunto = await Conjunto.findByPk(id);

    if (!conjunto) {
      const error = new Error('Conjunto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const { nombre_conjunto, direccion, estado } = datos;

    await conjunto.update({
      nombre_conjunto: nombre_conjunto || conjunto.nombre_conjunto,
      direccion: direccion || conjunto.direccion,
      estado: estado || conjunto.estado
    });

    return conjunto;
  }

  /**
   * Elimina un conjunto
   */
  async eliminar(id) {
    const conjunto = await Conjunto.findByPk(id);

    if (!conjunto) {
      const error = new Error('Conjunto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    await conjunto.destroy();
    return conjunto;
  }
}

module.exports = new ConjuntoService();
