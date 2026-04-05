# ARQUITECTURA DEL SISTEMA - BACKEND

## VISION GENERAL

ESTE DOCUMENTO DESCRIBE LA ARQUITECTURA DEL BACKEND DEL SISTEMA DE RESERVAS, EXPLICANDO LAS DECISIONES DE DISEÑO, PATRONES UTILIZADOS Y FLUJOS DE DATOS.

## PRINCIPIOS ARQUITECTONICOS

### 1. SEPARACION DE RESPONSABILIDADES (SEPARATION OF CONCERNS)

CADA CAPA TIENE UNA RESPONSABILIDAD CLARA Y UNICA:

```
┌──────────────────────────────────────────────────┐
│  ROUTES                                          │
│  RESPONSABILIDAD: DEFINIR ENDPOINTS Y MIDDLEWARE │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│  CONTROLLERS                                     │
│  RESPONSABILIDAD: CAPA HTTP (REQ/RES)            │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│  SERVICES                                        │
│  RESPONSABILIDAD: LOGICA DE NEGOCIO              │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│  MODELS                                          │
│  RESPONSABILIDAD: ACCESO A DATOS                 │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│  DATABASE                                        │
└──────────────────────────────────────────────────┘
```

### 2. INVERSION DE DEPENDENCIAS

LOS CONTROLLERS DEPENDEN DE SERVICES, NO AL REVES:

```javascript
// CONTROLLER DEPENDE DE SERVICE
const areaService = require('../services/area.service');

async crear(req, res) {
  const area = await areaService.crear(req.usuario, req.body);
  res.json({ area });
}
```

### 3. CODIGO REUTILIZABLE

LA LOGICA EN SERVICES PUEDE SER LLAMADA DESDE:
- CONTROLLERS (HTTP)
- MIDDLEWARE (AUDITORIA)
- JOBS/CRON (TAREAS PROGRAMADAS)
- TESTS (PRUEBAS UNITARIAS)

### 4. TESTABILIDAD

```javascript
// SERVICES SON TESTEABLES SIN HTTP
const usuario = await usuarioService.crear(adminMock, datosMock);
expect(usuario.tipo_usuario).toBe('usuario');

// CONTROLLERS SOLO MANEJAN HTTP
// SERVICES CONTIENEN LA LOGICA
```

## ARQUITECTURA DE CAPAS DETALLADA

### CAPA 1: ROUTES (ENRUTAMIENTO)

**UBICACION**: `routes/*.routes.js`

**RESPONSABILIDADES**:
- DEFINIR ENDPOINTS Y VERBOS HTTP
- ASIGNAR MIDDLEWARE EN ORDEN
- VINCULAR CON CONTROLLERS
- DOCUMENTAR API

**EJEMPLO**:
```javascript
// routes/area.routes.js
router.post('/', 
  verificarToken,                    // 1. AUTENTICACION
  validarArea(),                      // 2. VALIDACION
  capturarDatosAnteriores('area'),   // 3. CAPTURA PRE-OPERATION
  registrarAuditoria('crear', 'area'),// 4. AUDITORIA POST-OPERATION
  areaController.crear                // 5. CONTROLLER
);
```

**PATRON**: PIPELINE DE MIDDLEWARE

### CAPA 2: MIDDLEWARE (INTERCEPTORES)

**UBICACION**: `middleware/*.js`

**TIPOS**:

#### AUTENTICACION (auth.js)
```javascript
verificarToken()
  → VALIDA JWT
  → EXTRAE req.usuario
  → CALCULA req.esSuperAdmin
  → CALCULA req.scopeConjuntos
```

#### VALIDACION (validate.js)
```javascript
validarArea()
  → EXPRESS-VALIDATOR
  → VALIDA TIPOS Y FORMATOS
  → RETORNA 400 SI HAY ERRORES
```

#### AUDITORIA (auditoria.js)
```javascript
registrarAuditoria(accion, entidad)
  → INTERCEPTA res.json()
  → GENERA DESCRIPCION
  → LLAMA auditoriaService.crear()
  → NO BLOQUEA RESPONSE
```

#### CAPTURA (capturarDatosAnteriores.js)
```javascript
capturarDatosAnteriores(modelo)
  → BUSCA ENTIDAD EN DB
  → GUARDA EN req.datosAnteriores
  → PERMITE COMPARACION ANTES/DESPUES
```

