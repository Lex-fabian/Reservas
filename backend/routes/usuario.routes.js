const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { verificarToken, esSuperAdmin, esAdminOSuper } = require('../middleware/auth');

// Todas las rutas requieren autenticación básica
router.use(verificarToken);

// Rutas CRUD con RBAC
router.post('/', esAdminOSuper, usuarioController.crear);
router.get('/', esAdminOSuper, usuarioController.obtenerTodos);
router.get('/:id', esAdminOSuper, usuarioController.obtenerPorId);
router.put('/:id', esAdminOSuper, usuarioController.actualizar);
router.patch('/:id/estado', esAdminOSuper, usuarioController.cambiarEstado); // Si existe en controller

// Eliminar - SOLO SUPERADMIN
router.delete('/:id', esSuperAdmin, usuarioController.eliminar);

module.exports = router;
