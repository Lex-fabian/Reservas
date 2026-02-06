/**
 * Validador de contraseñas seguras
 */

const REQUISITOS_PASSWORD = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Valida que una contraseña cumpla con los requisitos de seguridad
 */
function validarPasswordSeguro(password) {
  const errores = [];

  // Verificar longitud mínima
  if (!password || password.length < REQUISITOS_PASSWORD.MIN_LENGTH) {
    errores.push(`La contraseña debe tener al menos ${REQUISITOS_PASSWORD.MIN_LENGTH} caracteres`);
  }

  // Verificar mayúscula
  if (REQUISITOS_PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errores.push('La contraseña debe contener al menos una letra mayúscula');
  }

  // Verificar minúscula
  if (REQUISITOS_PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errores.push('La contraseña debe contener al menos una letra minúscula');
  }

  // Verificar número
  if (REQUISITOS_PASSWORD.REQUIRE_NUMBER && !/\d/.test(password)) {
    errores.push('La contraseña debe contener al menos un número');
  }

  // Verificar carácter especial
  if (REQUISITOS_PASSWORD.REQUIRE_SPECIAL) {
    const specialCharsRegex = new RegExp(`[${REQUISITOS_PASSWORD.SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharsRegex.test(password)) {
      errores.push(`La contraseña debe contener al menos un carácter especial (${REQUISITOS_PASSWORD.SPECIAL_CHARS})`);
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Genera una contraseña segura aleatoria
 */
function generarPasswordSeguro(longitud = 12) {
  const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const minusculas = 'abcdefghijklmnopqrstuvwxyz';
  const numeros = '0123456789';
  const especiales = REQUISITOS_PASSWORD.SPECIAL_CHARS;
  
  let password = '';
  
  // Asegurar al menos uno de cada tipo
  password += mayusculas[Math.floor(Math.random() * mayusculas.length)];
  password += minusculas[Math.floor(Math.random() * minusculas.length)];
  password += numeros[Math.floor(Math.random() * numeros.length)];
  password += especiales[Math.floor(Math.random() * especiales.length)];
  
  // Rellenar el resto
  const todosCaracteres = mayusculas + minusculas + numeros + especiales;
  for (let i = password.length; i < longitud; i++) {
    password += todosCaracteres[Math.floor(Math.random() * todosCaracteres.length)];
  }
  
  // Mezclar caracteres
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Mensaje de ayuda con los requisitos
 */
function obtenerRequisitosPasswordMensaje() {
  const requisitos = [
    `Mínimo ${REQUISITOS_PASSWORD.MIN_LENGTH} caracteres`,
    'Al menos una letra mayúscula (A-Z)',
    'Al menos una letra minúscula (a-z)',
    'Al menos un número (0-9)',
    `Al menos un carácter especial (${REQUISITOS_PASSWORD.SPECIAL_CHARS})`
  ];
  
  return 'La contraseña debe cumplir:\n' + requisitos.map(r => `- ${r}`).join('\n');
}

module.exports = {
  validarPasswordSeguro,
  generarPasswordSeguro,
  obtenerRequisitosPasswordMensaje,
  REQUISITOS_PASSWORD
};
