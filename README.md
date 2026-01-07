# ReservasApp 📱🌐

Sistema completo de gestión de reservas con **Web App**, **Mobile App** y **Backend API**.

## 🏗️ Estructura del Proyecto

```
ReservasApp/
├── backend/          # API REST (Node.js + Express + MySQL)
├── mobile/           # App móvil (React Native + Expo)
├── web/              # App web (React + Vite)
└── database/         # Scripts SQL
```

## 🚀 Tecnologías

### Backend
- Node.js + Express
- MySQL + Sequelize ORM
- JWT Authentication
- bcryptjs

### Mobile
- React Native
- Expo
- Expo 

### Web
- React 18
- Vite
- React Router DOM
- AxiosRouter
- Axios

## 📦 Instalación

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de MySQL:
```env
PORT=3000
DB_HOST=localhost
DB_NAME=reservasapp
DB_USER=root
DB_PASSWORD=tu_password
JWT_SECRET=tu_clave_secreta_super_segura
```

Inicia el servidor:
```bashWeb (Opcional)

```bash
cd web
npm install
npm run dev
```

La web estará disponible en `http://localhost:5173`

Edita `web/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. 
npm start
# o para desarrollo con auto-reload:
npm run dev
```

### 2. Mobile

```bash
cd mobile
npm install
```

**IMPORTANTE**: Edita `mobile/services/api.js` y cambia la URL del API:
```javascript
// Si pruebas en dispositivo físico, usa la IP de tu computadora:
const API_URL = 'http://192.168.1.10:3000/api';
4
// Si pruebas en emulador Android:
const API_URL = 'http://10.0.2.2:3000/api';

// Si pruebas en iOS Simulator:
const API_URL = 'http://localhost:3000/api';
```

Inicia la app:
```ba🌐 Funcionalidades

Disponible tanto en **Web** como en **Mobile**:

### Cliente
- ✅ Registro e inicio de sesión
- ✅ Ver mis reservas
- ✅ Crear nueva reserva
- ✅ Cancelar reserva
- ✅ Ver perfil
- ✅ Diseño responsive (web)
- ✅ Navegación por tabs
La base de datos se crea automáticamente al iniciar el backend gracias a Sequelize.

Opcionalmente, puedes crear la BD manualmente:
```bash
mysql -u root -p < database/schema.sql
```

## 📱 Funcionalidades

### Cliente
- ✅ Registro e inicio de sesión
- ✅ Ver mis reservas
- ✅ Crear nueva reserva
- ✅ Cancelar reserva
- ✅ Ver perfil

### Admin (futuro)
- Ver todas las reservas
- Confirmar/rechazar reservas
- Gestionar usuarios

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens). El token se almacena en AsyncStorage y se incluye automáticamente en todas las peticiones.

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Reservas
- `POST /api/reservas` - Crear reserva
- `G� Deploy en Railway

Puedes desplegar toda la aplicación en Railway:

```
Railway Project:
  ├── MySQL (base de datos)
  ├── Backend (API Node.js)
  └── Web (React app)
```

**Ver guía completa:** [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)

### Costos Estimados
- Plan Hobby: **$5 gratis/mes** (suficiente para empezar)
- MySQL: ~$2/mes
- Backend: ~$2/mes
- Web: ~$1/mes

## 📝 Próximos Pasos

1. **Agregar selector de fecha/hora visual** - Implementar DatePicker
2. **Push Notifications** - Notificar cuando se confirme una reserva
3. **Panel de Admin** - Dashboard para administradores
4. **Historial** - Ver reservas completadas/canceladas
5. **Pagos** - Integración con Stripe/PayPal
6. **Imágenes** - Subir fotos de servicios
7. **PWA** - Convertir web en Progressive Web App
8. **Dark Mode** - Tema oscuro para web y mobile
### Probar el Backend

```bash
# Desde otra terminal
curl http://localhost:3000
```

### Usuario de Prueba

Después de registrarte, puedes crear reservas de prueba.

## 📝 Próximos Pasos

1. **Agregar selector de fecha/hora visual** - Implementar DatePicker
2. **Push Notifications** - Notificar cuando se confirme una reserva
3. **Panel de Admin** - Dashboard para administradores
4. **Historial** - Ver reservas completadas/canceladas
5. **Pagos** - Integración con Stripe/PayPal
6. **Imágenes** - Subir fotos de servicios

## 🐛 Troubleshooting

### El móvil no se conecta al backend
- Verifica que ambos estén en la misma red WiFi
- Usa la IP de tu computadora, no `localhost`
- Desactiva firewall temporalmente

### Error de conexión a MySQL
- Verifica que MySQL esté corriendo
- Confirma usuario y contraseña en `.env`
- Crea la base de datos manualmente si es necesario

### Expo no inicia
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

## 📄 Licencia

MIT

## 👤 Autor

Desarrollado como proyecto demo
