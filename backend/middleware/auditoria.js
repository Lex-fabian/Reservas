const auditoriaController = require('../controllers/auditoria.controller');

/**
 * Middleware para registrar automáticamente acciones en la auditoría
 * Debe usarse después del middleware de autenticación
 */
const registrarAuditoria = (accion, entidad) => {
  return async (req, res, next) => {
    // Guardar el método send original
    const originalSend = res.send;
    const originalJson = res.json;

    // Obtener IP y User Agent
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Función para registrar el log
    const registrarLog = async (datosRespuesta) => {
      try {
        if (req.usuario && res.statusCode >= 200 && res.statusCode < 300) {
          const datos = {
            ip,
            userAgent,
            descripcion: generarDescripcion(accion, entidad, req, datosRespuesta)
          };

          // Para operaciones de actualización, intentar capturar datos anteriores
          if (accion === 'actualizar' && req.params.id) {
            datos.entidadId = req.params.id;
            datos.datosAnteriores = req.datosAnteriores || null;
            datos.datosNuevos = req.body;
          }

          // Para operaciones de creación, guardar el ID creado
          if (accion === 'crear' && datosRespuesta) {
            const entidadCreada = datosRespuesta[entidad] || datosRespuesta.data || datosRespuesta;
            datos.entidadId = entidadCreada?.id || null;
            datos.datosNuevos = req.body;
          }

          // Para operaciones de eliminación
          if (accion === 'eliminar' && req.params.id) {
            datos.entidadId = req.params.id;
            datos.datosAnteriores = req.datosAnteriores || null;
          }

          await auditoriaController.crear(
            req.usuario.id,
            accion,
            entidad,
            datos
          );
        }
      } catch (error) {
        console.error('Error en middleware de auditoría:', error);
        // No interrumpimos la ejecución si falla el log
      }
    };

    // Interceptar res.json
    res.json = function(data) {
      registrarLog(data);
      return originalJson.call(this, data);
    };

    // Interceptar res.send
    res.send = function(data) {
      try {
        const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
        registrarLog(jsonData);
      } catch (e) {
        // Si no es JSON, continuar sin registrar
      }
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Genera una descripción legible para el log
 */
function generarDescripcion(accion, entidad, req, datosRespuesta) {
  const usuario = req.usuario;
  const nombreUsuario = `${usuario.nombre || usuario.usuario}`;
  
  let descripcion = '';

  switch (accion) {
    case 'crear':
      descripcion = `${nombreUsuario} creó un nuevo registro en ${entidad}`;
      break;
    case 'actualizar':
      descripcion = `${nombreUsuario} actualizó el registro ${req.params.id} en ${entidad}`;
      break;
    case 'eliminar':
      descripcion = `${nombreUsuario} eliminó el registro ${req.params.id} en ${entidad}`;
      break;
    case 'login':
      descripcion = `${nombreUsuario} inició sesión`;
      break;
    case 'logout':
      descripcion = `${nombreUsuario} cerró sesión`;
      break;
    case 'confirmar_reserva':
      descripcion = `${nombreUsuario} confirmó la reserva ${req.params.id}`;
      break;
    case 'cancelar_reserva':
      descripcion = `${nombreUsuario} canceló la reserva ${req.params.id}`;
      break;
    case 'cambio_password':
      descripcion = `${nombreUsuario} cambió su contraseña`;
      break;
    default:
      descripcion = `${nombreUsuario} realizó la acción ${accion} en ${entidad}`;
  }

  return descripcion;
}

/**
 * Registrar login
 */
const registrarLogin = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (data.token && data.usuario) {
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      auditoriaController.crear(
        data.usuario.id,
        'login',
        'auth',
        {
          ip,
          userAgent,
          descripcion: `${data.usuario.nombre || data.usuario.usuario} inició sesión`
        }
      );
    }
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = {
  registrarAuditoria,
  registrarLogin
};
