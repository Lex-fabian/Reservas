import { useEffect } from 'react';
import './Notificacion.css';

export default function Notificacion({ mensaje, visible, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="notificacion-contenedor">
      <div className="notificacion-tarjeta">
        <div className="notificacion-icono">✓</div>
        <span className="notificacion-mensaje">{mensaje}</span>
      </div>
    </div>
  );
}
