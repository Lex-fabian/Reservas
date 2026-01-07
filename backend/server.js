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

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:10000', 'https://reservas-725o.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
