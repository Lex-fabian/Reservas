const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracion.controller');
const { verificarToken } = require('../middleware/auth');
const { verificarAdmin } = require('../middleware/security'); // O usar lógica de roles en controlador

// Rutas protegidas
router.use(verificarToken);

// Obtener configuración (disponible para todos los usuarios autenticados para ver a dónde transferir)
router.get('/', configuracionController.getConfig);

// Actualizar configuración (Solo SuperAdmin - validado en controlador, pero restringir ruta es mejor práctica)
router.put('/', configuracionController.updateConfig);
router.post('/', configuracionController.updateConfig); // Flexibilidad

module.exports = router;
