# ReservasApp - Base de Datos

## Crear la base de datos

### Opción 1: Usar Sequelize (Recomendado)
El backend usa Sequelize que creará automáticamente las tablas al iniciar:

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de MySQL
npm start
```

### Opción 2: Importar manualmente el schema
```bash
mysql -u root -p < database/schema.sql
```

## Estructura de Base de Datos

### Tabla: usuarios
- `id`: INT (Primary Key)
- `nombre`: VARCHAR(100)
- `email`: VARCHAR(100) UNIQUE
- `password`: VARCHAR(255) (hasheado con bcrypt)
- `telefono`: VARCHAR(20)
- `rol`: ENUM('cliente', 'admin')
- `activo`: BOOLEAN
- `createdAt`, `updatedAt`: TIMESTAMP

### Tabla: reservas
- `id`: INT (Primary Key)
- `usuarioId`: INT (Foreign Key -> usuarios.id)
- `servicio`: VARCHAR(100)
- `fecha`: DATE
- `hora`: TIME
- `duracion`: INT (minutos)
- `estado`: ENUM('pendiente', 'confirmada', 'cancelada', 'completada')
- `notas`: TEXT
- `precio`: DECIMAL(10, 2)
- `createdAt`, `updatedAt`: TIMESTAMP

## Usuario Admin por Defecto

```
Email: admin@reservasapp.com
Password: admin123
```

**⚠️ IMPORTANTE: Cambiar esta contraseña en producción**
