const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller');
const { verificarToken, esAdminOSuper } = require('../middleware/auth');
const { registrarAuditoria } = require('../middleware/auditoria');

router.use(verificarToken);

router.post('/', registrarAuditoria('crear', 'reserva'), reservaController.crear);
router.get('/', reservaController.obtenerTodas);
router.get('/:id', reservaController.obtenerPorId);
router.put('/:id', registrarAuditoria('actualizar', 'reserva'), reservaController.actualizar);
router.patch('/:id/confirmar', esAdminOSuper, registrarAuditoria('confirmar_reserva', 'reserva'), reservaController.confirmar);
router.patch('/:id/cancelar', registrarAuditoria('cancelar_reserva', 'reserva'), reservaController.cancelar);
router.delete('/:id', esAdminOSuper, registrarAuditoria('eliminar', 'reserva'), reservaController.eliminar);

module.exports = router;
