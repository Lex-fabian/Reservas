# RESERVASAPP - FRONTEND WEB

APLICACION WEB PARA GESTION DE RESERVAS DE AREAS COMUNES EN CONJUNTOS RESIDENCIALES. INTERFAZ DE ADMINISTRACION CONSTRUIDA CON REACT Y VITE.

---

## DESCRIPCION GENERAL

ESTE ES EL FRONTEND DE ADMINISTRACION DEL SISTEMA DE RESERVAS. PERMITE A ADMINISTRADORES Y SUPERADMINISTRADORES GESTIONAR USUARIOS, CONJUNTOS, AREAS Y RESERVAS DE MANERA VISUAL E INTUITIVA.

### CARACTERISTICAS PRINCIPALES

- **GESTION DE USUARIOS**: CREAR, EDITAR, ELIMINAR Y GESTIONAR PERMISOS DE USUARIOS
- **GESTION DE CONJUNTOS**: ADMINISTRAR CONJUNTOS RESIDENCIALES
- **GESTION DE AREAS**: CONFIGURAR AREAS COMUNES (PISCINAS, CANCHAS, SALONES, ETC)
- **GESTION DE RESERVAS**: VISUALIZAR, CONFIRMAR, CANCELAR Y GESTIONAR RESERVAS
- **AUDITORIA**: VER HISTORIAL DE ACCIONES EN EL SISTEMA
- **CONFIGURACION**: AJUSTAR PARAMETROS DEL SISTEMA
- **AUTENTICACION**: LOGIN SEGURO CON JWT Y CONTROL DE ACCESO POR ROLES

---

## TECNOLOGIAS UTILIZADAS

### CORE
- **REACT 18**: LIBRERIA PRINCIPAL PARA LA INTERFAZ
- **VITE**: BUILD TOOL Y DEV SERVER RAPIDO
- **REACT ROUTER DOM**: NAVEGACION Y RUTAS

### SERVICIOS
- **AXIOS**: CLIENTE HTTP PARA API REST
- **LOCALSTORAGE**: PERSISTENCIA DE SESION Y TOKEN

### ESTILOS
- **CSS MODULES**: ESTILOS MODULARES POR COMPONENTE
- **CSS PERSONALIZADO**: DISEÑO PROPIO SIN FRAMEWORKS

---

## ESTRUCTURA DEL PROYECTO

```
web/
├── public/                    # ARCHIVOS ESTATICOS
├── src/
│   ├── assets/               # IMAGENES, ICONOS, RECURSOS
│   ├── components/           # COMPONENTES REUTILIZABLES
│   │   ├── AreaComponent.jsx
│   │   ├── AuditoriaComponent.jsx
│   │   ├── ConfiguracionComponent.jsx
│   │   ├── ConjuntoComponent.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ModalCambioPasswordObligatorio.jsx
│   │   ├── PasswordInput.jsx
│   │   ├── ReservasComponent.jsx
│   │   └── UsuarioComponent.jsx
│   ├── hooks/                # CUSTOM HOOKS
│   │   └── useAuth.js        # HOOK DE AUTENTICACION
│   ├── navigation/           # NAVEGACION Y RUTAS
│   ├── pages/                # PAGINAS PRINCIPALES
│   │   ├── Login.jsx         # PAGINA DE LOGIN
│   │   └── Inicio.jsx        # DASHBOARD PRINCIPAL
│   ├── services/             # SERVICIOS Y API
│   │   ├── api/              # NUEVA ARQUITECTURA MODULAR
│   │   │   ├── config.js             # CONFIGURACION AXIOS
│   │   │   ├── storage.js            # MANEJO LOCALSTORAGE
│   │   │   ├── BaseService.js        # CLASE BASE CRUD
│   │   │   ├── auth.service.js       # AUTENTICACION
│   │   │   ├── usuario.service.js    # USUARIOS
│   │   │   ├── conjunto.service.js   # CONJUNTOS
│   │   │   ├── area.service.js       # AREAS
│   │   │   ├── reserva.service.js    # RESERVAS
│   │   │   ├── configuracion.service.js
│   │   │   ├── auditoria.service.js
│   │   │   └── index.js              # EXPORTACION CENTRALIZADA
│   │   └── api.js            # PUENTE DE COMPATIBILIDAD
│   ├── style/                # ESTILOS GLOBALES Y POR PAGINA
│   ├── types/                # TIPOS Y CONSTANTES
│   ├── App.jsx               # COMPONENTE PRINCIPAL
│   ├── main.jsx              # PUNTO DE ENTRADA
│   └── index.css             # ESTILOS GLOBALES
├── .env                      # VARIABLES DE ENTORNO
├── index.html                # HTML BASE
├── package.json              # DEPENDENCIAS Y SCRIPTS
├── vite.config.js            # CONFIGURACION VITE
└── README.MD                 # ESTE ARCHIVO
```

---

## ARQUITECTURA DE SERVICIOS (NUEVA)

### ESTRUCTURA MODULAR

LA NUEVA ARQUITECTURA SEPARA RESPONSABILIDADES EN MODULOS INDEPENDIENTES:

```
services/api/
├── config.js          → CONFIGURACION AXIOS + INTERCEPTORES
├── storage.js         → MANEJO CENTRALIZADO DE LOCALSTORAGE
├── BaseService.js     → CLASE BASE PARA CRUD GENERICO
├── auth.service.js    → LOGICA DE AUTENTICACION
├── *.service.js       → SERVICIOS ESPECIFICOS POR RECURSO
└── index.js           → PUNTO DE ENTRADA UNIFICADO
```

### PATRON BASESERVICE

TODOS LOS SERVICIOS HEREDAN DE `BaseService`:

