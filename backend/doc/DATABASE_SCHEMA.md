# Estructura de la Base de Datos

Este documento muestra como estan organizadas las tablas en MySQL.

## Diagrama de Relaciones

```
┌─────────────────┐
│    usuarios     │
└────────┬────────┘
         │ 1
         │
         │ *
┌────────▼────────┐         ┌─────────────────┐
│    reservas     │────────>│     areas       │
└────────┬────────┘  *    1 └────────┬────────┘
         │                           │ *
         │                           │
         │                           │ 1
         │                  ┌────────▼────────┐
         │                  │   conjuntos     │
         │                  └────────┬────────┘
         │                           │
         │ *                         │ *
         └───────────────────────────┘
              (tabla intermedia:
             usuario_conjunto)

┌─────────────────┐
│ auditoria_logs  │───────> usuarios (quien hizo la accion)
└─────────────────┘

┌─────────────────┐
│ configuracion   │ (tabla unica, sin relaciones)
└─────────────────┘
```

---

## Tabla: usuarios

Guarda la informacion de todas las personas que usan el sistema.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT | Identificador unico |
| nombre | VARCHAR(100) | Nombre del usuario |
| apellido | VARCHAR(100) | Apellido |
| email | VARCHAR(100) | Correo electronico (unico) |
| telefono | VARCHAR(20) | Numero de telefono |
| cedula | VARCHAR(20) | Numero de identificacion |
| usuario | VARCHAR(50) | Nombre de usuario para login (unico) |
| contraseña | VARCHAR(255) | Contraseña encriptada con bcrypt |
| tipo_usuario | ENUM | superadmin, admin, usuario |
| estado | ENUM | activo, inactivo |
| debe_cambiar_password | BOOLEAN | Si debe cambiar contraseña en proximo login |
| createdAt | TIMESTAMP | Fecha de creacion |
| updatedAt | TIMESTAMP | Fecha de ultima actualizacion |

**Relaciones:**
- Un usuario puede tener muchas reservas (1:N)
- Un usuario puede pertenecer a varios conjuntos (N:M)
- Un usuario genera muchos logs de auditoria (1:N)

**Indices:**
- PRIMARY KEY: id
- UNIQUE: email
- UNIQUE: usuario
- INDEX: tipo_usuario
- INDEX: estado

**Ejemplo de registro:**
```sql
INSERT INTO usuarios (nombre, apellido, email, usuario, contraseña, tipo_usuario, estado)
VALUES ('Juan', 'Perez', 'juan@example.com', 'juanp', '$2a$10$...hash...', 'usuario', 'activo');
```

---

## Tabla: conjuntos

Almacena los conjuntos residenciales.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT | Identificador unico |
| nombre_conjunto | VARCHAR(200) | Nombre del conjunto |
| direccion | VARCHAR(255) | Direccion fisica |
| estado | ENUM | activo, inactivo |
| createdAt | TIMESTAMP | Fecha de creacion |
| updatedAt | TIMESTAMP | Fecha de actualizacion |

**Relaciones:**
- Un conjunto tiene muchas areas (1:N)
- Un conjunto tiene muchos usuarios asignados (N:M)
- Un conjunto tiene muchas reservas (1:N)

**Indices:**
- PRIMARY KEY: id
- INDEX: estado

---

## Tabla: areas

Guarda las areas comunes disponibles para reservar.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT | Identificador unico |
| nombre_area | VARCHAR(100) | Nombre del area (Piscina, Salon, etc) |
| descripcion | TEXT | Descripcion detallada |
| maximo_personas | INT | Capacidad maxima |
| costo | DECIMAL(10,2) | Costo por hora de uso |
| conjuntoId | INT | A que conjunto pertenece |
| estado | ENUM | disponible, mantenimiento, inactivo |
| createdAt | TIMESTAMP | Fecha de creacion |
| updatedAt | TIMESTAMP | Fecha de actualizacion |

**Relaciones:**
- Un area pertenece a un conjunto (N:1)
- Un area tiene muchas reservas (1:N)

**Indices:**
- PRIMARY KEY: id
- FOREIGN KEY: conjuntoId → conjuntos(id)
- INDEX: estado
- INDEX: conjuntoId

**Ejemplo:**
```sql
INSERT INTO areas (nombre_area, descripcion, maximo_personas, costo, conjuntoId, estado)
VALUES ('Piscina', 'Piscina olimpica', 20, 50000.00, 1, 'disponible');
```

---

## Tabla: reservas

