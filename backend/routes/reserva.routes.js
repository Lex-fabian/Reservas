const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller');
const { verificarToken, esAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.post('/', reservaController.crear);
router.get('/', reservaController.obtenerTodas);
router.get('/:id', reservaController.obtenerPorId);
router.put('/:id', reservaController.actualizar);
router.patch('/:id/cancelar', reservaController.cancelar);
router.delete('/:id', esAdmin, reservaController.eliminar);

module.exports = router;