```javascript
class UsuarioService extends BaseService {
  constructor() {
    super('usuarios'); // RECURSO API
  }
  
  // HEREDA AUTOMATICAMENTE:
  // - obtenerTodos(params)
  // - obtenerPorId(id)
  // - crear(data)
  // - actualizar(id, data)
  // - eliminar(id)
  // - actualizarParcial(id, data)
  // - customRequest(method, endpoint, data)
}
```

### VENTAJAS

1. **CODIGO REUTILIZABLE**: 80% MENOS CODIGO DUPLICADO
2. **FACIL MANTENIMIENTO**: CAMBIOS EN UN SOLO LUGAR
3. **ESCALABILIDAD**: NUEVOS RECURSOS EN 3 LINEAS
4. **TESTEABLE**: LOGICA SEPARADA DE COMPONENTES
5. **CONSISTENCIA**: MISMA ESTRUCTURA EN TODOS LOS SERVICIOS

---

## FLUJO DE AUTENTICACION

```
1. USUARIO INGRESA CREDENCIALES
   ↓
2. authService.login(usuario, contraseña)
   ↓
3. BACKEND VALIDA Y RETORNA TOKEN + DATOS USUARIO
   ↓
4. storageService.setAuth(token, usuario)
   ↓
5. INTERCEPTOR AGREGA TOKEN A TODAS LAS PETICIONES
   ↓
6. SI TOKEN EXPIRA (401) → LOGOUT AUTOMATICO
```

### INTERCEPTORES

**REQUEST INTERCEPTOR**:
```javascript
// AGREGA TOKEN A CADA PETICION
Authorization: Bearer <token>
```

**RESPONSE INTERCEPTOR**:
```javascript
// SI 401 → LOGOUT Y REDIRECCION A LOGIN
// FORMATEA ERRORES PARA MEJOR MANEJO
```

---

## CONTROL DE ACCESO (RBAC)

### ROLES DEL SISTEMA

1. **USUARIO**: SOLO VE SUS PROPIAS RESERVAS (NO ACCEDE A ADMIN)
2. **ADMIN**: GESTIONA SU CONJUNTO ASIGNADO
3. **SUPERADMIN**: ACCESO TOTAL AL SISTEMA

### VERIFICACION DE PERMISOS

```javascript
// EN authService
authService.isUsuario()        // true SI ES USUARIO
authService.isAdmin()          // true SI ES ADMIN
authService.isSuperAdmin()     // true SI ES SUPERADMIN
authService.isAdminOrSuper()   // true SI ES ADMIN O SUPERADMIN
authService.hasPermission(rol) // VERIFICA JERARQUIA
```

### PROTECCION DE RUTAS

```javascript
// EN Login.jsx
if (!authService.isAdminOrSuper()) {
  authService.logout();
  // SOLO ADMIN Y SUPERADMIN PUEDEN ACCEDER
}
```

---

## INSTALACION Y CONFIGURACION

### REQUISITOS PREVIOS

- NODE.JS 18 O SUPERIOR
- NPM O YARN
- BACKEND CORRIENDO EN SERVIDOR

### PASOS DE INSTALACION

1. **CLONAR REPOSITORIO**:
```bash
cd ReservasApp/web
```

2. **INSTALAR DEPENDENCIAS**:
```bash
npm install
```

3. **CONFIGURAR VARIABLES DE ENTORNO**:

CREAR ARCHIVO `.env` EN LA RAIZ:

```env
VITE_API_URL=http://localhost:3000/api
```

PARA PRODUCCION:
```env
VITE_API_URL=https://tu-backend.render.com/api
```

4. **INICIAR EN DESARROLLO**:
```bash
npm run dev
```

ABRIR http://localhost:5173

5. **BUILD PARA PRODUCCION**:
```bash
npm run build
```

ARCHIVOS GENERADOS EN: `dist/`

---

## SCRIPTS DISPONIBLES

```bash
npm run dev        # INICIAR SERVIDOR DE DESARROLLO
npm run build      # COMPILAR PARA PRODUCCION
npm run preview    # PREVISUALIZAR BUILD DE PRODUCCION
npm run lint       # EJECUTAR LINTER
```

---

## COMPONENTES PRINCIPALES

### DASHBOARD
**UBICACION**: `src/components/Dashboard.jsx`

SIDEBAR DE NAVEGACION CON ACCESO A:
- GESTION DE USUARIOS
- GESTION DE CONJUNTOS
- GESTION DE AREAS
- GESTION DE RESERVAS
- AUDITORIA
- CONFIGURACION

### AREA COMPONENT
**UBICACION**: `src/components/AreaComponent.jsx`

CRUD COMPLETO DE AREAS:
- LISTAR AREAS CON FILTROS
- CREAR NUEVA AREA
- EDITAR AREA EXISTENTE
- ELIMINAR AREA
- ASIGNAR AREAS A CONJUNTOS

### RESERVAS COMPONENT
**UBICACION**: `src/components/ReservasComponent.jsx`

GESTION DE RESERVAS:
- VISUALIZAR TODAS LAS RESERVAS
- FILTRAR POR FECHA, ESTADO, AREA
- CONFIRMAR RESERVAS PENDIENTES
- CANCELAR RESERVAS
- VER DETALLES DE RESERVA

### USUARIO COMPONENT
**UBICACION**: `src/components/UsuarioComponent.jsx`

GESTION DE USUARIOS:
- LISTAR USUARIOS CON FILTROS
- CREAR USUARIO CON CONTRASEÑA TEMPORAL
- EDITAR INFORMACION DE USUARIO
- ASIGNAR ROLES (USUARIO/ADMIN/SUPERADMIN)
- ASIGNAR CONJUNTOS A USUARIOS