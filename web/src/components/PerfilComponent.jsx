import { useState } from 'react';
import { authService, usuarioService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faUser, faEnvelope, faPhone, faIdCard } from '@fortawesome/free-solid-svg-icons';
import PasswordValidator from '../components/PasswordValidator';
import '../style/Perfil.css';

export default function PerfilComponent() {
  const usuario = authService.getUsuario();
  const [contraseñaActual, setContraseñaActual] = useState('');
  const [contraseñaNueva, setContraseñaNueva] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [passwordValido, setPasswordValido] = useState(false);

  const handleCambiarContraseña = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    // Validaciones
    if (!contraseñaActual || !contraseñaNueva || !confirmarContraseña) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (!passwordValido) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    if (contraseñaNueva !== confirmarContraseña) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await usuarioService.cambiarContraseñaPropia({
        contraseñaActual,
        contraseñaNueva
      });

      setMensaje('✅ Contraseña actualizada exitosamente');
      setContraseñaActual('');
      setContraseñaNueva('');
      setConfirmarContraseña('');
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMensaje(''), 5000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
      </div>

      <div className="perfil-content">
        {/* Información del usuario */}
        <div className="perfil-seccion">
          <h2>Información Personal</h2>
          <div className="perfil-info-grid">
            <div className="perfil-info-item">
              <FontAwesomeIcon icon={faUser} className="perfil-icon" />
              <div>
                <label>Nombre Completo</label>
                <p>{usuario?.nombre} {usuario?.apellido}</p>
              </div>
            </div>
            <div className="perfil-info-item">
              <FontAwesomeIcon icon={faUser} className="perfil-icon" />
              <div>
                <label>Usuario</label>
                <p>{usuario?.usuario}</p>
              </div>
            </div>
            <div className="perfil-info-item">
              <FontAwesomeIcon icon={faEnvelope} className="perfil-icon" />
              <div>
                <label>Email</label>
                <p>{usuario?.email}</p>
              </div>
            </div>
            <div className="perfil-info-item">
              <FontAwesomeIcon icon={faPhone} className="perfil-icon" />
              <div>
                <label>Teléfono</label>
                <p>{usuario?.telefono || 'No registrado'}</p>
              </div>
            </div>
            <div className="perfil-info-item">
              <FontAwesomeIcon icon={faIdCard} className="perfil-icon" />
              <div>
                <label>Cédula</label>
                <p>{usuario?.cedula || 'No registrada'}</p>
              </div>
            </div>
            <div className="perfil-info-item">
              <FontAwesomeIcon icon={faUser} className="perfil-icon" />
              <div>
                <label>Rol</label>
                <p className="perfil-rol">{usuario?.tipo_usuario}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="perfil-seccion">
          <h2><FontAwesomeIcon icon={faKey} /> Cambiar Contraseña</h2>
          
          {mensaje && <div className="perfil-mensaje-exito">{mensaje}</div>}
          {error && <div className="perfil-mensaje-error">{error}</div>}

          <form onSubmit={handleCambiarContraseña} className="perfil-form-password">
            <div className="perfil-form-group">
              <label>Contraseña Actual</label>
              <input
                type="password"
                value={contraseñaActual}
                onChange={(e) => setContraseñaActual(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                disabled={cargando}
              />
            </div>

            <div className="perfil-form-group">
              <label>Nueva Contraseña</label>
              <input
                type="password"
                value={contraseñaNueva}
                onChange={(e) => setContraseñaNueva(e.target.value)}
                placeholder="Ingresa la nueva contraseña"
                disabled={cargando}
              />
            </div>

            <div className="perfil-form-group">
              <label>Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={confirmarContraseña}
                onChange={(e) => setConfirmarContraseña(e.target.value)}
                placeholder="Confirma la nueva contraseña"
                disabled={cargando}
              />
            </div>

            <PasswordValidator 
              password={contraseñaNueva} 
              onValidChange={setPasswordValido}
            />

            <button 
              type="submit" 
              className="perfil-btn-cambiar"
              disabled={cargando || !passwordValido}
            >
              {cargando ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
