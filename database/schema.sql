CREATE DATABASE IF NOT EXISTS reservasdb
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE reservasdb;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  cedula VARCHAR(20) UNIQUE,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  tipo_usuario ENUM('superadmin', 'admin', 'usuario') DEFAULT 'usuario',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_usuario (usuario),
  INDEX idx_cedula (cedula),
  INDEX idx_tipo_usuario (tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de conjuntos residenciales
CREATE TABLE IF NOT EXISTS conjuntos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_conjunto VARCHAR(150) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de áreas comunes
CREATE TABLE IF NOT EXISTS areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conjuntoId INT NOT NULL,
  nombre_area VARCHAR(100) NOT NULL,
  maximo_personas INT NOT NULL DEFAULT 10,
  fotos TEXT COMMENT 'URLs de fotos separadas por comas',
  costo DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  tiempo_minimo INT DEFAULT 60 COMMENT 'Tiempo mínimo de reserva en minutos',
  observaciones TEXT,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conjuntoId) REFERENCES conjuntos(id) ON DELETE CASCADE,
  INDEX idx_conjunto (conjuntoId),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  conjuntoId INT NOT NULL,
  areaId INT NOT NULL,
  fecha_reserva DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  personas INT NOT NULL,
  foto_comprobante VARCHAR(255) COMMENT 'URL de la foto del comprobante de pago',
  estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
  observaciones TEXT,
  cancelado_por INT COMMENT 'ID del usuario que canceló (admin o usuario)',
  motivo_cancelacion TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (conjuntoId) REFERENCES conjuntos(id) ON DELETE CASCADE,
  FOREIGN KEY (areaId) REFERENCES areas(id) ON DELETE CASCADE,
  FOREIGN KEY (cancelado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_usuario (usuarioId),
  INDEX idx_conjunto (conjuntoId),
  INDEX idx_area (areaId),
  INDEX idx_fecha (fecha_reserva),
  INDEX idx_estado (estado),
  INDEX idx_fecha_hora (fecha_reserva, hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario superadmin por defecto
-- Usuario: admin / Password: admin123 (cambiar en producción)
INSERT INTO usuarios (nombre, apellido, email, telefono, cedula, usuario, contraseña, tipo_usuario) VALUES
('Administrador', 'Sistema', 'admin@reservasapp.com', '0999999999', '9999999999', 'admin', '$2a$10$YourHashedPasswordHere', 'superadmin');

-- Insertar datos de ejemplo (opcional)
INSERT INTO usuarios (nombre, apellido, email, telefono, cedula, usuario, contraseña, tipo_usuario) VALUES
('Lex', 'Usuario', 'lex@ejemplo.com', '0987654321', '1234567890', 'lex', '$2a$10$YourHashedPasswordHere', 'usuario'),
('Cliente', 'Demo', 'cliente@ejemplo.com', '0987654322', '0987654321', 'cliente', '$2a$10$YourHashedPasswordHere', 'usuario');

-- Insertar conjuntos de ejemplo
INSERT INTO conjuntos (nombre_conjunto, direccion, estado) VALUES
('Los Arrayanes', 'Av. 6 de Diciembre y Gaspar de Villarroel', 'activo'),
('Portal del Bosque', 'Calle Los Pinos N34-123 y Av. Eloy Alfaro', 'activo'),
('Conjunto Las Orquídeas', 'Sector San Rafael, Calle Principal', 'activo');

-- Insertar áreas comunes de ejemplo
INSERT INTO areas (conjuntoId, nombre_area, maximo_personas, costo, tiempo_minimo, observaciones, estado) VALUES
(1, 'Salón de Eventos', 50, 80.00, 120, 'Incluye sillas y mesas. Prohibido fumar.', 'activo'),
(1, 'Cancha de Fútbol', 22, 30.00, 60, 'Uso de zapatos deportivos obligatorio.', 'activo'),
(1, 'BBQ Area', 15, 25.00, 120, 'Traer sus propios utensilios.', 'activo'),
(2, 'Piscina', 30, 20.00, 120, 'Uso obligatorio de gorra. Horario: 8am-6pm', 'activo'),
(2, 'Salón Comunal', 40, 60.00, 180, 'Incluye cocina equipada.', 'activo'),
(3, 'Gimnasio', 10, 0.00, 60, 'Gratuito para residentes.', 'activo');

-- Insertar reservas de ejemplo
INSERT INTO reservas (usuarioId, conjuntoId, areaId, fecha_reserva, hora_inicio, hora_fin, personas, estado, observaciones) VALUES
(2, 1, 1, '2026-01-20', '14:00:00', '18:00:00', 35, 'confirmada', 'Fiesta de cumpleaños'),
(3, 1, 2, '2026-01-25', '10:00:00', '12:00:00', 12, 'pendiente', 'Partido amistoso'),
(2, 2, 4, '2026-02-01', '09:00:00', '13:00:00', 20, 'confirmada', 'Reunión familiar');
