const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas CRUD
router.get('/', usuarioController.obtenerTodos);
router.get('/:id', usuarioController.obtenerPorId);
router.put('/:id', usuarioController.actualizar);
router.delete('/:id', usuarioController.eliminar);

module.exports = router;
