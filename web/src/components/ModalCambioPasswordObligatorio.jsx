import { useState } from 'react';
import './ModalCambioPasswordObligatorio.css';

export default function ModalCambioPasswordObligatorio({ isOpen, onClose, onCambioExitoso }) {
  const [formData, setFormData] = useState({
    contraseñaActual: '',
    contraseñaNueva: '',
    confirmarContraseña: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validarPassword = (password) => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.contraseñaActual || !formData.contraseñaNueva || !formData.confirmarContraseña) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const errorValidacion = validarPassword(formData.contraseñaNueva);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    if (formData.contraseñaNueva !== formData.confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.contraseñaActual === formData.contraseñaNueva) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setCargando(true);

    try {
      // Llamar al endpoint de cambio de contraseña obligatoria
      const response = await fetch('/api/usuarios/cambiar-password-obligatoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contraseñaActual: formData.contraseñaActual,
          contraseñaNueva: formData.contraseñaNueva
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      // Éxito
      onCambioExitoso();
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al cambiar la contraseña');
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-password-obligatorio-overlay">
      <div className="modal-password-obligatorio">
        <div className="modal-password-obligatorio-header">
          <h2>🔐 Cambio de Contraseña Obligatorio</h2>
        </div>

        <div className="modal-password-obligatorio-contenido">
          <div className="alerta-cambio-obligatorio">
            <span className="icono-alerta">⚠️</span>
            <div>
              <p className="alerta-titulo">Debes cambiar tu contraseña temporal</p>
              <p className="alerta-descripcion">
                Por seguridad, es obligatorio cambiar la contraseña temporal que te fue asignada.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mensaje-error">
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-grupo">
              <label htmlFor="contraseñaActual">Contraseña Temporal *</label>
              <div className="input-password-wrapper">
                <input
                  type={mostrarActual ? 'text' : 'password'}
                  id="contraseñaActual"
                  name="contraseñaActual"
                  value={formData.contraseñaActual}
                  onChange={handleChange}
                  placeholder="Ingresa la contraseña temporal"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarActual(!mostrarActual)}
                >
                  {mostrarActual ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-grupo">
              <label htmlFor="contraseñaNueva">Nueva Contraseña *</label>
              <div className="input-password-wrapper">
                <input
                  type={mostrarNueva ? 'text' : 'password'}
                  id="contraseñaNueva"
                  name="contraseñaNueva"
                  value={formData.contraseñaNueva}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarNueva(!mostrarNueva)}
                >
                  {mostrarNueva ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-grupo">
              <label htmlFor="confirmarContraseña">Confirmar Nueva Contraseña *</label>
              <div className="input-password-wrapper">
                <input
                  type={mostrarConfirmar ? 'text' : 'password'}
                  id="confirmarContraseña"
                  name="confirmarContraseña"
                  value={formData.confirmarContraseña}
                  onChange={handleChange}
                  placeholder="Repite la nueva contraseña"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                >
                  {mostrarConfirmar ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="requisitos-password">
              <p className="requisitos-titulo">Requisitos de la contraseña:</p>
              <ul>
                <li className={formData.contraseñaNueva.length >= 6 ? 'cumplido' : ''}>
                  Mínimo 6 caracteres
                </li>
                <li className={formData.contraseñaNueva === formData.confirmarContraseña && formData.contraseñaNueva ? 'cumplido' : ''}>
                  Las contraseñas coinciden
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="boton-cambiar-password"
              disabled={cargando}
            >
              {cargando ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