**PATRON**: MIDDLEWARE CHAIN / PIPELINE

### CAPA 3: CONTROLLERS (CONTROLADORES)

**UBICACION**: `controllers/*.controller.js`

**RESPONSABILIDADES UNICAS**:
1. EXTRAER PARAMETROS DE req (body, params, query, usuario)
2. LLAMAR AL SERVICE CORRESPONDIENTE
3. FORMATEAR Y ENVIAR RESPUESTA HTTP
4. MANEJAR ERRORES CON CODIGO HTTP CORRECTO

**CARACTERISTICAS**:
- CODIGO MINIMO (50-150 LINEAS)
- NO CONTIENE LOGICA DE NEGOCIO
- NO ACCEDE A MODELOS DIRECTAMENTE
- TODOS LOS METODOS SON async

**ESTRUCTURA ESTANDAR**:
```javascript
async crear(req, res) {
  try {
    // 1. PREPARAR CONTEXTO
    const contexto = {
      usuario: req.usuario,
      esSuperAdmin: req.esSuperAdmin
    };

    // 2. DELEGAR AL SERVICE
    const resultado = await service.crear(contexto, req.body);

    // 3. RESPUESTA HTTP
    res.status(201).json({
      mensaje: 'CREADO EXITOSAMENTE',
      data: resultado
    });
  } catch (error) {
    // 4. MANEJO DE ERRORES
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      error: error.message 
    });
  }
}
```

**REDUCCION DE CODIGO LOGRADA**:
- area.controller.js: 199 → 70 LINEAS (65%)
- auditoria.controller.js: 165 → 35 LINEAS (79%)
- auth.controller.js: 125 → 56 LINEAS (55%)
- conjunto.controller.js: 153 → 72 LINEAS (53%)
- reserva.controller.js: 245 → 104 LINEAS (58%)
- usuario.controller.js: 375 → 143 LINEAS (62%)

### CAPA 4: SERVICES (SERVICIOS)

**UBICACION**: `services/*.service.js`

**RESPONSABILIDADES**:
1. LOGICA DE NEGOCIO COMPLETA
2. VALIDACIONES COMPLEJAS
3. CONTROL DE ACCESO (RBAC)
4. INTERACCION CON MODELOS
5. COMPOSICION DE QUERIES
6. MANEJO DE TRANSACCIONES
7. GENERACION DE ERRORES CON statusCode

**CARACTERISTICAS**:
- CODIGO EXTENSO (150-250 LINEAS)
- EXPORTA SINGLETON (module.exports = new Service())
- METODOS PRIVADOS PARA REUTILIZACION
- NO CONOCE req/res (INDEPENDIENTE DE HTTP)

**ESTRUCTURA TIPICA**:
```javascript
class AreaService {
  // VALIDACIONES
  validarCamposRequeridos(datos) {
    if (!datos.nombre_area) {
      const error = new Error('NOMBRE REQUERIDO');
      error.statusCode = 400;
      throw error;
    }
  }

  // RBAC
  async validarAccesoConjunto(usuario, conjuntoId) {
    if (!usuario.esSuperAdmin) {
      if (!usuario.scopeConjuntos.includes(conjuntoId)) {
        const error = new Error('ACCESO DENEGADO');
        error.statusCode = 403;
        throw error;
      }
    }
  }

  // OPERACIONES PRINCIPALES
  async crear(usuario, datos) {
    this.validarCamposRequeridos(datos);
    await this.validarAccesoConjunto(usuario, datos.conjuntoId);
    
    const area = await Area.create(datos);
    return area;
  }

  // QUERIES COMPLEJAS
  async obtenerTodas(usuario, filtros) {
    const whereClause = this.construirFiltros(filtros);
    
    if (!usuario.esSuperAdmin) {
      whereClause.conjuntoId = usuario.scopeConjuntos;
    }

    return await Area.findAll({
      where: whereClause,
      include: [Conjunto],
      order: [['nombre_area', 'ASC']]
    });
  }
}

module.exports = new AreaService();
```