Registra todas las reservas de areas.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT | Identificador unico |
| usuarioId | INT | Quien hace la reserva |
| conjuntoId | INT | En que conjunto |
| areaId | INT | Que area reserva |
| fecha_reserva | DATE | Dia de la reserva |
| hora_inicio | TIME | Hora de inicio |
| hora_fin | TIME | Hora de finalizacion |
| personas | INT | Cantidad de personas |
| foto_comprobante | LONGTEXT | Imagen en base64 del comprobante |
| observaciones | TEXT | Notas adicionales |
| estado | ENUM | pendiente, confirmada, cancelada |
| cancelado_por | INT | ID del usuario que cancelo (puede ser NULL) |
| motivo_cancelacion | TEXT | Razon de cancelacion |
| createdAt | TIMESTAMP | Fecha de creacion |
| updatedAt | TIMESTAMP | Fecha de actualizacion |

**Relaciones:**
- Una reserva pertenece a un usuario (N:1)
- Una reserva pertenece a un area (N:1)
- Una reserva pertenece a un conjunto (N:1)

**Indices:**
- PRIMARY KEY: id
- FOREIGN KEY: usuarioId → usuarios(id)
- FOREIGN KEY: areaId → areas(id)
- FOREIGN KEY: conjuntoId → conjuntos(id)
- INDEX: fecha_reserva
- INDEX: estado
- INDEX: usuarioId, areaId

**Validaciones:**
- hora_fin debe ser mayor que hora_inicio
- personas no puede exceder maximo_personas del area
- No puede haber reservas solapadas en la misma area

---

## Tabla: usuario_conjunto (Tabla Intermedia)

Conecta usuarios con conjuntos (relacion muchos a muchos).

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| usuarioId | INT | ID del usuario |
| conjuntoId | INT | ID del conjunto |
| createdAt | TIMESTAMP | Fecha de asignacion |
| updatedAt | TIMESTAMP | Fecha de actualizacion |

**Indices:**
- PRIMARY KEY: (usuarioId, conjuntoId)
- FOREIGN KEY: usuarioId → usuarios(id)
- FOREIGN KEY: conjuntoId → conjuntos(id)

**Ejemplo:**
```sql
-- Asignar usuario 5 al conjunto 1
INSERT INTO usuario_conjunto (usuarioId, conjuntoId)
VALUES (5, 1);
```

---

## Tabla: auditoria_logs

Guarda un registro de todas las acciones importantes.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT | Identificador unico |
| usuarioId | INT | Quien hizo la accion |
| accion | VARCHAR(50) | crear, actualizar, eliminar, login, etc |
| entidad | VARCHAR(50) | usuario, area, reserva, etc |
| entidadId | INT | ID del registro afectado |
| descripcion | TEXT | Descripcion legible de la accion |
| datosAnteriores | JSON | Estado antes del cambio |
| datosNuevos | JSON | Estado despues del cambio |
| ip | VARCHAR(45) | Direccion IP del usuario |
| userAgent | TEXT | Navegador usado |
| createdAt | TIMESTAMP | Cuando paso |
| updatedAt | TIMESTAMP | Actualizacion |

**Relaciones:**
- Un log pertenece a un usuario (N:1)

**Indices:**
- PRIMARY KEY: id
- FOREIGN KEY: usuarioId → usuarios(id)
- INDEX: accion
- INDEX: entidad
- INDEX: createdAt
- INDEX: usuarioId

**Ejemplo:**
```sql
INSERT INTO auditoria_logs (usuarioId, accion, entidad, entidadId, descripcion, ip)
VALUES (1, 'crear', 'reserva', 10, 'Juan Perez creo reserva de Piscina', '192.168.1.100');
```

---

## Tabla: configuracion

Guarda la configuracion del sistema (datos bancarios).

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | INT | Identificador (siempre 1) |
| banco | VARCHAR(100) | Nombre del banco |
| tipo_cuenta | ENUM | Ahorros, Corriente |
| numero_cuenta | VARCHAR(50) | Numero de cuenta bancaria |
| nombre_titular | VARCHAR(200) | Nombre del titular |
| cedula_titular | VARCHAR(20) | Cedula del titular |
| createdAt | TIMESTAMP | Fecha de creacion |
| updatedAt | TIMESTAMP | Fecha de actualizacion |

**Nota:** Solo debe haber UN registro en esta tabla.

**Indices:**
- PRIMARY KEY: id

---

## Scripts SQL para Crear Tablas

### Crear tabla usuarios
```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  cedula VARCHAR(20),
  usuario VARCHAR(50) UNIQUE NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('superadmin', 'admin', 'usuario') DEFAULT 'usuario',
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  debe_cambiar_password BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo_usuario (tipo_usuario),
  INDEX idx_estado (estado)
);
```

