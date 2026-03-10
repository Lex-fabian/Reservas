import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PasswordValidatorProps {
  password: string;
  onValidChange?: (isValid: boolean) => void;
}

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecial: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/
};

interface Validations {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export default function PasswordValidator({ password, onValidChange }: PasswordValidatorProps) {
  const [validations, setValidations] = useState<Validations>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  useEffect(() => {
    const newValidations: Validations = {
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
    <View style={styles.container}>
      <Text style={styles.title}>Tu contraseña debe tener:</Text>
      
      <View style={styles.requirementsList}>
        <RequirementItem 
          isValid={validations.minLength}
          text="Mínimo 8 caracteres"
        />
        <RequirementItem 
          isValid={validations.hasUppercase}
          text="Una letra mayúscula (A-Z)"
        />
        <RequirementItem 
          isValid={validations.hasLowercase}
          text="Una letra minúscula (a-z)"
        />
        <RequirementItem 
          isValid={validations.hasNumber}
          text="Un número (0-9)"
        />
        <RequirementItem 
          isValid={validations.hasSpecial}
          text="Un carácter especial (!@#$%^&*...)"
        />
      </View>

      {allValid && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✓ Tu contraseña cumple todos los requisitos</Text>
        </View>
      )}
    </View>
  );
}

interface RequirementItemProps {
  isValid: boolean;
  text: string;
}

function RequirementItem({ isValid, text }: RequirementItemProps) {
  return (
    <View style={styles.requirementItem}>
      <Text style={[styles.icon, isValid ? styles.validIcon : styles.invalidIcon]}>
        {isValid ? '✓' : '✗'}
      </Text>
      <Text style={[styles.requirementText, isValid ? styles.validText : styles.invalidText]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  requirementsList: {
    gap: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  icon: {
    fontWeight: 'bold',
    fontSize: 14,
    width: 16,
    textAlign: 'center',
  },
  validIcon: {
    color: '#4CAF50',
  },
  invalidIcon: {
    color: '#f44336',
  },
  requirementText: {
    fontSize: 13,
    flex: 1,
  },
  validText: {
    color: '#4CAF50',
  },
  invalidText: {
    color: '#999',
  },
  successContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
