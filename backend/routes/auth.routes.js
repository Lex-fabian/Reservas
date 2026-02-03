const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth');
const { registrarLogin } = require('../middleware/auditoria');

const { authLimiter } = require('../middleware/security');
const { registerValidation, loginValidation } = require('../validators/auth.validator');
const validate = require('../middleware/validate');

router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, registrarLogin, authController.login);
router.get('/profile', verificarToken, authController.getProfile);

module.exports = router;
