# BACKEND - SISTEMA DE RESERVAS DE AREAS COMUNES

## DESCRIPCION GENERAL

BACKEND API REST PARA SISTEMA DE GESTION DE RESERVAS DE AREAS COMUNES EN CONJUNTOS RESIDENCIALES. PERMITE ADMINISTRAR USUARIOS, CONJUNTOS, AREAS, RESERVAS Y MANTENER UN REGISTRO COMPLETO DE AUDITORIA DE TODAS LAS OPERACIONES.

## FUNCIONALIDADES PRINCIPALES

### GESTION DE USUARIOS
- REGISTRO Y AUTENTICACION CON JWT
- ROLES: SUPERADMIN, ADMIN, USUARIO
- GENERACION AUTOMATICA DE CONTRASEÑAS TEMPORALES
- CAMBIO OBLIGATORIO DE CONTRASEÑA EN PRIMER LOGIN
- ASIGNACION DE USUARIOS A CONJUNTOS (RBAC)
- ESTADOS: ACTIVO/INACTIVO

### GESTION DE CONJUNTOS
- CREACION Y ADMINISTRACION DE CONJUNTOS RESIDENCIALES
- ASIGNACION DE ADMINISTRADORES POR CONJUNTO
- CONTROL DE ACCESO BASADO EN SCOPE (RBAC)

### GESTION DE AREAS
- CREACION DE AREAS COMUNES (SALON SOCIAL, PISCINA, BBQ, ETC)
- CONFIGURACION DE CAPACIDAD MAXIMA Y TARIFA POR HORA
- ESTADOS: DISPONIBLE/MANTENIMIENTO/INACTIVO
- RESTRICCION DE ACCESO SEGUN CONJUNTO ASIGNADO

### SISTEMA DE RESERVAS
- CREACION DE RESERVAS CON VALIDACION DE DISPONIBILIDAD
- SUBIDA DE COMPROBANTES DE PAGO (BASE64)
- ESTADOS: PENDIENTE/CONFIRMADA/CANCELADA
- CONFIRMACION Y CANCELACION DE RESERVAS
- VALIDACION DE PERMISOS SEGUN ROL

### AUDITORIA COMPLETA
- REGISTRO AUTOMATICO DE TODAS LAS OPERACIONES
- DESCRIPCION DETALLADA CON DATOS ANTES/DESPUES
- CAPTURA DE IP Y USER AGENT
- LOGS DE LOGIN/LOGOUT
- ESTADISTICAS Y REPORTES
- FILTRADO POR USUARIO, ACCION, ENTIDAD Y FECHAS

### CONFIGURACION DEL SISTEMA
- DATOS BANCARIOS PARA PAGOS
- GESTIONADA SOLO POR SUPERADMIN

## ARQUITECTURA

### PATRON DE CAPAS

```
┌─────────────────────────────────────────┐
│           CLIENTE (HTTP)                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          ROUTES (RUTAS)                 │
│  - DEFINICION DE ENDPOINTS              │
│  - ASIGNACION DE MIDDLEWARE             │
│  - VINCULACION CON CONTROLLERS          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        MIDDLEWARE (INTERCEPTORES)       │
│  - AUTENTICACION (JWT)                  │
│  - VALIDACION DE DATOS                  │
│  - AUDITORIA AUTOMATICA                 │
│  - CAPTURA DE DATOS ANTERIORES          │
│  - SEGURIDAD (RATE LIMIT, CORS)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      CONTROLLERS (CONTROLADORES)        │
│  - CAPA HTTP                            │
│  - EXTRACCION DE PARAMETROS REQ/RES     │
│  - DELEGACION A SERVICIOS               │
│  - MANEJO DE RESPUESTAS                 │
│  - CODIGO MINIMO (~50-150 LINEAS)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        SERVICES (SERVICIOS)             │
│  - LOGICA DE NEGOCIO                    │
│  - VALIDACIONES COMPLEJAS               │
│  - RBAC Y CONTROL DE ACCESO             │
│  - INTERACCION CON MODELOS              │
│  - TRANSACCIONES Y QUERIES              │
│  - REUTILIZABLE Y TESTEABLE             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         MODELS (MODELOS)                │
│  - MAPEO TABLA ↔ OBJETO                 │
│  - DEFINICION DE RELACIONES             │
│  - METODOS DE INSTANCIA                 │
│  - HOOKS (HASH PASSWORDS)               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        BASE DE DATOS (MySQL)            │
│  - TABLAS CREADAS MANUALMENTE           │
│  - SEQUELIZE INTERACTUA CON ELLAS       │
└─────────────────────────────────────────┘
```

### ESTRUCTURA DE DIRECTORIOS

