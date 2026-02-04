import { useState, useEffect } from 'react';
import './ModalArea.css';

export default function ModalArea({ isOpen, onClose, onSubmit, area = null, modo = 'crear', conjuntos = [] }) {
  const [formData, setFormData] = useState({
    nombre_area: '',
    conjuntoId: '',
    maximo_personas: '',
    costo: '',
    tiempo_minimo: '',
    estado: 'activo',
    fotos: null
  });
  const [previewImagen, setPreviewImagen] = useState(null);

  useEffect(() => {
    if (area && modo === 'editar') {
      setFormData({
        nombre_area: area.nombre_area || area.nombre || '',
        conjuntoId: area.conjuntoId || '',
        maximo_personas: area.maximo_personas || area.capacidad || '',
        costo: area.costo || '',
        tiempo_minimo: area.tiempo_minimo || area.tiempoMinimo || '',
        estado: area.estado || 'activo',
        fotos: null
      });
      setPreviewImagen(area.fotos || area.imagenUrl || null);
    } else {
      setFormData({
        nombre_area: '',
        conjuntoId: '',
        maximo_personas: '',
        costo: '',
        tiempo_minimo: '',
        estado: 'activo',
        fotos: null
      });
      setPreviewImagen(null);
    }
  }, [area, modo, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setFormData(prev => ({
            ...prev,
            fotos: compressedBase64
          }));
          setPreviewImagen(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const eliminarImagen = () => {
    setFormData(prev => ({
      ...prev,
      fotos: null
    }));
    setPreviewImagen(null);
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
          <h2>{modo === 'crear' ? 'Nueva Área' : 'Editar Área'}</h2>
          <button className="boton-cerrar-modal" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grupo">
            <label htmlFor="nombre_area">Nombre del Área *</label>
            <input
              type="text"
              id="nombre_area"
              name="nombre_area"
              value={formData.nombre_area}
              onChange={handleChange}
              placeholder="Ej: Piscina Principal"
              required
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="conjuntoId">Conjunto *</label>
            <select
              id="conjuntoId"
              name="conjuntoId"
              value={formData.conjuntoId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un conjunto</option>
              {conjuntos.map(conjunto => (
                <option key={conjunto.id} value={conjunto.id}>
                  {conjunto.nombre_conjunto || conjunto.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grupo">
            <label htmlFor="imagen">Imagen del Área</label>
            <div className="contenedor-imagen">
              {previewImagen && (
                <div className="preview-imagen">
                  <img src={previewImagen} alt="Preview" />
                  <button
                    type="button"
                    className="boton-eliminar-imagen"
                    onClick={eliminarImagen}
                    title="Eliminar imagen"
                  >
                    ✕
                  </button>
                </div>
              )}
              <input
                type="file"
                id="imagen"
                name="imagen"
                accept="image/*"
                onChange={handleImageChange}
                className="input-archivo"
              />
              <label htmlFor="imagen" className="label-archivo">
                {previewImagen ? 'Cambiar imagen' : '📷 Seleccionar imagen'}
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-grupo">
              <label htmlFor="maximo_personas">Capacidad (personas) *</label>
              <input
                type="number"
                id="maximo_personas"
                name="maximo_personas"
                value={formData.maximo_personas}
                onChange={handleChange}
                placeholder="50"
                min="1"
                required
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="costo">Costo ($) *</label>
              <input
                type="number"
                id="costo"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                placeholder="25"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-grupo">
              <label htmlFor="tiempo_minimo">Tiempo Mínimo (min) *</label>
              <input
                type="number"
                id="tiempo_minimo"
                name="tiempo_minimo"
                value={formData.tiempo_minimo}
                onChange={handleChange}
                placeholder="60"
                min="15"
                step="15"
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
          </div>

          <div className="modal-footer">
            <button type="button" className="boton-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="boton-guardar">
              {modo === 'crear' ? 'Crear Área' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
