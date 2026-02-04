import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import PasswordInput from '../components/PasswordInput';
import ModalCambioPasswordObligatorio from '../components/ModalCambioPasswordObligatorio';
import '../style/login.css';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [modalCambioPasswordAbierto, setModalCambioPasswordAbierto] = useState(false);
  
  const { login, loading, error, handlePasswordChangeSuccess } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await login(usuario, contraseña, () => setModalCambioPasswordAbierto(true));
  };

  const onCambioPasswordExitoso = () => {
    setModalCambioPasswordAbierto(false);
    handlePasswordChangeSuccess();
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

          <PasswordInput
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            disabled={loading}
          />

          <button type="submit" className="boton-primario" disabled={loading}>
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <ModalCambioPasswordObligatorio
        isOpen={modalCambioPasswordAbierto}
        onClose={() => {}}
        onCambioExitoso={onCambioPasswordExitoso}
      />
    </div>
  );
}