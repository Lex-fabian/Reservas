import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (usuario, contraseña, onPasswordChangeRequired) => {
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(usuario, contraseña);

      if (response.debe_cambiar_password) {
        onPasswordChangeRequired?.();
        return { success: false, passwordChangeRequired: true };
      }

      if (!authService.isAdminOrSuper()) {
        authService.logout();
        throw new Error('Acceso denegado. Solo administradores pueden acceder.');
      }

      navigate('/inicio');
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.mensaje || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    if (authService.isAdminOrSuper()) {
      navigate('/inicio');
    } else {
      authService.logout();
      setError('Acceso denegado. Solo administradores pueden acceder.');
    }
  };

  return {
    login,
    loading,
    error,
    handlePasswordChangeSuccess,
  };
};
