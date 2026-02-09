import { useEffect } from 'react';
import './Notificacion.css';

export default function Notificacion({ mensaje, visible, onClose, tipo = 'exito' }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, tipo === 'error' ? 5000 : 3000); // Errores duran más tiempo
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, tipo]);

  if (!visible) return null;

  const iconos = {
    exito: '✓',
    error: '✗',
    advertencia: '⚠',
    info: 'ℹ'
  };

  const clasesTipo = {
    exito: 'notificacion-exito',
    error: 'notificacion-error',
    advertencia: 'notificacion-advertencia',
    info: 'notificacion-info'
  };

  return (
    <div className="notificacion-contenedor">
      <div className={`notificacion-tarjeta ${clasesTipo[tipo]}`}>
        <div className="notificacion-icono">{iconos[tipo]}</div>
        <span className="notificacion-mensaje">{mensaje}</span>
      </div>
    </div>
  );
}
