const { Conjunto, Area, Usuario } = require('../models');

const conjuntoController = {
  async crear(req, res) {
    try {
      const { nombre_conjunto, direccion, estado } = req.body;

      if (!nombre_conjunto || !direccion) {
        return res.status(400).json({ error: 'Nombre y dirección son requeridos' });
      }

      const conjunto = await Conjunto.create({
        nombre_conjunto,
        direccion,
        estado: estado || 'activo'
      });

      res.status(201).json({
        mensaje: 'Conjunto creado exitosamente',
        conjunto
      });
    } catch (error) {
      console.error('Error al crear conjunto:', error);
      res.status(500).json({ error: 'Error al crear conjunto' });
    }
  },

  async obtenerTodos(req, res) {
    try {
      const { estado } = req.query;
      const whereClause = {};

      if (estado) whereClause.estado = estado;

      // Restricción RBAC: Si no es SuperAdmin, solo ver conjuntos asignados
      if (req.usuario.tipo_usuario !== 'superadmin') {
        // Obtener conjuntos asignados al usuario
        const usuario = await Usuario.findByPk(req.usuario.id, {
          include: [{
            model: Conjunto,
            as: 'conjuntos',
            attributes: ['id']
          }]
        });

        if (!usuario) {
           return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const misConjuntosIds = usuario.conjuntos.map(c => c.id);
        
        // Agregar filtro por IDs de conjuntos asignados
        if (misConjuntosIds.length > 0) {
          whereClause.id = misConjuntosIds;
        } else {
          // Si no tiene conjuntos, retornar arreglo vacío inmediatamente
           return res.json({ conjuntos: [] });
        }
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

      res.json({ conjuntos });
    } catch (error) {
      console.error('Error al obtener conjuntos:', error);
      res.status(500).json({ error: 'Error al obtener conjuntos' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const conjunto = await Conjunto.findByPk(id, {
        include: [{
          model: Area,
          as: 'Areas'
        }]
      });

      if (!conjunto) {
        return res.status(404).json({ error: 'Conjunto no encontrado' });
      }

      res.json({ conjunto });
    } catch (error) {
      console.error('Error al obtener conjunto:', error);
      res.status(500).json({ error: 'Error al obtener conjunto' });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre_conjunto, direccion, estado } = req.body;

      const conjunto = await Conjunto.findByPk(id);

      if (!conjunto) {
        return res.status(404).json({ error: 'Conjunto no encontrado' });
      }

      await conjunto.update({
        nombre_conjunto: nombre_conjunto || conjunto.nombre_conjunto,
        direccion: direccion || conjunto.direccion,
        estado: estado || conjunto.estado
      });

      res.json({
        mensaje: 'Conjunto actualizado exitosamente',
        conjunto
      });
    } catch (error) {
      console.error('Error al actualizar conjunto:', error);
      res.status(500).json({ error: 'Error al actualizar conjunto' });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const conjunto = await Conjunto.findByPk(id);

      if (!conjunto) {
        return res.status(404).json({ error: 'Conjunto no encontrado' });
      }

      await conjunto.destroy();

      res.json({ mensaje: 'Conjunto eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar conjunto:', error);
      res.status(500).json({ error: 'Error al eliminar conjunto' });
    }
  }
};

module.exports = conjuntoController;
