import { useState, useEffect } from 'react';
import './ModalUsuario.css';

export default function ModalUsuario({ isOpen, onClose, onSubmit, usuario = null, modo = 'crear', conjuntos = [], currentUser = null }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    usuario: '',
    contraseña: '',
    tipo_usuario: 'usuario',
    estado: 'activo',
    conjuntos: []
  });

  useEffect(() => {
    if (usuario && modo === 'editar') {
      // Extraer solo los IDs de los conjuntos si vienen como objetos
      const conjuntosIds = usuario.conjuntos 
        ? usuario.conjuntos.map(c => typeof c === 'object' ? c.id : c)
        : [];
      
      setFormData({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        cedula: usuario.cedula || '',
        usuario: usuario.usuario || '',
        contraseña: '',
        tipo_usuario: usuario.tipo_usuario || 'usuario',
        estado: usuario.estado || 'activo',
        conjuntos: conjuntosIds
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        cedula: '',
        usuario: '',
        contraseña: '',
        tipo_usuario: 'usuario',
        estado: 'activo',
        conjuntos: []
      });
    }
  }, [usuario, modo, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConjuntoToggle = (conjuntoId) => {
    setFormData(prev => {
      const conjuntosActuales = prev.conjuntos || [];
      const yaExiste = conjuntosActuales.includes(conjuntoId);
      
      return {
        ...prev,
        conjuntos: yaExiste
          ? conjuntosActuales.filter(id => id !== conjuntoId)
          : [...conjuntosActuales, conjuntoId]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modo === 'editar' && !formData.contraseña) {
      const { contraseña, ...dataParaActualizar } = formData;
      onSubmit(dataParaActualizar);
    } else {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className={`modal-lateral ${isOpen ? 'modal-abierto' : ''}`}>
        <div className="modal-header">
          <h2>{modo === 'crear' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
          <button className="boton-cerrar-modal" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-grupo">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="apellido">Apellido *</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-grupo">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-grupo">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="cedula">Cédula *</label>
              <input
                type="text"
                id="cedula"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-grupo">
            <label htmlFor="usuario">Usuario *</label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="contraseña">
              {modo === 'crear' ? 'Contraseña *' : 'Contraseña (dejar vacío para mantener)'}
            </label>
            <input
              type="password"
              id="contraseña"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              required={modo === 'crear'}
            />
          </div>

          <div className="form-grupo">
            <label>Conjuntos *</label>
            <div className="conjuntos-selector">
              {conjuntos.length === 0 ? (
                <p className="texto-sin-conjuntos">No hay conjuntos disponibles</p>
              ) : (
                conjuntos.map(conjunto => (
                  <label key={conjunto.id} className="checkbox-conjunto">
                    <input
                      type="checkbox"
                      checked={formData.conjuntos?.includes(conjunto.id) || false}
                      onChange={() => handleConjuntoToggle(conjunto.id)}
                    />
                    <span className="checkbox-label">{conjunto.nombre_conjunto || conjunto.nombre}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-grupo">
              <label htmlFor="tipo_usuario">Tipo de Usuario *</label>
              <select
                id="tipo_usuario"
                name="tipo_usuario"
                value={formData.tipo_usuario}
                onChange={handleChange}
                required
              >
                <option value="usuario">Usuario</option>
                {currentUser?.tipo_usuario === 'superadmin' && (
                  <>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </>
                )}
              </select>
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
              {modo === 'crear' ? 'Crear Usuario' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
