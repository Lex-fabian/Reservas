# Backend - ReservasApp

API REST para gestión de reservas.

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm start
```

## Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=reservasapp
DB_USER=root
DB_PASSWORD=tu_password

JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=7d
```

## Estructura

```
backend/
├── config/
│   └── database.js       # Configuración de Sequelize
├── models/
│   ├── Usuario.js        # Modelo de usuario
│   ├── Reserva.js        # Modelo de reserva
│   └── index.js
├── controllers/
│   ├── auth.controller.js
│   └── reserva.controller.js
├── routes/
│   ├── auth.routes.js
│   └── reserva.routes.js
├── middleware/
│   └── auth.js           # JWT middleware
├── server.js             # Punto de entrada
└── package.json
```

## API Endpoints

### Autenticación

#### POST /api/auth/register
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "password123",
  "telefono": "0987654321"
}
```

#### POST /api/auth/login
```json
{
  "email": "juan@ejemplo.com",
  "password": "password123"
}
```

#### GET /api/auth/profile
Headers: `Authorization: Bearer <token>`

### Reservas

Todas las rutas requieren autenticación (Bearer token).

#### POST /api/reservas
```json
{
  "servicio": "Consulta General",
  "fecha": "2026-01-15",
  "hora": "10:00",
  "duracion": 60,
  "notas": "Primera consulta",
  "precio": 50.00
}
```

#### GET /api/reservas
Query params opcionales:
- `estado`: pendiente, confirmada, cancelada, completada
- `fecha`: YYYY-MM-DD

#### GET /api/reservas/:id

#### PUT /api/reservas/:id
Actualizar datos de la reserva.

#### PATCH /api/reservas/:id/cancelar
Cancelar una reserva.

#### DELETE /api/reservas/:id
Solo administradores.

## Modelos

### Usuario
```javascript
{
  id: INTEGER,
  nombre: STRING,
  email: STRING (unique),
  password: STRING (hash),
  telefono: STRING,
  rol: ENUM('cliente', 'admin'),
  activo: BOOLEAN
}
```

### Reserva
```javascript
{
  id: INTEGER,
  usuarioId: INTEGER,
  servicio: STRING,
  fecha: DATE,
  hora: TIME,
  duracion: INTEGER,
  estado: ENUM('pendiente', 'confirmada', 'cancelada', 'completada'),
  notas: TEXT,
  precio: DECIMAL
}
```

## Testing

Probar la API con curl:

```bash
# Health check
curl http://localhost:3000

# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Crear reserva (reemplaza TOKEN)
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"servicio":"Test","fecha":"2026-01-15","hora":"10:00"}'
```

## Scripts

```bash
npm start       # Producción
npm run dev     # Desarrollo con nodemon
```

## Seguridad

- Passwords hasheados con bcrypt
- Autenticación JWT
- Validación de datos
- CORS habilitado
- Variables de entorno para secretos

## Próximas Mejoras

- [ ] Rate limiting
- [ ] Logs con Winston
- [ ] Tests con Jest
- [ ] Validación con Joi
- [ ] Documentación con Swagger
- [ ] Upload de imágenes
- [ ] Emails con Nodemailer
