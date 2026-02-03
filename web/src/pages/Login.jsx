import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import ModalCambioPasswordObligatorio from '../components/ModalCambioPasswordObligatorio';
import '../style/login.css';

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [modalCambioPasswordAbierto, setModalCambioPasswordAbierto] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usuario || !contraseña) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authService.login(usuario, contraseña);
      
      // Verificar si debe cambiar contraseña
      if (response.debe_cambiar_password) {
        setModalCambioPasswordAbierto(true);
        setLoading(false);
        return;
      }
      
      // Check role strictly before navigating
      if (authService.isAdminOrSuper()) {
        navigate('/inicio');
      } else {
        // Not authorized
        authService.logout();
        setError('Acceso denegado. Solo administradores pueden acceder.');
      }
    } catch (error) {
      setError(error.response?.data?.mensaje || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleCambioPasswordExitoso = () => {
    setModalCambioPasswordAbierto(false);
    // Redirigir a inicio después de cambiar contraseña
    if (authService.isAdminOrSuper()) {
      navigate('/inicio');
    } else {
      authService.logout();
      setError('Acceso denegado. Solo administradores pueden acceder.');
    }
  };

  return (
    <div className="contenedor-auth">
      <div className="seccion-promocional">
        <h2 className="titulo-promocional">Reserva áreas de manera rápida y fácil</h2>
        <p className="texto-promocional">
          Gestiona todas tus reservas en un solo lugar. Simple, rápido y eficiente.
        </p>
      </div>

      <div className="tarjeta-auth">
        <h1 className="titulo-auth">Reservas</h1>

        {error && <div className="mensaje-error">{error}</div>}

        <form onSubmit={handleSubmit} className="formulario-auth">
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            disabled={loading}
            required
          />

          <div className="contenedor-password">
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="boton-ojo"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              disabled={loading}
            >
              {mostrarPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button type="submit" className="boton-primario" disabled={loading}>
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <ModalCambioPasswordObligatorio
        isOpen={modalCambioPasswordAbierto}
        onClose={() => {}}
        onCambioExitoso={handleCambioPasswordExitoso}
      />
    </div>
  );
}
