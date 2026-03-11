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

app.set('trust proxy', 1);

const helmet = require('helmet');
const { apiLimiter } = require('./middleware/security');

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.108:5173',
  'http://192.168.1.108:8081',
  'http://192.168.1.108:3000',
  'https://reservas-rust.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
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

app.options('*', cors());


app.use(helmet());
app.use(apiLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use('/api/auditoria', require('./routes/auditoria.routes'));

const path = require('path');
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, 'public/uploads')));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido en el cuerpo de la solicitud',
      message: 'Verifica el formato del body y vuelve a intentarlo'
    });
  }

  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error del servidor',
    message: err.message 
  });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