**VENTAJAS**:
- REUTILIZABLE DESDE CUALQUIER PARTE
- TESTEABLE SIN SERVIDOR HTTP
- LOGICA CENTRALIZADA
- FACIL MANTENIMIENTO

### CAPA 5: MODELS (MODELOS)

**UBICACION**: `models/*.js`

**RESPONSABILIDADES**:
1. DEFINIR ESTRUCTURA DE TABLAS
2. DEFINIR RELACIONES (belongsTo, hasMany, belongsToMany)
3. METODOS DE INSTANCIA (validarContraseña)
4. HOOKS (beforeCreate, beforeUpdate)
5. SCOPES Y GETTERS/SETTERS

**CARACTERISTICAS**:
- NO CREAN TABLAS (SOLO LAS REPRESENTAN)
- SEQUELIZE INTERACTUA CON TABLAS EXISTENTES
- DEFINEN MAPEO OBJETO-RELACIONAL

**EJEMPLO COMPLETO**:
```javascript
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class Usuario extends Model {
    // RELACIONES
    static associate(models) {
      Usuario.hasMany(models.Reserva, {
        foreignKey: 'usuarioId',
        as: 'Reservas'
      });
      Usuario.belongsToMany(models.Conjunto, {
        through: 'UsuarioConjunto',
        as: 'conjuntos'
      });
    }

    // METODO DE INSTANCIA
    validarContraseña(contraseña) {
      return bcrypt.compareSync(contraseña, this.contraseña);
    }
  }

  Usuario.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo_usuario: {
      type: DataTypes.ENUM('superadmin', 'admin', 'usuario'),
      defaultValue: 'usuario'
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    hooks: {
      // HOOK: HASH AUTOMATICO
      beforeCreate: async (usuario) => {
        if (usuario.contraseña) {
          usuario.contraseña = bcrypt.hashSync(usuario.contraseña, 10);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('contraseña')) {
          usuario.contraseña = bcrypt.hashSync(usuario.contraseña, 10);
        }
      }
    }
  });

  return Usuario;
};
```

### CAPA 6: DATABASE (BASE DE DATOS)

**UBICACION**: MySQL (NAVICAT/WORKBENCH)

**RESPONSABILIDAD**: ALMACENAMIENTO PERSISTENTE

**TABLAS PRINCIPALES**:
- usuarios
- conjuntos
- areas
- reservas
- auditoria_logs
- configuracion
- usuario_conjunto (PIVOT)

**IMPORTANTE**: 
- TABLAS CREADAS MANUALMENTE
- SEQUELIZE NO USA MIGRATIONS EN ESTE PROYECTO
- MODELS SOLO MAPEAN TABLAS EXISTENTES

## PATRONES DE DISEÑO IMPLEMENTADOS

### 1. SINGLETON (SERVICES)

```javascript
class AreaService { /* ... */ }
module.exports = new AreaService(); // UNA SOLA INSTANCIA
```

**VENTAJA**: MISMO ESTADO COMPARTIDO, EFICIENCIA DE MEMORIA

### 2. MIDDLEWARE CHAIN / PIPELINE

```javascript
router.post('/', 
  middleware1,  // AUTENTICACION
  middleware2,  // VALIDACION
  middleware3,  // CAPTURA
  middleware4,  // AUDITORIA
  controller    // HANDLER
);
```

**VENTAJA**: CODIGO MODULAR Y REUTILIZABLE

### 3. DEPENDENCY INJECTION

```javascript
// CONTROLLER RECIBE SERVICE INYECTADO
const areaService = require('../services/area.service');

// NO INSTANCIA DIRECTAMENTE
// const service = new AreaService(); ✗
```

**VENTAJA**: DESACOPLAMIENTO, FACILITA TESTING

### 4. FACTORY (MIDDLEWARE)

```javascript
// MIDDLEWARE FACTORY
const registrarAuditoria = (accion, entidad) => {
  return async (req, res, next) => {
    // GENERA MIDDLEWARE PERSONALIZADO
  };
};
```

**VENTAJA**: MIDDLEWARE PARAMETRIZABLE

### 5. INTERCEPTOR (AUDITORIA)

```javascript
// INTERCEPTA RESPONSE
const originalJson = res.json;
res.json = function(data) {
  registrarLog(data);
  return originalJson.call(this, data);
};
```

