const { Area, Conjunto, Usuario } = require('../models');
const { Op } = require('sequelize');

class AreaService {
  async validarAccesoConjunto(usuario, conjuntoId) {
    if (usuario.tipo_usuario === 'superadmin') {
      return true;
    }

    const usuarioConConjuntos = await Usuario.findByPk(usuario.id, {
      include: [{
        model: Conjunto,
        as: 'conjuntos',
        attributes: ['id']
      }]
    });

    if (!usuarioConConjuntos) {
      throw new Error('Usuario no encontrado');
    }

    const misConjuntosIds = usuarioConConjuntos.conjuntos.map(c => c.id);
    return misConjuntosIds.includes(Number(conjuntoId));
  }

  async obtenerConjuntosAccesibles(usuario) {
    if (usuario.tipo_usuario === 'superadmin') {
      return null; 
    }

    const usuarioConConjuntos = await Usuario.findByPk(usuario.id, {
      include: [{
        model: Conjunto,
        as: 'conjuntos',
        attributes: ['id']
      }]
    });

    if (!usuarioConConjuntos) {
      throw new Error('Usuario no encontrado');
    }

    return usuarioConConjuntos.conjuntos.map(c => c.id);
  }

  
  async crear(datosArea, usuario) {
    const { 
      conjuntoId, 
      nombre_area, 
      maximo_personas, 
      fotos, 
      costo, 
      tiempo_minimo, 
      observaciones, 
      estado 
    } = datosArea;

    if (!conjuntoId || !nombre_area || !maximo_personas) {
      throw new Error('Conjunto, nombre y capacidad son requeridos');
    }

    if (usuario.tipo_usuario !== 'superadmin') {
      const tieneAcceso = await this.validarAccesoConjunto(usuario, conjuntoId);
      if (!tieneAcceso) {
        const error = new Error('No tienes permiso para crear áreas en este conjunto');
        error.statusCode = 403;
        throw error;
      }
    }

    const area = await Area.create({
      conjuntoId,
      nombre_area,
      maximo_personas,
      fotos,
      costo: costo || 0,
      tiempo_minimo: tiempo_minimo || 60,
      observaciones,
      estado: estado || 'activo'
    });

    return area;
  }

  async obtenerTodas(filtros, usuario) {
    const { conjuntoId, estado } = filtros;
    const whereClause = {};

    if (conjuntoId) whereClause.conjuntoId = conjuntoId;
    if (estado) whereClause.estado = estado;
    if (usuario.tipo_usuario !== 'superadmin') {
      const misConjuntosIds = await this.obtenerConjuntosAccesibles(usuario);
      
      if (misConjuntosIds.length === 0) {
        return [];
      }

      if (whereClause.conjuntoId) {
        if (!misConjuntosIds.includes(Number(whereClause.conjuntoId))) {
          const error = new Error('No tienes acceso a las áreas de este conjunto');
          error.statusCode = 403;
          throw error;
        }
      } else {
        whereClause.conjuntoId = misConjuntosIds;
      }
    }

    const areas = await Area.findAll({
      where: whereClause,
      include: [{
        model: Conjunto,
        attributes: ['id', 'nombre_conjunto', 'direccion']
      }],
      order: [['nombre_area', 'ASC']]
    });

    return areas;
  }

  async obtenerPorConjunto(conjuntoId) {
    const areas = await Area.findAll({
      where: { conjuntoId, estado: 'activo' },
      order: [['nombre_area', 'ASC']]
    });

    return areas;
  }

  async obtenerPorId(id) {
    const area = await Area.findByPk(id, {
      include: [{
        model: Conjunto,
        attributes: ['id', 'nombre_conjunto', 'direccion']
      }]
    });

    if (!area) {
      const error = new Error('Área no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return area;
  }

  async actualizar(id, datosActualizacion) {
    const { 
      conjuntoId, 
      nombre_area, 
      maximo_personas, 
      fotos, 
      costo, 
      tiempo_minimo, 
      observaciones, 
      estado 
    } = datosActualizacion;

    const area = await Area.findByPk(id);

    if (!area) {
      const error = new Error('Área no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (fotos !== undefined && fotos !== null && typeof fotos !== 'string') {
      const error = new Error('El formato de la imagen no es válido');
      error.statusCode = 400;
      throw error;
    }

    await area.update({
      conjuntoId: conjuntoId || area.conjuntoId,
      nombre_area: nombre_area || area.nombre_area,
      maximo_personas: maximo_personas || area.maximo_personas,
      fotos: fotos !== undefined ? fotos : area.fotos,
      costo: costo !== undefined ? costo : area.costo,
      tiempo_minimo: tiempo_minimo || area.tiempo_minimo,
      observaciones: observaciones !== undefined ? observaciones : area.observaciones,
      estado: estado || area.estado
    });

    return area;
  }

  async eliminar(id) {
    const area = await Area.findByPk(id);

    if (!area) {
      const error = new Error('Área no encontrada');
      error.statusCode = 404;
      throw error;
    }

    await area.destroy();
    return { mensaje: 'Área eliminada exitosamente' };
  }
}

module.exports = new AreaService();
