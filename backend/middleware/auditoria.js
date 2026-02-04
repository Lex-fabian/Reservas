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
      descripcion = generarDescripcionCrear(nombreUsuario, entidad, req.body, datosRespuesta);
      break;
    case 'actualizar':
      descripcion = generarDescripcionActualizar(nombreUsuario, entidad, req.params.id, req.body, req.datosAnteriores);
      break;
    case 'eliminar':
      descripcion = generarDescripcionEliminar(nombreUsuario, entidad, req.params.id, req.datosAnteriores);
      break;
    case 'login':
      descripcion = `${nombreUsuario} inició sesión`;
      break;
    case 'logout':
      descripcion = `${nombreUsuario} cerró sesión`;
      break;
    case 'confirmar_reserva':
      descripcion = generarDescripcionReserva(nombreUsuario, 'confirmó', req.params.id, datosRespuesta);
      break;
    case 'cancelar_reserva':
      descripcion = generarDescripcionReserva(nombreUsuario, 'canceló', req.params.id, datosRespuesta);
      break;
    case 'cambiar_estado':
      descripcion = generarDescripcionCambioEstado(nombreUsuario, entidad, req.params.id, req.body);
      break;
    default:
      descripcion = `${nombreUsuario} realizó la acción ${accion} en ${entidad}`;
  }

  return descripcion;
}

/**
 * Genera descripción detallada para creación
 */
function generarDescripcionCrear(nombreUsuario, entidad, datos, respuesta) {
  let detalles = '';
  
  switch (entidad) {
    case 'usuario':
      detalles = `usuario "${datos.usuario || datos.email}" (${datos.nombre} ${datos.apellido || ''}) como ${datos.tipo_usuario}`;
      break;
    case 'area':
      detalles = `área "${datos.nombre_area}" con capacidad ${datos.maximo_personas} personas y tarifa $${datos.costo}/hora`;
      break;
    case 'conjunto':
      detalles = `conjunto "${datos.nombre_conjunto}" en ${datos.direccion}`;
      break;
    case 'reserva':
      const fechaInicio = new Date(datos.fecha_inicio).toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const fechaFin = new Date(datos.fecha_fin).toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      detalles = `reserva del ${fechaInicio} al ${fechaFin}`;
      break;
    default:
      detalles = `registro en ${entidad}`;
  }
  
  return `${nombreUsuario} creó ${detalles}`;
}

/**
 * Genera descripción detallada para actualización
 */