**VENTAJA**: AUDITORIA TRANSPARENTE SIN MODIFICAR CODIGO

### 6. REPOSITORY (SERVICE + MODEL)

```javascript
// SERVICE ACTUA COMO REPOSITORY
class AreaService {
  async obtenerPorId(id) {
    return await Area.findByPk(id, { include: [...] });
  }
}
```

**VENTAJA**: ABSTRACCION DEL ACCESO A DATOS

## FLUJO DE DATOS COMPLETO

### EJEMPLO: ACTUALIZAR AREA

```
1. CLIENT
   PUT /api/areas/5
   HEADERS: { Authorization: "Bearer TOKEN" }
   BODY: { maximo_personas: 25, costo: 60000 }

2. ROUTE
   routes/area.routes.js
   → DEFINE ENDPOINT
   → ASIGNA MIDDLEWARE CHAIN

3. MIDDLEWARE: verificarToken()
   middleware/auth.js
   → VALIDA JWT
   → EXTRAE: req.usuario = { id: 10, tipo_usuario: 'admin' }
   → CALCULA: req.esSuperAdmin = false
   → OBTIENE CONJUNTOS: req.scopeConjuntos = [1, 2]

4. MIDDLEWARE: validarArea()
   validators/area.validator.js + middleware/validate.js
   → VALIDA: maximo_personas ES NUMERO
   → VALIDA: costo ES NUMERO
   → SI FALLA: RETORNA 400

5. MIDDLEWARE: capturarDatosAnteriores('area')
   middleware/capturarDatosAnteriores.js
   → BUSCA: Area.findByPk(5, { include: Conjunto })
   → GUARDA: req.datosAnteriores = {
       id: 5,
       nombre_area: "PISCINA",
       maximo_personas: 20,
       costo: 50000,
       Conjunto: { id: 1, nombre_conjunto: "CONJUNTO A" }
     }

6. MIDDLEWARE: registrarAuditoria('actualizar', 'area')
   middleware/auditoria.js
   → INTERCEPTA res.json()
   → ESPERA RESPUESTA DEL CONTROLLER

7. CONTROLLER: areaController.actualizar()
   controllers/area.controller.js
   → EXTRAE: id = req.params.id
   → EXTRAE: datos = req.body
   → LLAMA: areaService.actualizar(id, req.usuario, datos)

8. SERVICE: areaService.actualizar()
   services/area.service.js
   → BUSCA: const area = await Area.findByPk(5)
   → VALIDA: if (!area) throw error(404)
   → RBAC: validarAccesoConjunto(usuario, area.conjuntoId)
   → ACTUALIZA: await area.update(datos)
   → RECARGA: await area.reload({ include: Conjunto })
   → RETORNA: area

9. CONTROLLER (CONTINUACION)
   → RECIBE: area ACTUALIZADA
   → RESPONDE: res.json({ mensaje: '...', area })

10. MIDDLEWARE: registrarAuditoria (CONTINUACION)
    → DETECTA RESPONSE EXITOSA (200)
    → COMPARA: req.datosAnteriores vs req.body
    → GENERA DESCRIPCION:
      "JUAN PEREZ ACTUALIZO AREA PISCINA: CAPACIDAD: 20 → 25 PERSONAS, TARIFA: $50000 → $60000/HORA"
    → LLAMA: auditoriaService.crear(10, 'actualizar', 'area', {
        entidadId: 5,
        descripcion: '...',
        datosAnteriores: { ... },
        datosNuevos: { ... },
        ip: '192.168.0.100',
        userAgent: 'Mozilla/5.0...'
      })

11. AUDITORIA SERVICE
    services/auditoria.service.js
    → CREA: AuditoriaLog.create({ ... })
    → NO BLOQUEA RESPONSE

12. RESPONSE AL CLIENT
    200 OK
    {
      mensaje: "AREA ACTUALIZADA EXITOSAMENTE",
      area: {
        id: 5,
        nombre_area: "PISCINA",
        maximo_personas: 25,
        costo: 60000,
        Conjunto: { id: 1, nombre_conjunto: "CONJUNTO A" }
      }
    }
```

## CONTROL DE ACCESO (RBAC)

### NIVELES Y PERMISOS

