import './ModalConfirmacion.css';

export default function ModalConfirmacion({ 
  isOpen, 
  titulo, 
  mensaje, 
  onConfirmar, 
  onCancelar, 
  textoConfirmar = 'Eliminar',
  tipo = 'eliminar'
}) {
  if (!isOpen) return null;

  const claseBoton = tipo === 'peligro' ? 'boton-modal-peligro' : 'boton-modal-eliminar';

  return (
    <>
      <div className="modal-confirmacion-overlay" onClick={onCancelar}></div>
      <div className="modal-confirmacion">
        <div className="modal-confirmacion-header">
          <h3>{titulo}</h3>
        </div>
        <div className="modal-confirmacion-body">
          <p>{mensaje}</p>
        </div>
        <div className="modal-confirmacion-footer">
          <button className="boton-modal-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button className={claseBoton} onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </>
  );
}
