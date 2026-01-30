const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos'
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
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
