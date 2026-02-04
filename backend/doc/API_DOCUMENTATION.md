# Documentacion de API - Sistema de Reservas

Esta guia te muestra como usar cada endpoint del sistema.

## Autenticacion

Todos los endpoints (excepto login y register) requieren un token JWT en los headers:

```
Authorization: Bearer tu_token_aqui
```

---

## AUTENTICACION

### Registro de Usuario
```http
POST /api/auth/register
```

**Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan@example.com",
  "usuario": "juanp",
  "contraseña": "Pass123!",
  "telefono": "3001234567",
  "tipo_usuario": "usuario"
}
```

**Respuesta Exitosa (201):**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "email": "juan@example.com",
    "tipo_usuario": "usuario"
  }
}
```

**Errores:**
- `400`: Email o usuario ya registrado
- `400`: Datos invalidos

---

### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "usuario": "juanp",
  "contraseña": "Pass123!"
}
```

**Respuesta Exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "email": "juan@example.com",
    "tipo_usuario": "usuario",
    "debe_cambiar_password": false
  }
}
```

**Errores:**
- `401`: Usuario o contraseña incorrecta
- `403`: Usuario inactivo

---

### Obtener Perfil
```http
GET /api/auth/perfil
```

**Headers:** `Authorization: Bearer token`

**Respuesta (200):**
```json
{
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Perez",
    "email": "juan@example.com",
    "tipo_usuario": "usuario",
    "conjuntos": [
      { "id": 1, "nombre_conjunto": "Conjunto A" }
    ]
  }
}
```

---

## USUARIOS

### Listar Usuarios
```http
GET /api/usuarios
```

**Query Params:**
- `estado` (opcional): activo | inactivo
- `tipo_usuario` (opcional): superadmin | admin | usuario

**Ejemplo:**
```http
GET /api/usuarios?estado=activo&tipo_usuario=usuario
```

**Respuesta (200):**
```json
{
  "usuarios": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Perez",
      "email": "juan@example.com",
      "tipo_usuario": "usuario",
      "estado": "activo",
      "conjuntos": [
        { "id": 1, "nombre_conjunto": "Conjunto A" }
      ],
      "Reservas": [
        { "id": 10, "estado": "confirmada" }
      ]
    }
  ]
}
```

---

### Crear Usuario
```http
POST /api/usuarios
```

**Body:**
```json
{
  "nombre": "Maria",
  "apellido": "Lopez",
  "email": "maria@example.com",
  "usuario": "marialop",
  "telefono": "3009876543",
  "cedula": "1234567890",
  "tipo_usuario": "usuario",
  "conjuntos": [1, 2]
}
```

**Respuesta (201):**
```json
{
  "mensaje": "Usuario creado y credenciales enviadas",
  "usuario": {
    "id": 5,
    "nombre": "Maria",
    "email": "maria@example.com"
  },
  "contraseñaTemporal": "Ab3@xY9pL2mK"
}
```

**Nota:** La contraseña se genera automaticamente y se envia por email.

---

### Actualizar Usuario
```http
PUT /api/usuarios/:id
```

**Body:**
```json
{
  "nombre": "Maria Fernanda",
  "telefono": "3001111111",
  "estado": "activo",
  "conjuntos": [1]
}
```

**Respuesta (200):**
```json
{
  "mensaje": "Usuario actualizado exitosamente",
  "usuario": {
    "id": 5,
    "nombre": "Maria Fernanda",
    "telefono": "3001111111"
  }
}
```

---

### Cambiar Estado
```http
PATCH /api/usuarios/:id/estado
```

**Body:**
```json
{
  "estado": "inactivo"
}
```

---

### Eliminar Usuario
```http
DELETE /api/usuarios/:id
```

**Respuesta (200):**
```json
{
  "mensaje": "Usuario eliminado exitosamente"
}
```

---

## CONJUNTOS

### Listar Conjuntos
```http
GET /api/conjuntos
```

**Query Params:**
- `estado` (opcional): activo | inactivo

**Respuesta (200):**
```json
{
  "conjuntos": [
    {
      "id": 1,
      "nombre_conjunto": "Conjunto Residencial El Parque",
      "direccion": "Calle 123 #45-67",
      "estado": "activo",
      "Areas": [
        {
          "id": 1,
          "nombre_area": "Piscina",
          "estado": "disponible"
        }
      ]
    }
  ]
}
```

---

### Crear Conjunto
```http
POST /api/conjuntos
```

