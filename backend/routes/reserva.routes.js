const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller');
const { verificarToken, esAdminOSuper } = require('../middleware/auth');

const upload = require('../middleware/upload');

router.use(verificarToken);

router.post('/', upload.single('comprobante'), reservaController.crear);
router.get('/', reservaController.obtenerTodas);
router.get('/:id', reservaController.obtenerPorId);
router.put('/:id', reservaController.actualizar);
router.patch('/:id/confirmar', esAdminOSuper, reservaController.confirmar);
router.patch('/:id/cancelar', reservaController.cancelar);
router.delete('/:id', esAdminOSuper, reservaController.eliminar);

module.exports = router;
