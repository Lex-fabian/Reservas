const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { verificarToken, esSuperAdmin, esAdminOSuper } = require('../middleware/auth');
const { registrarAuditoria } = require('../middleware/auditoria');
const { capturarDatosAnteriores } = require('../middleware/capturarDatosAnteriores');

// Todas las rutas requieren autenticación básica
router.use(verificarToken);

// Cambiar contraseña propia (cualquier usuario autenticado)
router.post('/cambiar-password', usuarioController.cambiarContraseñaPropia);

// Cambiar contraseña obligatoria (primer login con contraseña temporal)
router.post('/cambiar-password-obligatoria', usuarioController.cambiarPasswordObligatoria);

// Rutas CRUD con RBAC
router.post('/', esAdminOSuper, registrarAuditoria('crear', 'usuario'), usuarioController.crear);
router.get('/', esAdminOSuper, usuarioController.obtenerTodos);
router.get('/:id', esAdminOSuper, usuarioController.obtenerPorId);
router.put('/:id', esAdminOSuper, capturarDatosAnteriores('usuario'), registrarAuditoria('actualizar', 'usuario'), usuarioController.actualizar);
router.patch('/:id/estado', esAdminOSuper, capturarDatosAnteriores('usuario'), registrarAuditoria('cambiar_estado', 'usuario'), usuarioController.cambiarEstado);

// Eliminar - SOLO SUPERADMIN
router.delete('/:id', esSuperAdmin, capturarDatosAnteriores('usuario'), registrarAuditoria('eliminar', 'usuario'), usuarioController.eliminar);

module.exports = router;