```
backend/
├── server.js                    # PUNTO DE ENTRADA
├── config/
│   └── database.js              # CONFIGURACION SEQUELIZE
├── routes/
│   ├── auth.routes.js           # ENDPOINTS AUTENTICACION
│   ├── usuario.routes.js        # ENDPOINTS USUARIOS
│   ├── conjunto.routes.js       # ENDPOINTS CONJUNTOS
│   ├── area.routes.js           # ENDPOINTS AREAS
│   ├── reserva.routes.js        # ENDPOINTS RESERVAS
│   ├── auditoria.routes.js      # ENDPOINTS AUDITORIA
│   └── configuracion.routes.js  # ENDPOINTS CONFIGURACION
├── middleware/
│   ├── auth.js                  # VERIFICACION JWT + RBAC
│   ├── validate.js              # VALIDACION EXPRESS-VALIDATOR
│   ├── security.js              # RATE LIMIT, CORS, HELMET
│   ├── auditoria.js             # REGISTRO AUTOMATICO
│   ├── capturarDatosAnteriores.js # CAPTURA PRE-UPDATE/DELETE
│   └── upload.js                # MANEJO DE ARCHIVOS
├── controllers/
│   ├── auth.controller.js       # CAPA HTTP AUTH
│   ├── usuario.controller.js    # CAPA HTTP USUARIOS
│   ├── conjunto.controller.js   # CAPA HTTP CONJUNTOS
│   ├── area.controller.js       # CAPA HTTP AREAS
│   ├── reserva.controller.js    # CAPA HTTP RESERVAS
│   ├── auditoria.controller.js  # CAPA HTTP AUDITORIA
│   └── configuracion.controller.js # CAPA HTTP CONFIG
├── services/
│   ├── auth.service.js          # LOGICA AUTENTICACION
│   ├── usuario.service.js       # LOGICA USUARIOS + RBAC
│   ├── conjunto.service.js      # LOGICA CONJUNTOS + RBAC
│   ├── area.service.js          # LOGICA AREAS + RBAC
│   ├── reserva.service.js       # LOGICA RESERVAS + PERMISOS
│   ├── auditoria.service.js     # LOGICA LOGS + ESTADISTICAS
│   ├── configuracion.service.js # LOGICA CONFIG
│   └── email.service.js         # ENVIO DE CORREOS
├── models/
│   ├── index.js                 # CONFIGURACION SEQUELIZE
│   ├── Usuario.js               # MODELO USUARIOS
│   ├── Conjunto.js              # MODELO CONJUNTOS
│   ├── Area.js                  # MODELO AREAS
│   ├── Reserva.js               # MODELO RESERVAS
│   ├── AuditoriaLog.js          # MODELO LOGS
│   └── Configuracion.js         # MODELO CONFIG
└── validators/
    └── auth.validator.js        # REGLAS DE VALIDACION
```

## FLUJO DE UNA REQUEST

### EJEMPLO: CREAR AREA

```
1. POST /api/areas
   BODY: { nombre_area: "PISCINA", maximo_personas: 20, costo: 50000 }

2. MIDDLEWARE: verificarToken()
   - VALIDA JWT
   - EXTRAE req.usuario

3. MIDDLEWARE: validarArea() 
   - VALIDA CAMPOS REQUERIDOS
   - VALIDA TIPOS DE DATOS

4. MIDDLEWARE: registrarAuditoria('crear', 'area')
   - INTERCEPTA RESPONSE
   - REGISTRA EN AUDITORIA AL COMPLETAR

5. CONTROLLER: areaController.crear()
   - EXTRAE req.body, req.usuario
   - LLAMA: areaService.crear(req.usuario, req.body)
   - RETORNA: res.status(201).json({ area })

6. SERVICE: areaService.crear()
   - VALIDA PERMISOS RBAC
   - VERIFICA ACCESO A CONJUNTO
   - LLAMA: Area.create({ ... })
   - RETORNA: area

7. MODEL: Area (SEQUELIZE)
   - EJECUTA: INSERT INTO areas (...)
   - RETORNA: INSTANCIA DEL MODELO

8. MIDDLEWARE: registrarAuditoria()
   - CREA LOG: "USUARIO X CREO AREA PISCINA"
   - GUARDA IP, USER AGENT, DATOS

9. RESPONSE: 201 CREATED
   { mensaje: "...", area: { id: 5, nombre_area: "PISCINA" ... } }
```

## SEPARACION DE RESPONSABILIDADES

### CONTROLLERS (CAPA HTTP)
```javascript
async crear(req, res) {
  try {
    const area = await areaService.crear(req.usuario, req.body);
    res.status(201).json({ mensaje: '...', area });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}
```
**RESPONSABILIDAD**: SOLO HTTP - EXTRAE PARAMETROS Y RETORNA RESPUESTAS

