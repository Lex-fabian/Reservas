-- Script para crear la base de datos ReservasApp

CREATE DATABASE IF NOT EXISTS reservasapp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE reservasapp;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol ENUM('cliente', 'admin') DEFAULT 'cliente',
  activo BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId INT NOT NULL,
  servicio VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  duracion INT DEFAULT 60 COMMENT 'Duración en minutos',
  estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
  notas TEXT,
  precio DECIMAL(10, 2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuarioId),
  INDEX idx_fecha (fecha),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario admin por defecto
-- Password: admin123 (cambiar en producción)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@reservasapp.com', '$2a$10$YourHashedPasswordHere', 'admin');

-- Insertar datos de ejemplo (opcional)
INSERT INTO usuarios (nombre, email, password, telefono, rol) VALUES
('Cliente Demo', 'cliente@ejemplo.com', '$2a$10$YourHashedPasswordHere', '0987654321', 'cliente');

INSERT INTO reservas (usuarioId, servicio, fecha, hora, duracion, estado, precio) VALUES
(2, 'Consulta General', '2026-01-15', '10:00:00', 60, 'confirmada', 50.00),
(2, 'Servicio Premium', '2026-01-20', '15:30:00', 90, 'pendiente', 120.00);
