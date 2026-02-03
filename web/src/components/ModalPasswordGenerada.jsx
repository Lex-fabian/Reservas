import { useState } from 'react';
import './ModalPasswordGenerada.css';

export default function ModalPasswordGenerada({ isOpen, onClose, usuario, password }) {
  const [copiado, setCopiado] = useState(false);

  const copiarCredenciales = () => {
    const texto = `🔐 Credenciales de acceso\n\nUsuario: ${usuario}\nContraseña: ${password}\n\n⚠️ IMPORTANTE: Debes cambiar esta contraseña en tu primer inicio de sesión.`;
    
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }).catch(err => {
      console.error('Error al copiar:', err);
      alert('No se pudo copiar al portapapeles');
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-password-generada">
        <div className="modal-password-header">
          <h2>✅ Usuario Creado Exitosamente</h2>
          <button className="boton-cerrar-modal" onClick={onClose}>✕</button>
        </div>

        <div className="modal-password-contenido">
          <div className="alerta-info">
            <span className="icono-info">ℹ️</span>
            <p>Se ha generado una contraseña temporal. El usuario debe cambiarla en su primer inicio de sesión.</p>
          </div>

          <div className="credenciales-box">
            <div className="credencial-item">
              <label>Usuario:</label>
              <div className="credencial-valor">{usuario}</div>
            </div>
            
            <div className="credencial-item">
              <label>Contraseña temporal:</label>
              <div className="credencial-valor password-valor">{password}</div>
            </div>
          </div>

          <div className="acciones-password">
            <button 
              className="boton-copiar"
              onClick={copiarCredenciales}
            >
              {copiado ? '✓ Copiado' : '📋 Copiar Credenciales'}
            </button>
            
            <p className="texto-ayuda">
              Copia estas credenciales y envíalas al usuario por WhatsApp, SMS o email.
            </p>
          </div>

          <div className="alerta-advertencia">
            <span className="icono-advertencia">⚠️</span>
            <p>Esta contraseña solo se mostrará una vez. Asegúrate de copiarla antes de cerrar esta ventana.</p>
          </div>
        </div>

        <div className="modal-password-footer">
          <button className="boton-cerrar-grande" onClick={onClose}>
            Entendido, Cerrar
          </button>
        </div>
      </div>
    </>
  );
}
