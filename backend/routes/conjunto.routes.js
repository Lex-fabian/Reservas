const express = require('express');
const router = express.Router();
const conjuntoController = require('../controllers/conjunto.controller');
const { verificarToken, esSuperAdmin, esAdminOSuper } = require('../middleware/auth');
const { registrarAuditoria } = require('../middleware/auditoria');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas CRUD
// Solo SuperAdmin puede crear/editar/eliminar Conjuntos
router.post('/', esSuperAdmin, registrarAuditoria('crear', 'conjunto'), conjuntoController.crear);
router.put('/:id', esSuperAdmin, registrarAuditoria('actualizar', 'conjunto'), conjuntoController.actualizar);
router.delete('/:id', esSuperAdmin, registrarAuditoria('eliminar', 'conjunto'), conjuntoController.eliminar);

// Leer conjuntos - Visible para todos los autenticados (se filtra en controller)
router.get('/', conjuntoController.obtenerTodos);
router.get('/:id', conjuntoController.obtenerPorId);

module.exports = router;