### Crear tabla conjuntos
```sql
CREATE TABLE conjuntos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_conjunto VARCHAR(200) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado)
);
```

### Crear tabla areas
```sql
CREATE TABLE areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_area VARCHAR(100) NOT NULL,
  descripcion TEXT,
  maximo_personas INT NOT NULL,
  costo DECIMAL(10,2) NOT NULL,
  conjuntoId INT NOT NULL,
  estado ENUM('disponible', 'mantenimiento', 'inactivo') DEFAULT 'disponible',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conjuntoId) REFERENCES conjuntos(id) ON DELETE CASCADE,
  INDEX idx_estado (estado),
  INDEX idx_conjunto (conjuntoId)
);
```

### Crear tabla reservas
```sql
CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  conjuntoId INT NOT NULL,
  areaId INT NOT NULL,
  fecha_reserva DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  personas INT NOT NULL,
  foto_comprobante LONGTEXT,
  observaciones TEXT,
  estado ENUM('pendiente', 'confirmada', 'cancelada') DEFAULT 'pendiente',
  cancelado_por INT,
  motivo_cancelacion TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (areaId) REFERENCES areas(id) ON DELETE CASCADE,
  FOREIGN KEY (conjuntoId) REFERENCES conjuntos(id) ON DELETE CASCADE,
  INDEX idx_fecha (fecha_reserva),
  INDEX idx_estado (estado),
  INDEX idx_usuario_area (usuarioId, areaId)
);
```

### Crear tabla usuario_conjunto
```sql
CREATE TABLE usuario_conjunto (
  usuarioId INT NOT NULL,
  conjuntoId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (usuarioId, conjuntoId),
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (conjuntoId) REFERENCES conjuntos(id) ON DELETE CASCADE
);
```

### Crear tabla auditoria_logs
```sql
CREATE TABLE auditoria_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  accion VARCHAR(50) NOT NULL,
  entidad VARCHAR(50) NOT NULL,
  entidadId INT,
  descripcion TEXT,
  datosAnteriores JSON,
  datosNuevos JSON,
  ip VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_accion (accion),
  INDEX idx_entidad (entidad),
  INDEX idx_fecha (createdAt),
  INDEX idx_usuario (usuarioId)
);
```

### Crear tabla configuracion
```sql
CREATE TABLE configuracion (
  id INT PRIMARY KEY DEFAULT 1,
  banco VARCHAR(100) NOT NULL,
  tipo_cuenta ENUM('Ahorros', 'Corriente') DEFAULT 'Ahorros',
  numero_cuenta VARCHAR(50) NOT NULL,
  nombre_titular VARCHAR(200) NOT NULL,
  cedula_titular VARCHAR(20) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (id = 1)
);
```

---

## Datos de Ejemplo

### Insertar usuario superadmin inicial
```sql
INSERT INTO usuarios (nombre, apellido, email, usuario, contraseña, tipo_usuario)
VALUES (
  'Super',
  'Admin',
  'admin@sistema.com',
  'superadmin',
  '$2a$10$YourHashedPasswordHere',
  'superadmin'
);
```

### Insertar conjunto de ejemplo
```sql
INSERT INTO conjuntos (nombre_conjunto, direccion)
VALUES ('Conjunto Residencial El Parque', 'Calle 123 #45-67');
```

### Insertar areas de ejemplo
```sql
INSERT INTO areas (nombre_area, descripcion, maximo_personas, costo, conjuntoId) VALUES
('Piscina', 'Piscina olimpica con zona infantil', 20, 50000.00, 1),
('Salon Social', 'Salon para eventos', 50, 100000.00, 1),
('Cancha de Tenis', 'Cancha profesional', 4, 30000.00, 1),
('BBQ', 'Zona de parrilla', 15, 40000.00, 1);
```

---

## Notas Importantes

1. **Foreign Keys**: Todas las claves foraneas tienen `ON DELETE CASCADE`, lo que significa que al borrar un registro padre, se borran automaticamente sus hijos.

2. **Timestamps**: Todas las tablas tienen `createdAt` y `updatedAt` que se actualizan automaticamente.

3. **JSON**: Los campos `datosAnteriores` y `datosNuevos` en auditoria_logs usan tipo JSON nativo de MySQL.

4. **LONGTEXT**: El campo `foto_comprobante` usa LONGTEXT para almacenar imagenes grandes en base64.

5. **ENUM**: Los campos de estado usan ENUM para valores fijos, mejora performance vs VARCHAR.

6. **Indices**: Todos los campos frecuentemente filtrados tienen indices para mejorar velocidad de consultas.
