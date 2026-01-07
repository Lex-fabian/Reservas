import { useState, useEffect } from 'react';
import './ModalConjunto.css';

export default function ModalConjunto({ isOpen, onClose, onSubmit, conjunto = null, modo = 'crear' }) {
  const [formData, setFormData] = useState({
    nombre_conjunto: '',
    direccion: '',
    estado: 'activo'
  });

  useEffect(() => {
    if (conjunto && modo === 'editar') {
      setFormData({
        nombre_conjunto: conjunto.nombre_conjunto || conjunto.nombre || '',
        direccion: conjunto.direccion || '',
        estado: conjunto.estado || 'activo'
      });
    } else {
      setFormData({
        nombre_conjunto: '',
        direccion: '',
        estado: 'activo'
      });
    }
  }, [conjunto, modo, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className={`modal-lateral ${isOpen ? 'modal-abierto' : ''}`}>
        <div className="modal-header">
          <h2>{modo === 'crear' ? 'Nuevo Conjunto' : 'Editar Conjunto'}</h2>
          <button className="boton-cerrar-modal" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grupo">
            <label htmlFor="nombre_conjunto">Nombre del Conjunto *</label>
            <input
              type="text"
              id="nombre_conjunto"
              name="nombre_conjunto"
              value={formData.nombre_conjunto}
              onChange={handleChange}
              placeholder="Ej: Conjunto Residencial Los Arrayanes"
              required
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="direccion">Dirección *</label>
            <textarea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej: Av. 6 de Diciembre N34-150 y Portugal"
              rows="3"
              required
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="estado">Estado *</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="boton-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="boton-guardar">
              {modo === 'crear' ? 'Crear Conjunto' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