function generarDescripcionActualizar(nombreUsuario, entidad, id, datosNuevos, datosAnteriores) {
  let cambios = [];
  
  switch (entidad) {
    case 'usuario':
      if (datosNuevos.nombre && datosAnteriores && datosNuevos.nombre !== datosAnteriores.nombre) {
        cambios.push(`nombre: "${datosAnteriores.nombre}" → "${datosNuevos.nombre}"`);
      }
      if (datosNuevos.email && datosAnteriores && datosNuevos.email !== datosAnteriores.email) {
        cambios.push(`email: "${datosAnteriores.email}" → "${datosNuevos.email}"`);
      }
      if (datosNuevos.tipo_usuario && datosAnteriores && datosNuevos.tipo_usuario !== datosAnteriores.tipo_usuario) {
        cambios.push(`rol: "${datosAnteriores.tipo_usuario}" → "${datosNuevos.tipo_usuario}"`);
      }
      if (datosNuevos.estado && datosAnteriores && datosNuevos.estado !== datosAnteriores.estado) {
        cambios.push(`estado: "${datosAnteriores.estado}" → "${datosNuevos.estado}"`);
      }
      break;
    case 'area':
      if (datosNuevos.nombre_area && datosAnteriores && datosNuevos.nombre_area !== datosAnteriores.nombre_area) {
        cambios.push(`nombre: "${datosAnteriores.nombre_area}" → "${datosNuevos.nombre_area}"`);
      }
      if (datosNuevos.maximo_personas && datosAnteriores && datosNuevos.maximo_personas !== datosAnteriores.maximo_personas) {
        cambios.push(`capacidad: ${datosAnteriores.maximo_personas} → ${datosNuevos.maximo_personas} personas`);
      }
      if (datosNuevos.costo && datosAnteriores && datosNuevos.costo !== datosAnteriores.costo) {
        cambios.push(`tarifa: $${datosAnteriores.costo} → $${datosNuevos.costo}/hora`);
      }
      if (datosNuevos.estado && datosAnteriores && datosNuevos.estado !== datosAnteriores.estado) {
        cambios.push(`estado: "${datosAnteriores.estado}" → "${datosNuevos.estado}"`);
      }
      break;
    case 'conjunto':
      if (datosNuevos.nombre_conjunto && datosAnteriores && datosNuevos.nombre_conjunto !== datosAnteriores.nombre_conjunto) {
        cambios.push(`nombre: "${datosAnteriores.nombre_conjunto}" → "${datosNuevos.nombre_conjunto}"`);
      }
      if (datosNuevos.direccion && datosAnteriores && datosNuevos.direccion !== datosAnteriores.direccion) {
        cambios.push(`dirección: "${datosAnteriores.direccion}" → "${datosNuevos.direccion}"`);
      }
      if (datosNuevos.estado && datosAnteriores && datosNuevos.estado !== datosAnteriores.estado) {
        cambios.push(`estado: "${datosAnteriores.estado}" → "${datosNuevos.estado}"`);
      }
      break;
    case 'reserva':
      if (datosNuevos.fecha_inicio && datosAnteriores) {
        const fechaAnt = new Date(datosAnteriores.fecha_inicio).toLocaleString('es-ES', { 
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
        });
        const fechaNueva = new Date(datosNuevos.fecha_inicio).toLocaleString('es-ES', { 
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
        });
        cambios.push(`inicio: ${fechaAnt} → ${fechaNueva}`);
      }
      if (datosNuevos.estado && datosAnteriores && datosNuevos.estado !== datosAnteriores.estado) {
        cambios.push(`estado: "${datosAnteriores.estado}" → "${datosNuevos.estado}"`);
      }
      break;
  }
  
  let nombreEntidad = entidad;
  if (datosAnteriores) {
    switch (entidad) {
      case 'usuario':
        nombreEntidad = `usuario "${datosAnteriores.usuario || datosAnteriores.email}"`;
        break;
      case 'area':
        nombreEntidad = `área "${datosAnteriores.nombre_area}"`;
        break;
      case 'conjunto':
        nombreEntidad = `conjunto "${datosAnteriores.nombre_conjunto}"`;
        break;
      case 'reserva':
        nombreEntidad = `reserva #${id}`;
        break;
    }
  }
  
  const detallesCambios = cambios.length > 0 ? `: ${cambios.join(', ')}` : '';
  return `${nombreUsuario} actualizó ${nombreEntidad}${detallesCambios}`;
}

/**
 * Genera descripción detallada para eliminación
 */
function generarDescripcionEliminar(nombreUsuario, entidad, id, datosAnteriores) {
  let detalles = `#${id}`;
  
  if (datosAnteriores) {
    switch (entidad) {
      case 'usuario':
        detalles = `usuario "${datosAnteriores.usuario || datosAnteriores.email}" (${datosAnteriores.nombre} ${datosAnteriores.apellido || ''})`;
        break;
      case 'area':
        detalles = `área "${datosAnteriores.nombre_area}" (capacidad: ${datosAnteriores.maximo_personas} personas, tarifa: $${datosAnteriores.costo}/hora)`;
        break;
      case 'conjunto':
        detalles = `conjunto "${datosAnteriores.nombre_conjunto}" ubicado en ${datosAnteriores.direccion}`;
        break;
      case 'reserva':
        const fecha = new Date(datosAnteriores.fecha_inicio).toLocaleString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit', 
          minute: '2-digit' 
        });
        detalles = `reserva #${id} del ${fecha}`;
        if (datosAnteriores.Area) {
          detalles += ` en "${datosAnteriores.Area.nombre_area}"`;
        }
        break;
    }
  }
  
  return `${nombreUsuario} eliminó ${detalles}`;
}

/**
 * Genera descripción para acciones de reserva
 */
function generarDescripcionReserva(nombreUsuario, accion, id, respuesta) {
  let detalles = `reserva #${id}`;
  
  if (respuesta && respuesta.reserva) {
    const reserva = respuesta.reserva;
    const fecha = new Date(reserva.fecha_inicio).toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    if (reserva.Area) {
      detalles = `reserva de "${reserva.Area.nombre_area}" programada para ${fecha}`;
    } else {
      detalles = `reserva #${id} del ${fecha}`;
    }
  }
  
  return `${nombreUsuario} ${accion} ${detalles}`;
}

/**
 * Genera descripción para cambio de estado
 */
function generarDescripcionCambioEstado(nombreUsuario, entidad, id, datos) {
  const nuevoEstado = datos.estado || datos.activo;
  return `${nombreUsuario} cambió estado de ${entidad} #${id} a "${nuevoEstado}"`;
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