```
┌─────────────────────────────────────────────────────┐
│ SUPERADMIN                                          │
│ - ACCESO TOTAL                                      │
│ - PUEDE CREAR ADMINS                                │
│ - VE TODOS LOS CONJUNTOS                            │
│ - MODIFICA CONFIGURACION GLOBAL                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ADMIN                                               │
│ - ACCESO LIMITADO A CONJUNTOS ASIGNADOS             │
│ - PUEDE CREAR USUARIOS                              │
│ - GESTIONA AREAS DE SU SCOPE                        │
│ - VE RESERVAS DE SU SCOPE                           │
│ - NO PUEDE VER OTROS CONJUNTOS                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ USUARIO                                             │
│ - VE SOLO SUS PROPIAS RESERVAS                      │
│ - CREA RESERVAS EN SU CONJUNTO                      │
│ - DEBE SUBIR COMPROBANTE                            │
│ - CAMBIA SU PROPIA CONTRASEÑA                       │
└─────────────────────────────────────────────────────┘
```

### IMPLEMENTACION EN CAPAS

#### MIDDLEWARE (CALCULO DE SCOPE)
```javascript
// middleware/auth.js
const usuario = await Usuario.findByPk(decoded.id, {
  include: [{ model: Conjunto, as: 'conjuntos' }]
});

req.usuario = usuario;
req.esSuperAdmin = usuario.tipo_usuario === 'superadmin';
req.scopeConjuntos = usuario.conjuntos.map(c => c.id);
```

#### SERVICE (VALIDACION DE ACCESO)
```javascript
// services/area.service.js
async validarAccesoConjunto(usuario, conjuntoId) {
  if (usuario.tipo_usuario === 'superadmin') {
    return; // ACCESO TOTAL
  }

  const tieneAcceso = usuario.scopeConjuntos.includes(conjuntoId);
  if (!tieneAcceso) {
    const error = new Error('NO TIENES ACCESO A ESTE CONJUNTO');
    error.statusCode = 403;
    throw error;
  }
}

async crear(usuario, datos) {
  await this.validarAccesoConjunto(usuario, datos.conjuntoId);
  // CONTINUAR SOLO SI TIENE ACCESO
}
```

#### SERVICE (FILTRADO DE DATOS)
```javascript
async obtenerTodas(usuario, filtros) {
  const whereClause = {};

  // RBAC: FILTRAR POR SCOPE
  if (!usuario.esSuperAdmin) {
    whereClause.conjuntoId = usuario.scopeConjuntos;
  }

  return await Area.findAll({ where: whereClause });
}
```

## SISTEMA DE AUDITORIA

### COMPONENTES

```
┌─────────────────────────────────────────────┐
│ capturarDatosAnteriores                     │
│ - EJECUTA ANTES DE UPDATE/DELETE            │
│ - GUARDA ESTADO PREVIO                      │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ CONTROLLER                                  │
│ - EJECUTA OPERACION                         │
│ - GENERA RESPUESTA                          │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ registrarAuditoria                          │
│ - INTERCEPTA RESPONSE                       │
│ - COMPARA ANTES/DESPUES                     │
│ - GENERA DESCRIPCION                        │
│ - LLAMA auditoriaService.crear()            │
└─────────────────────────────────────────────┘
```

### GENERACION DE DESCRIPCIONES

```javascript
// CREAR
"JUAN PEREZ CREO AREA PISCINA CON CAPACIDAD 20 PERSONAS Y TARIFA $50000/HORA"

// ACTUALIZAR
"JUAN PEREZ ACTUALIZO AREA PISCINA: CAPACIDAD: 15 → 20 PERSONAS, TARIFA: $40000 → $50000/HORA"

// ELIMINAR
"JUAN PEREZ ELIMINO AREA PISCINA (CAPACIDAD: 20 PERSONAS, TARIFA: $50000/HORA)"

// CAMBIAR ESTADO
"JUAN PEREZ CAMBIO ESTADO DE USUARIO #5 A INACTIVO"

// CONFIRMAR RESERVA
"MARIA LOPEZ CONFIRMO RESERVA DE SALON SOCIAL PROGRAMADA PARA 15/02/2026 18:00"
```

### ESTRUCTURA DEL LOG

