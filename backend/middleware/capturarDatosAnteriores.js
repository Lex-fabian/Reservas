const { Usuario, Area, Conjunto, Reserva } = require('../models');

/**
 * Middleware para capturar datos anteriores antes de actualizar/eliminar
 * Esto permite tener más detalle en los logs de auditoría
 */
const capturarDatosAnteriores = (modelo) => {
  return async (req, res, next) => {
    try {
      const id = req.params.id;
      if (!id) {
        return next();
      }

      let ModeloClass;
      const include = [];

      switch (modelo) {
        case 'usuario':
          ModeloClass = Usuario;
          break;
        case 'area':
          ModeloClass = Area;
          include.push({ model: Conjunto, attributes: ['nombre_conjunto'] });
          break;
        case 'conjunto':
          ModeloClass = Conjunto;
          break;
        case 'reserva':
          ModeloClass = Reserva;
          include.push(
            { model: Usuario, attributes: ['nombre', 'usuario'] },
            { model: Area, attributes: ['nombre_area'] }
          );
          break;
        default:
          return next();
      }

      const registro = await ModeloClass.findByPk(id, { include });
      
      if (registro) {
        // Guardar en req para que el middleware de auditoría lo use
        req.datosAnteriores = registro.toJSON();
      }

      next();
    } catch (error) {
      console.error('Error capturando datos anteriores:', error);
      // No interrumpir la ejecución
      next();
    }
  };
};

module.exports = { capturarDatosAnteriores };
