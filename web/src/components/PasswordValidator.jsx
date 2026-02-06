import { useState, useEffect } from 'react';
import './PasswordValidator.css';

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecial: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/
};

export default function PasswordValidator({ password, onValidChange }) {
  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  useEffect(() => {
    const newValidations = {
      minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
      hasUppercase: PASSWORD_REQUIREMENTS.hasUppercase.test(password),
      hasLowercase: PASSWORD_REQUIREMENTS.hasLowercase.test(password),
      hasNumber: PASSWORD_REQUIREMENTS.hasNumber.test(password),
      hasSpecial: PASSWORD_REQUIREMENTS.hasSpecial.test(password)
    };

    setValidations(newValidations);

    // Notificar si la contraseña es válida
    const isValid = Object.values(newValidations).every(v => v);
    if (onValidChange) {
      onValidChange(isValid);
    }
  }, [password, onValidChange]);

  const allValid = Object.values(validations).every(v => v);

  return (
    <div className="password-validator">
      <p className="validator-title">Tu contraseña debe tener:</p>
      <ul className="validator-list">
        <li className={validations.minLength ? 'valid' : 'invalid'}>
          <span className="icon">{validations.minLength ? '✓' : '✗'}</span>
          Mínimo 8 caracteres
        </li>
        <li className={validations.hasUppercase ? 'valid' : 'invalid'}>
          <span className="icon">{validations.hasUppercase ? '✓' : '✗'}</span>
          Una letra mayúscula (A-Z)
        </li>
        <li className={validations.hasLowercase ? 'valid' : 'invalid'}>
          <span className="icon">{validations.hasLowercase ? '✓' : '✗'}</span>
          Una letra minúscula (a-z)
        </li>
        <li className={validations.hasNumber ? 'valid' : 'invalid'}>
          <span className="icon">{validations.hasNumber ? '✓' : '✗'}</span>
          Un número (0-9)
        </li>
        <li className={validations.hasSpecial ? 'valid' : 'invalid'}>
          <span className="icon">{validations.hasSpecial ? '✓' : '✗'}</span>
          Un carácter especial (!@#$%^&*...)
        </li>
      </ul>
      {allValid && (
        <p className="validator-success">✓ Tu contraseña cumple todos los requisitos</p>
      )}
    </div>
  );
}
