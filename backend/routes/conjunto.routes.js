const express = require('express');
const router = express.Router();
const conjuntoController = require('../controllers/conjunto.controller');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas CRUD
router.post('/', conjuntoController.crear);
router.get('/', conjuntoController.obtenerTodos);
router.get('/:id', conjuntoController.obtenerPorId);
router.put('/:id', conjuntoController.actualizar);
router.delete('/:id', conjuntoController.eliminar);

module.exports = router;