### SERVICES (LOGICA DE NEGOCIO)
```javascript
async crear(usuario, datos) {
  // VALIDACIONES
  this.validarCamposRequeridos(datos);
  
  // RBAC
  await this.validarAccesoConjunto(usuario, datos.conjuntoId);
  
  // QUERY
  const area = await Area.create({ ... });
  
  return area;
}
```
**RESPONSABILIDAD**: LOGICA, VALIDACIONES, RBAC, QUERIES

### MODELS (MAPEO)
```javascript
class Area extends Model {
  static associate(models) {
    Area.belongsTo(models.Conjunto);
    Area.hasMany(models.Reserva);
  }
}
```
**RESPONSABILIDAD**: ESTRUCTURA Y RELACIONES DE DATOS

## CONTROL DE ACCESO (RBAC)

### NIVELES DE ACCESO

**SUPERADMIN**
- ACCESO TOTAL A TODO EL SISTEMA
- PUEDE CREAR ADMINS
- GESTIONA CONFIGURACION GLOBAL

**ADMIN**
- ACCESO LIMITADO A SUS CONJUNTOS ASIGNADOS
- PUEDE CREAR USUARIOS
- GESTIONA AREAS Y RESERVAS DE SU SCOPE
- NO PUEDE VER/MODIFICAR OTROS CONJUNTOS

**USUARIO**
- SOLO VE SUS PROPIAS RESERVAS
- PUEDE CREAR RESERVAS EN SU CONJUNTO
- DEBE SUBIR COMPROBANTE DE PAGO
- CAMBIO DE CONTRASEÑA PROPIA

### IMPLEMENTACION RBAC

```javascript
// EN MIDDLEWARE auth.js
req.esSuperAdmin = usuario.tipo_usuario === 'superadmin';
req.scopeConjuntos = usuario.conjuntos.map(c => c.id);

// EN SERVICE
if (!usuario.esSuperAdmin && !scopeConjuntos.includes(conjuntoId)) {
  throw new Error('NO TIENES ACCESO A ESTE CONJUNTO');
}
```

## AUDITORIA AUTOMATICA

### MIDDLEWARE CHAIN

```
REQUEST → capturarDatosAnteriores() → CONTROLLER → registrarAuditoria()
```

**capturarDatosAnteriores()**
- EJECUTA ANTES DE UPDATE/DELETE
- BUSCA LA ENTIDAD EN DB
- GUARDA EN req.datosAnteriores

**registrarAuditoria()**
- INTERCEPTA RESPONSE
- COMPARA DATOS ANTES/DESPUES
- GENERA DESCRIPCION LEGIBLE
- GUARDA LOG COMPLETO

### EJEMPLO DE LOG

```
USUARIO: "Juan Perez"
ACCION: "actualizar"
ENTIDAD: "area"
DESCRIPCION: "JUAN PEREZ ACTUALIZO AREA PISCINA: CAPACIDAD: 15 → 20 PERSONAS, TARIFA: $40000 → $50000/HORA"
DATOS ANTERIORES: { maximo_personas: 15, costo: 40000 }
DATOS NUEVOS: { maximo_personas: 20, costo: 50000 }
IP: "192.168.0.100"
USER AGENT: "Mozilla/5.0..."
```

## TECNOLOGIAS

- **NODE.JS**: RUNTIME JAVASCRIPT
- **EXPRESS**: FRAMEWORK WEB
- **SEQUELIZE**: ORM PARA MySQL
- **JSONWEBTOKEN**: AUTENTICACION JWT
- **BCRYPTJS**: HASH DE CONTRASEÑAS
- **EXPRESS-VALIDATOR**: VALIDACION DE DATOS
- **NODEMAILER**: ENVIO DE CORREOS
- **HELMET**: SEGURIDAD HTTP HEADERS
- **CORS**: CROSS-ORIGIN RESOURCE SHARING
- **EXPRESS-RATE-LIMIT**: PROTECCION CONTRA ATAQUES

## VARIABLES DE ENTORNO

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=reservas_db
JWT_SECRET=tu_secreto_super_seguro
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_app
```

## INSTALACION

```bash
# INSTALAR DEPENDENCIAS
npm install

# CREAR BASE DE DATOS EN MySQL/NAVICAT
# EJECUTAR SCRIPTS SQL PARA CREAR TABLAS

# CONFIGURAR .env CON TUS CREDENCIALES

