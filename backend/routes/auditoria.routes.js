const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');
const { verificarToken } = require('../middleware/auth');

// Solo superadmin puede acceder a estas rutas
const requireSuperAdmin = (req, res, next) => {
  if (req.usuario.tipo_usuario !== 'superadmin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo superadmin.' });
  }
  next();
};

// Obtener estadísticas (debe ir primero para evitar conflicto con /:id)
router.get('/estadisticas', verificarToken, requireSuperAdmin, auditoriaController.obtenerEstadisticas);

// Obtener todos los logs con filtros
router.get('/', verificarToken, requireSuperAdmin, auditoriaController.obtenerTodos);

module.exports = router;
