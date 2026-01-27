const rateLimit = require('express-rate-limit');

// Limiter general para toda la API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita a 100 peticiones por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos'
  }
});

// Limiter estricto para autenticación (login/register)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Limita a 10 intentos de login/registro por IP por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos de inicio de sesión, por favor intente de nuevo más tarde'
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