# INICIAR SERVIDOR
npm start
```

## ENDPOINTS PRINCIPALES

### AUTENTICACION
```
POST   /api/auth/register          # REGISTRO
POST   /api/auth/login             # LOGIN
GET    /api/auth/perfil            # PERFIL ACTUAL
```

### USUARIOS
```
GET    /api/usuarios               # LISTAR
POST   /api/usuarios               # CREAR
GET    /api/usuarios/:id           # OBTENER POR ID
PUT    /api/usuarios/:id           # ACTUALIZAR
DELETE /api/usuarios/:id           # ELIMINAR
PATCH  /api/usuarios/:id/estado    # CAMBIAR ESTADO
```

### CONJUNTOS
```
GET    /api/conjuntos              # LISTAR
POST   /api/conjuntos              # CREAR
GET    /api/conjuntos/:id          # OBTENER POR ID
PUT    /api/conjuntos/:id          # ACTUALIZAR
DELETE /api/conjuntos/:id          # ELIMINAR
```

### AREAS
```
GET    /api/areas                  # LISTAR
POST   /api/areas                  # CREAR
GET    /api/areas/:id              # OBTENER POR ID
PUT    /api/areas/:id              # ACTUALIZAR
DELETE /api/areas/:id              # ELIMINAR
```

### RESERVAS
```
GET    /api/reservas               # LISTAR
POST   /api/reservas               # CREAR
GET    /api/reservas/:id           # OBTENER POR ID
PUT    /api/reservas/:id           # ACTUALIZAR
DELETE /api/reservas/:id           # ELIMINAR
PATCH  /api/reservas/:id/confirmar # CONFIRMAR
PATCH  /api/reservas/:id/cancelar  # CANCELAR
```

### AUDITORIA
```
GET    /api/auditoria              # LISTAR LOGS
GET    /api/auditoria/estadisticas # ESTADISTICAS
```

### CONFIGURACION
```
GET    /api/configuracion          # OBTENER
PUT    /api/configuracion          # ACTUALIZAR
```

## MEJORES PRACTICAS IMPLEMENTADAS

1. **SEPARACION DE CAPAS**: CONTROLLERS → SERVICES → MODELS
2. **CODIGO LIMPIO**: FUNCIONES PEQUEÑAS Y REUTILIZABLES
3. **MANEJO DE ERRORES**: ESTANDARIZADO CON error.statusCode
4. **VALIDACIONES**: CENTRALIZADAS EN VALIDATORS Y SERVICES
5. **SEGURIDAD**: JWT, BCRYPT, HELMET, RATE LIMIT, VALIDACION DE INPUTS
6. **AUDITORIA**: REGISTRO AUTOMATICO DE TODAS LAS OPERACIONES
7. **RBAC**: CONTROL DE ACCESO BASADO EN ROLES Y SCOPE
8. **SIN SQL DIRECTO**: TODO A TRAVES DE SEQUELIZE ORM
9. **MIDDLEWARE REUTILIZABLE**: CAPTURA, AUDITORIA, AUTENTICACION
10. **DOCUMENTACION**: CODIGO COMENTADO Y README COMPLETO

## MANTENIMIENTO Y ESCALABILIDAD

### AGREGAR NUEVA ENTIDAD

1. CREAR TABLA EN NAVICAT
2. CREAR MODEL EN models/NuevaEntidad.js
3. AGREGAR RELACIONES EN models/index.js
4. CREAR SERVICE EN services/nuevaEntidad.service.js
5. CREAR CONTROLLER EN controllers/nuevaEntidad.controller.js
6. CREAR ROUTES EN routes/nuevaEntidad.routes.js
7. REGISTRAR EN server.js

### AGREGAR NUEVO ENDPOINT

1. AGREGAR RUTA EN routes/
2. AGREGAR METODO EN CONTROLLER
3. AGREGAR LOGICA EN SERVICE
4. AGREGAR MIDDLEWARE SI ES NECESARIO
5. AGREGAR VALIDADOR SI ES NECESARIO

## NOTAS IMPORTANTES

- **LOS MODELOS NO CREAN TABLAS**: SOLO LAS REPRESENTAN
- **CREAR TABLAS MANUALMENTE**: USAR NAVICAT O MySQL WORKBENCH
- **SEQUELIZE INTERACTUA**: CON TABLAS YA EXISTENTES
- **AUDITORIA AUTOMATICA**: NO REQUIERE CODIGO EXTRA EN CONTROLLERS
- **RBAC EN SERVICES**: NO EN CONTROLLERS, PARA REUTILIZACION
- **ERRORES CON statusCode**: PARA RESPUESTAS HTTP CORRECTAS

## AUTOR Y VERSION

**SISTEMA DE RESERVAS - VERSION 2.0**
**ARQUITECTURA REFACTORIZADA CON PATRON DE CAPAS**
**FEBRERO 2026**
