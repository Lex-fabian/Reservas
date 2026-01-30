const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const reservaRoutes = require('./routes/reserva.routes');
const conjuntoRoutes = require('./routes/conjunto.routes');
const areaRoutes = require('./routes/area.routes');
const usuarioRoutes = require('./routes/usuario.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - IMPORTANTE para Render y otros servicios detrás de proxies
app.set('trust proxy', 1);

// Seguridad
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/security');

// Configuración CORS robusta
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.108:5173',
  'http://192.168.1.108:8081', // React Native Metro Bundler default
  'http://192.168.1.108:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como apps móviles o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      console.log('Origen bloqueado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Request-Method']
}));

// Habilitar pre-flight explícitamente y manejar OPTIONS
app.options('*', cors());

app.use(helmet());
app.use(apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({ 
    message: ' API ReservasApp activa',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      reservas: '/api/reservas',
      conjuntos: '/api/conjuntos',
      areas: '/api/areas'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/conjuntos', conjuntoRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/configuracion', require('./routes/configuracion.routes'));

// Servir archivos estáticos (uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error del servidor',
    message: err.message 
  });
});

// Iniciar servidor
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
