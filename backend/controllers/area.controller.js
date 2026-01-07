const { Area, Conjunto, Reserva } = require('../models');

const areaController = {
  async crear(req, res) {
    try {
      const { conjuntoId, nombre_area, maximo_personas, fotos, costo, tiempo_minimo, observaciones, estado } = req.body;

      if (!conjuntoId || !nombre_area || !maximo_personas) {
        return res.status(400).json({ error: 'Conjunto, nombre y capacidad son requeridos' });
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

      res.status(201).json({
        mensaje: 'Área creada exitosamente',
        area
      });
    } catch (error) {
      console.error('Error al crear área:', error);
      res.status(500).json({ error: 'Error al crear área' });
    }
  },

  async obtenerTodas(req, res) {
    try {
      const { conjuntoId, estado } = req.query;
      const whereClause = {};

      if (conjuntoId) whereClause.conjuntoId = conjuntoId;
      if (estado) whereClause.estado = estado;

      const areas = await Area.findAll({
        where: whereClause,
        include: [{
          model: Conjunto,
          attributes: ['id', 'nombre_conjunto', 'direccion']
        }],
        order: [['nombre_area', 'ASC']]
      });

      res.json({ areas });
    } catch (error) {
      console.error('Error al obtener áreas:', error);
      res.status(500).json({ error: 'Error al obtener áreas' });
    }
  },

  async obtenerPorConjunto(req, res) {
    try {
      const { conjuntoId } = req.params;

      const areas = await Area.findAll({
        where: { conjuntoId, estado: 'activo' },
        order: [['nombre_area', 'ASC']]
      });

      res.json({ areas });
    } catch (error) {
      console.error('Error al obtener áreas:', error);
      res.status(500).json({ error: 'Error al obtener áreas' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const area = await Area.findByPk(id, {
        include: [{
          model: Conjunto,
          attributes: ['id', 'nombre_conjunto', 'direccion']
        }]
      });

      if (!area) {
        return res.status(404).json({ error: 'Área no encontrada' });
      }

      res.json({ area });
    } catch (error) {
      console.error('Error al obtener área:', error);
      res.status(500).json({ error: 'Error al obtener área' });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { conjuntoId, nombre_area, maximo_personas, fotos, costo, tiempo_minimo, observaciones, estado } = req.body;

      const area = await Area.findByPk(id);

      if (!area) {
        return res.status(404).json({ error: 'Área no encontrada' });
      }

      // Validar que fotos sea una cadena si se proporciona
      if (fotos !== undefined && fotos !== null && typeof fotos !== 'string') {
        return res.status(400).json({ error: 'El formato de la imagen no es válido' });
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

      res.json({
        mensaje: 'Área actualizada exitosamente',
        area
      });
    } catch (error) {
      console.error('Error al actualizar área:', error);
      console.error('Detalles del error:', error.message);
      res.status(500).json({ 
        error: 'Error al actualizar área',
        detalle: error.message 
      });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const area = await Area.findByPk(id);

      if (!area) {
        return res.status(404).json({ error: 'Área no encontrada' });
      }

      await area.destroy();

      res.json({ mensaje: 'Área eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar área:', error);
      res.status(500).json({ error: 'Error al eliminar área' });
    }
  }
};

module.exports = areaController;
