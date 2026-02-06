const { body } = require('express-validator');
const { validarPasswordSeguro } = require('./password.validator');

const registerValidation = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  
  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  
  body('usuario')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es requerido')
    .isLength({ min: 4 }).withMessage('El usuario debe tener al menos 4 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('El usuario solo puede contener letras, números y guiones bajos'),
  
  body('contraseña')
    .trim()
    .notEmpty().withMessage('La contraseña es requerida')
    .custom((value) => {
      const validacion = validarPasswordSeguro(value);
      if (!validacion.valido) {
        throw new Error(validacion.errores.join('. '));
      }
      return true;
    }),
    
  body('telefono')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Debe proporcionar un número de teléfono válido'),

  body('cedula')
    .optional()
    .trim()
    .isLength({ min: 10, max: 13 }).withMessage('La cédula debe tener entre 10 y 13 caracteres')
];

const loginValidation = [
  body('usuario')
    .trim()
    .notEmpty().withMessage('El usuario es requerido'),
  
  body('contraseña')
    .trim()
    .notEmpty().withMessage('La contraseña es requerida')
];

module.exports = {
  registerValidation,
  loginValidation
};