```javascript
{
  id: 1523,
  usuarioId: 10,
  accion: 'actualizar',
  entidad: 'area',
  entidadId: 5,
  descripcion: 'JUAN PEREZ ACTUALIZO AREA PISCINA: ...',
  datosAnteriores: '{"maximo_personas":20,"costo":50000}',
  datosNuevos: '{"maximo_personas":25,"costo":60000}',
  ip: '192.168.0.100',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  createdAt: '2026-02-04T15:30:45.000Z'
}
```

## MANEJO DE ERRORES

### PATRON ESTANDARIZADO

```javascript
// EN SERVICE
if (!area) {
  const error = new Error('AREA NO ENCONTRADA');
  error.statusCode = 404;
  throw error;
}

// EN CONTROLLER
catch (error) {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ 
    error: error.message || 'ERROR INTERNO DEL SERVIDOR'
  });
}
```

### CODIGOS HTTP USADOS

- **200**: OPERACION EXITOSA
- **201**: RECURSO CREADO
- **400**: ERROR DE VALIDACION / DATOS INVALIDOS
- **401**: NO AUTENTICADO / TOKEN INVALIDO
- **403**: SIN PERMISOS / ACCESO DENEGADO
- **404**: RECURSO NO ENCONTRADO
- **500**: ERROR INTERNO DEL SERVIDOR

## SEGURIDAD

### CAPAS DE SEGURIDAD

```
1. RATE LIMITING
   → LIMITA REQUESTS POR IP
   → PREVIENE ATAQUES DE FUERZA BRUTA

2. HELMET
   → HEADERS DE SEGURIDAD HTTP
   → XSS, CLICKJACKING, ETC

3. CORS
   → CONTROL DE ORIGENES
   → SOLO FRONTEND AUTORIZADO

4. JWT
   → TOKENS FIRMADOS
   → EXPIRACION AUTOMATICA

5. BCRYPT
   → HASH DE CONTRASEÑAS
   → SALT AUTOMATICO

6. EXPRESS-VALIDATOR
   → VALIDACION DE INPUTS
   → SANITIZACION

7. RBAC
   → CONTROL DE ACCESO
   → SCOPE POR CONJUNTO
```

### FLUJO DE AUTENTICACION

```
1. LOGIN
   POST /api/auth/login
   { usuario: "juan", contraseña: "abc123" }

2. VALIDACION
   → BUSCAR USUARIO EN DB
   → COMPARAR HASH CON bcrypt
   → VERIFICAR ESTADO ACTIVO

3. GENERACION TOKEN
   const token = jwt.sign(
     { id: usuario.id, tipo: usuario.tipo_usuario },
     JWT_SECRET,
     { expiresIn: '24h' }
   );

4. RESPONSE
   { token: "eyJhbGc...", usuario: { id, nombre, ... } }

5. REQUESTS POSTERIORES
   HEADERS: { Authorization: "Bearer eyJhbGc..." }
   → verificarToken() MIDDLEWARE
   → DECODIFICA TOKEN
   → CARGA req.usuario
```

## ESCALABILIDAD Y MANTENIMIENTO

### AGREGAR NUEVA ENTIDAD

```
1. CREAR TABLA EN MySQL
   CREATE TABLE productos (
     id INT PRIMARY KEY AUTO_INCREMENT,
     nombre VARCHAR(100),
     precio DECIMAL(10,2)
   );

2. CREAR MODEL
   models/Producto.js
   → DEFINIR CAMPOS
   → DEFINIR RELACIONES

3. CREAR SERVICE
   services/producto.service.js
   → validarCampos()
   → crear()
   → obtenerTodos()
   → obtenerPorId()
   → actualizar()
   → eliminar()

4. CREAR CONTROLLER
   controllers/producto.controller.js
   → DELEGAR A SERVICE
   → MANEJAR HTTP

5. CREAR ROUTES
   routes/producto.routes.js
   → DEFINIR ENDPOINTS
   → ASIGNAR MIDDLEWARE

6. REGISTRAR EN server.js
   app.use('/api/productos', productoRoutes);
```

### AGREGAR NUEVA FUNCIONALIDAD

