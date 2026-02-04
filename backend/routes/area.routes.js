const express = require('express');
const router = express.Router();
const areaController = require('../controllers/area.controller');
const { verificarToken, esSuperAdmin, esAdminOSuper } = require('../middleware/auth');
const { registrarAuditoria } = require('../middleware/auditoria');
const { capturarDatosAnteriores } = require('../middleware/capturarDatosAnteriores');

router.use(verificarToken);

// CRUD
router.post('/', esAdminOSuper, registrarAuditoria('crear', 'area'), areaController.crear);
router.get('/', areaController.obtenerTodas); 
router.get('/conjunto/:conjuntoId', areaController.obtenerPorConjunto); 
router.get('/:id', areaController.obtenerPorId); 
router.put('/:id', esAdminOSuper, capturarDatosAnteriores('area'), registrarAuditoria('actualizar', 'area'), areaController.actualizar);

// Eliminar - SOLO SUPERADMIN (según requerimiento, admin no elimina)
router.delete('/:id', esSuperAdmin, capturarDatosAnteriores('area'), registrarAuditoria('eliminar', 'area'), areaController.eliminar);

module.exports = router;
