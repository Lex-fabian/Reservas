const { Configuracion } = require('../models');

class ConfiguracionService {
  obtenerConfiguracionPorDefecto() {
    return {
      banco: '',
      tipo_cuenta: 'Ahorro',
      numero_cuenta: '',
      nombre_titular: '',
      cedula_titular: ''
    };
  }

  /**
   * OBTENER LA CONFIGURACION DEL SISTEMA
   */
  async obtener() {
    const config = await Configuracion.findOne();
    
    if (!config) {
      return this.obtenerConfiguracionPorDefecto();
    }

    return config;
  }

  /**
   * CREA O ACTUALIZA LA CONFIGURACION DEL SISTEMA
   */
  async actualizarOCrear(datosConfiguracion) {
    const { 
      banco, 
      tipo_cuenta, 
      numero_cuenta, 
      nombre_titular, 
      cedula_titular 
    } = datosConfiguracion;

    let config = await Configuracion.findOne();

    if (config) {
      // ACTUALIZAR EXISTENTE
      config.banco = banco;
      config.tipo_cuenta = tipo_cuenta;
      config.numero_cuenta = numero_cuenta;
      config.nombre_titular = nombre_titular;
      config.cedula_titular = cedula_titular;
      await config.save();
    } else {
      // CREAR NUEVA (PRIMERA VEZ)
      config = await Configuracion.create({
        banco,
        tipo_cuenta,
        numero_cuenta,
        nombre_titular,
        cedula_titular
      });
    }

    return config;
  }

  /**
   * VALIDA SI EL USUARIO TIENE PERMISOS PARA MODIFICAR LA CONFIGURACION
   */
  validarPermisos(usuario) {
    if (usuario.tipo_usuario !== 'superadmin') {
      const error = new Error('No tienes permiso para modificar la configuración');
      error.statusCode = 403;
      throw error;
    }
  }
}

module.exports = new ConfiguracionService();
