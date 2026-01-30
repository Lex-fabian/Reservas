const { Configuracion } = require('../models');

const configuracionController = {
  // Obtener la configuración actual (asumimos que solo hay una o tomamos la primera/última)
  async getConfig(req, res) {
    try {
      const config = await Configuracion.findOne();
      if (!config) {
        return res.json({ 
          banco: '', 
          tipo_cuenta: 'Ahorro', 
          numero_cuenta: '', 
          nombre_titular: '',
          cedula_titular: ''
        });
      }
      res.json(config);
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      res.status(500).json({ error: 'Error al obtener configuración' });
    }
  },

  // Crear o actualizar la configuración
  async updateConfig(req, res) {
    try {
      const { banco, tipo_cuenta, numero_cuenta, nombre_titular, cedula_titular } = req.body;

      // Verificar permisos
      if (req.usuario.tipo_usuario !== 'superadmin') {
        return res.status(403).json({ error: 'No tienes permiso para modificar la configuración' });
      }

      let config = await Configuracion.findOne();

      if (config) {
        // Actualizar existente
        config.banco = banco;
        config.tipo_cuenta = tipo_cuenta;
        config.numero_cuenta = numero_cuenta;
        config.nombre_titular = nombre_titular;
        config.cedula_titular = cedula_titular;
        await config.save();
      } else {
        // Crear nueva
        config = await Configuracion.create({
          banco,
          tipo_cuenta,
          numero_cuenta,
          nombre_titular,
          cedula_titular
        });
      }

      res.json({
        message: 'Configuración actualizada exitosamente',
        config
      });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(500).json({ error: 'Error al actualizar configuración' });
    }
  }
};

module.exports = configuracionController;