**Body:**
```json
{
  "nombre_conjunto": "Conjunto Los Robles",
  "direccion": "Carrera 50 #30-20",
  "estado": "activo"
}
```

**Respuesta (201):**
```json
{
  "mensaje": "Conjunto creado exitosamente",
  "conjunto": {
    "id": 2,
    "nombre_conjunto": "Conjunto Los Robles",
    "direccion": "Carrera 50 #30-20"
  }
}
```

---

### Obtener Conjunto por ID
```http
GET /api/conjuntos/:id
```

**Respuesta (200):**
```json
{
  "conjunto": {
    "id": 1,
    "nombre_conjunto": "Conjunto El Parque",
    "direccion": "Calle 123 #45-67",
    "Areas": [
      { "id": 1, "nombre_area": "Piscina" },
      { "id": 2, "nombre_area": "Salon Social" }
    ]
  }
}
```

---

### Actualizar Conjunto
```http
PUT /api/conjuntos/:id
```

**Body:**
```json
{
  "nombre_conjunto": "Conjunto El Parque Renovado",
  "direccion": "Calle 123 #45-67"
}
```

---

### Eliminar Conjunto
```http
DELETE /api/conjuntos/:id
```

---

## AREAS

### Listar Areas
```http
GET /api/areas
```

**Query Params:**
- `conjuntoId` (opcional): filtrar por conjunto
- `estado` (opcional): disponible | mantenimiento | inactivo

**Ejemplo:**
```http
GET /api/areas?conjuntoId=1&estado=disponible
```

**Respuesta (200):**
```json
{
  "areas": [
    {
      "id": 1,
      "nombre_area": "Piscina",
      "descripcion": "Piscina olimpica con zona infantil",
      "maximo_personas": 20,
      "costo": 50000,
      "estado": "disponible",
      "Conjunto": {
        "id": 1,
        "nombre_conjunto": "Conjunto El Parque"
      }
    }
  ]
}
```

---

### Crear Area
```http
POST /api/areas
```

**Body:**
```json
{
  "nombre_area": "Salon Social",
  "descripcion": "Salon con capacidad para eventos",
  "maximo_personas": 50,
  "costo": 100000,
  "conjuntoId": 1,
  "estado": "disponible"
}
```

**Respuesta (201):**
```json
{
  "mensaje": "Area creada exitosamente",
  "area": {
    "id": 3,
    "nombre_area": "Salon Social",
    "maximo_personas": 50,
    "costo": 100000
  }
}
```

---

### Actualizar Area
```http
PUT /api/areas/:id
```

**Body:**
```json
{
  "maximo_personas": 60,
  "costo": 120000,
  "estado": "disponible"
}
```

---

### Eliminar Area
```http
DELETE /api/areas/:id
```

---

## RESERVAS

### Listar Reservas
```http
GET /api/reservas
```

**Query Params:**
- `estado`: pendiente | confirmada | cancelada
- `areaId`: ID del area
- `fecha_desde`: YYYY-MM-DD
- `fecha_hasta`: YYYY-MM-DD
- `todas`: true (solo para admin/superadmin)

**Ejemplo:**
```http
GET /api/reservas?estado=confirmada&fecha_desde=2026-02-01&fecha_hasta=2026-02-28
```

**Respuesta (200):**
```json
{
  "reservas": [
    {
      "id": 10,
      "fecha_reserva": "2026-02-15",
      "hora_inicio": "18:00:00",
      "hora_fin": "22:00:00",
      "personas": 15,
      "estado": "confirmada",
      "foto_comprobante": "data:image/jpeg;base64,...",
      "observaciones": "Cumpleaños",
      "Usuario": {
        "id": 1,
        "nombre": "Juan",
        "apellido": "Perez"
      },
      "Area": {
        "id": 1,
        "nombre_area": "Piscina",
        "maximo_personas": 20
      }
    }
  ]
}
```

---

### Crear Reserva
```http
POST /api/reservas
```

