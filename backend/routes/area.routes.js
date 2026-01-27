const express = require('express');
const router = express.Router();
const areaController = require('../controllers/area.controller');
const { verificarToken, esSuperAdmin, esAdminOSuper } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas CRUD
router.post('/', esAdminOSuper, areaController.crear);
router.get('/', areaController.obtenerTodas); // Visible para todos los autenticados
router.get('/conjunto/:conjuntoId', areaController.obtenerPorConjunto); // Visible para todos
router.get('/:id', areaController.obtenerPorId); // Visible para todos
router.put('/:id', esAdminOSuper, areaController.actualizar);

// Eliminar - SOLO SUPERADMIN (según requerimiento, admin no elimina)
router.delete('/:id', esSuperAdmin, areaController.eliminar);

module.exports = router;