```
1. AGREGAR METODO EN SERVICE
   async calcularTotal(productoId, cantidad) {
     const producto = await Producto.findByPk(productoId);
     return producto.precio * cantidad;
   }

2. AGREGAR ENDPOINT EN ROUTES
   router.post('/calcular', controller.calcularTotal);

3. AGREGAR METODO EN CONTROLLER
   async calcularTotal(req, res) {
     const total = await service.calcularTotal(...);
     res.json({ total });
   }
```

## MEJORES PRACTICAS APLICADAS

### 1. CODIGO LIMPIO
- NOMBRES DESCRIPTIVOS
- FUNCIONES PEQUEÑAS (< 50 LINEAS)
- UN PROPOSITO POR FUNCION
- COMENTARIOS EXPLICATIVOS

### 2. DRY (DON'T REPEAT YOURSELF)
- LOGICA REUTILIZABLE EN SERVICES
- MIDDLEWARE COMPARTIDOS
- VALIDACIONES CENTRALIZADAS

### 3. SOLID PRINCIPLES
- **S**: CADA CLASE UNA RESPONSABILIDAD
- **O**: EXTENDIBLE SIN MODIFICAR
- **L**: SERVICES INTERCAMBIABLES
- **I**: INTERFACES PEQUEÑAS
- **D**: DEPENDENCIA DE ABSTRACCIONES

### 4. SEGURIDAD FIRST
- NO CONTRASEÑAS EN CODIGO
- VALIDACION DE TODOS LOS INPUTS
- RBAC ESTRICTO
- AUDITORIA COMPLETA

### 5. TESTEABLE
- SERVICES SIN DEPENDENCIA HTTP
- LOGICA SEPARADA DE INFRAESTRUCTURA
- INYECCION DE DEPENDENCIAS

## DIAGRAMAS DE SECUENCIA

### CREAR RESERVA

```
CLIENT         ROUTE      AUTH-MW     VALID-MW    AUDIT-MW    CONTROLLER    SERVICE       MODEL        DB
  │              │           │            │           │           │            │            │           │
  ├─POST────────>│           │            │           │           │            │            │           │
  │              ├──────────>│            │           │           │            │            │           │
  │              │           ├─verify JWT─┤           │           │            │            │           │
  │              │           │            │           │           │            │            │           │
  │              │           ├───req.usuario          │           │            │            │           │
  │              │           │            │           │           │            │            │           │
  │              ├───────────────────────>│           │           │            │            │           │
  │              │           │            ├─validate──┤           │            │            │           │
  │              │           │            │           │           │            │            │           │
  │              ├──────────────────────────────────>│           │            │            │           │
  │              │           │            │           ├─intercept─┤            │            │           │
  │              │           │            │           │           │            │            │           │
  │              ├─────────────────────────────────────────────>│            │            │           │
  │              │           │            │           │           ├──────────>│            │           │
  │              │           │            │           │           │            ├─validar────┤           │
  │              │           │            │           │           │            ├─RBAC───────┤           │
  │              │           │            │           │           │            ├───────────>│           │
  │              │           │            │           │           │            │            ├─INSERT───>│
  │              │           │            │           │           │            │            │<──────────┤
  │              │           │            │           │           │            │<───────────┤           │
  │              │           │            │           │           │<───reserva─┤            │           │
  │              │           │            │           │           ├─res.json()->            │           │
  │              │           │            │           │<─response─┤            │            │           │
  │              │           │            │           ├─log audit─┤            │            │           │
  │<─201 CREATED─┤           │            │           │           │            │            │           │
```

## CONCLUSIONES

ESTA ARQUITECTURA PROPORCIONA:

✓ **SEPARACION CLARA DE RESPONSABILIDADES**
✓ **CODIGO MANTENIBLE Y ESCALABLE**
✓ **ALTA TESTABILIDAD**
✓ **SEGURIDAD ROBUSTA**
✓ **AUDITORIA COMPLETA**
✓ **RBAC FLEXIBLE**
✓ **CODIGO REUTILIZABLE**
✓ **FACIL DEBUGGING**
✓ **PATRONES PROBADOS**
✓ **DOCUMENTACION COMPLETA**

**AUTOR**: SISTEMA DE RESERVAS V2.0
**FECHA**: FEBRERO 2026
**ARQUITECTURA**: LAYERED ARCHITECTURE + SERVICE LAYER PATTERN
