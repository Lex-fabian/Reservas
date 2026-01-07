const express = require('express');
const router = express.Router();
const areaController = require('../controllers/area.controller');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas CRUD
router.post('/', areaController.crear);
router.get('/', areaController.obtenerTodas);
router.get('/conjunto/:conjuntoId', areaController.obtenerPorConjunto);
router.get('/:id', areaController.obtenerPorId);
router.put('/:id', areaController.actualizar);
router.delete('/:id', areaController.eliminar);

module.exports = router;