**Body:**
```json
{
  "conjuntoId": 1,
  "areaId": 1,
  "fecha_reserva": "2026-02-15",
  "hora_inicio": "18:00",
  "hora_fin": "22:00",
  "personas": 15,
  "observaciones": "Cumpleaños",
  "foto_comprobante": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Nota:** Los usuarios tipo "usuario" DEBEN enviar foto_comprobante (imagen en base64).

**Respuesta (201):**
```json
{
  "message": "Reserva creada exitosamente",
  "reserva": {
    "id": 10,
    "fecha_reserva": "2026-02-15",
    "estado": "pendiente"
  }
}
```

---

### Confirmar Reserva (Admin/SuperAdmin)
```http
PATCH /api/reservas/:id/confirmar
```

**Respuesta (200):**
```json
{
  "message": "Reserva confirmada exitosamente",
  "reserva": {
    "id": 10,
    "estado": "confirmada"
  }
}
```

---

### Cancelar Reserva
```http
PATCH /api/reservas/:id/cancelar
```

**Respuesta (200):**
```json
{
  "message": "Reserva cancelada exitosamente",
  "reserva": {
    "id": 10,
    "estado": "cancelada"
  }
}
```

---

### Eliminar Reserva
```http
DELETE /api/reservas/:id
```

---

## AUDITORIA

### Listar Logs
```http
GET /api/auditoria
```

**Query Params:**
- `usuarioId`: ID del usuario
- `accion`: crear | actualizar | eliminar | login | confirmar_reserva | etc
- `entidad`: usuario | area | conjunto | reserva | etc
- `fechaDesde`: YYYY-MM-DD
- `fechaHasta`: YYYY-MM-DD
- `page`: numero de pagina (default: 1)
- `limit`: registros por pagina (default: 50)

**Ejemplo:**
```http
GET /api/auditoria?accion=crear&entidad=reserva&fechaDesde=2026-02-01&page=1&limit=20
```

**Respuesta (200):**
```json
{
  "logs": [
    {
      "id": 1523,
      "usuarioId": 1,
      "accion": "crear",
      "entidad": "reserva",
      "descripcion": "Juan Perez creo reserva del 15/02/2026 18:00 al 15/02/2026 22:00",
      "ip": "192.168.1.100",
      "createdAt": "2026-02-04T15:30:45.000Z",
      "Usuario": {
        "id": 1,
        "usuario": "juanp",
        "nombre": "Juan"
      }
    }
  ],
  "pagination": {
    "total": 523,
    "page": 1,
    "limit": 20,
    "totalPages": 27
  }
}
```

---

### Obtener Estadisticas
```http
GET /api/auditoria/estadisticas
```

**Query Params:** (mismos que listar logs)

**Respuesta (200):**
```json
{
  "totalLogs": 523,
  "logsPorAccion": [
    { "accion": "login", "total": 150 },
    { "accion": "crear", "total": 120 },
    { "accion": "actualizar", "total": 80 }
  ],
  "logsPorEntidad": [
    { "entidad": "reserva", "total": 200 },
    { "entidad": "usuario", "total": 100 }
  ],
  "usuariosMasActivos": [
    {
      "usuarioId": 1,
      "total": 85,
      "Usuario": {
        "usuario": "juanp",
        "nombre": "Juan"
      }
    }
  ]
}
```

---

## CONFIGURACION

### Obtener Configuracion
```http
GET /api/configuracion
```

**Respuesta (200):**
```json
{
  "banco": "Bancolombia",
  "tipo_cuenta": "Ahorros",
  "numero_cuenta": "12345678901",
  "nombre_titular": "Administracion Conjunto",
  "cedula_titular": "1234567890"
}
```

---

### Actualizar Configuracion (Solo SuperAdmin)
```http
PUT /api/configuracion
```

**Body:**
```json
{
  "banco": "Bancolombia",
  "tipo_cuenta": "Corriente",
  "numero_cuenta": "98765432109",
  "nombre_titular": "Conjunto Residencial",
  "cedula_titular": "9876543210"
}
```

---

## Codigos de Error

| Codigo | Significado |
|--------|-------------|
| 200 | Todo bien |
| 201 | Creado exitosamente |
| 400 | Datos invalidos o faltantes |
| 401 | No estas autenticado (token invalido) |
| 403 | No tienes permisos |
| 404 | No se encontro el recurso |
| 500 | Error del servidor |

---

## Ejemplos con cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "juanp",
    "contraseña": "Pass123!"
  }'
```

### Crear Area (con token)
```bash
curl -X POST http://localhost:3000/api/areas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "nombre_area": "Cancha de Tenis",
    "maximo_personas": 4,
    "costo": 30000,
    "conjuntoId": 1
  }'
```

### Listar Reservas
```bash
curl -X GET "http://localhost:3000/api/reservas?estado=confirmada" \
  -H "Authorization: Bearer tu_token_aqui"
```
