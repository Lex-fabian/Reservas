const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');
const { verificarToken } = require('../middleware/auth');

// SOLO SUPERADMIN PUEDE ACCEDER A LAS RUTAS DE AUDITORIA
const requireSuperAdmin = (req, res, next) => {
  if (req.usuario.tipo_usuario !== 'superadmin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo superadmin.' });
  }
  next();
};

router.get('/estadisticas', verificarToken, requireSuperAdmin, auditoriaController.obtenerEstadisticas);
router.get('/', verificarToken, requireSuperAdmin, auditoriaController.obtenerTodos);

module.exports = router;
