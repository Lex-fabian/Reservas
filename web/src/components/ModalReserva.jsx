import { useState, useEffect } from 'react';
import { usuarioService, conjuntoService, areaService } from '../services/api';
import CalendarioReservas from './CalendarioReservas';
import './ModalReserva.css';

export default function ModalReserva({ isOpen, onClose, onSubmit, reserva = null, modo = 'crear' }) {
  const [formData, setFormData] = useState({
    usuarioId: '',
    conjuntoId: '',
    areaId: '',
    fecha_reserva: '',
    hora_inicio: '',
    hora_fin: '',
    personas: '',
    observaciones: ''
  });
  
  const [usuarios, setUsuarios] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);

  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
      cargarConjuntos();
      cargarAreas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (reserva && modo === 'editar') {
      setFormData({
        usuarioId: reserva.usuarioId || '',
        conjuntoId: reserva.conjuntoId || '',
        areaId: reserva.areaId || '',
        fecha_reserva: reserva.fecha_reserva || '',
        hora_inicio: reserva.hora_inicio || '',
        hora_fin: reserva.hora_fin || '',
        personas: reserva.personas || '',
        observaciones: reserva.observaciones || ''
      });
    } else {
      setFormData({
        usuarioId: '',
        conjuntoId: '',
        areaId: '',
        fecha_reserva: '',
        hora_inicio: '',
        hora_fin: '',
        personas: '',
        observaciones: ''
      });
    }
  }, [reserva, modo, isOpen]);

  // Cuando cambia el conjunto, filtrar áreas
  useEffect(() => {
    if (formData.conjuntoId) {
      const areasFiltradas = areas.filter(area => area.conjuntoId === parseInt(formData.conjuntoId));
      setAreasDisponibles(areasFiltradas);
    } else {
      setAreasDisponibles([]);
    }
  }, [formData.conjuntoId, areas]);

  // Cuando cambia el área, obtener información completa del área
  useEffect(() => {
    if (formData.areaId) {
      const area = areasDisponibles.find(a => a.id === parseInt(formData.areaId));
      setAreaSeleccionada(area || null);
    } else {
      setAreaSeleccionada(null);
    }
  }, [formData.areaId, areasDisponibles]);

  const cargarUsuarios = async () => {
    try {
      const response = await usuarioService.obtenerTodos();
      setUsuarios(response.usuarios || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const cargarConjuntos = async () => {
    try {
      const response = await conjuntoService.obtenerTodos();
      setConjuntos(response.conjuntos || []);
    } catch (error) {
      console.error('Error al cargar conjuntos:', error);
    }
  };

  const cargarAreas = async () => {
    try {
      const response = await areaService.obtenerTodas();
      setAreas(response.areas || []);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSeleccionCalendario = (seleccion) => {
    setFormData(prev => ({
      ...prev,
      fecha_reserva: seleccion.fecha,
      hora_inicio: seleccion.horaInicio,
      hora_fin: seleccion.horaFin
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convertir IDs a números
    const datos = {
      ...formData,
      usuarioId: parseInt(formData.usuarioId),
      conjuntoId: parseInt(formData.conjuntoId),
      areaId: parseInt(formData.areaId),
      personas: parseInt(formData.personas)
    };
    
    onSubmit(datos);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-reserva" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{modo === 'editar' ? 'Ver Reserva' : 'Nueva Reserva'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grupo">
            <label htmlFor="usuarioId">Usuario *</label>
            <select
              id="usuarioId"
              name="usuarioId"
              value={formData.usuarioId}
              onChange={handleChange}
              disabled={modo === 'editar'}
              required
            >
              <option value="">Seleccionar usuario...</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre} {usuario.apellido} - {usuario.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grupo">
            <label htmlFor="conjuntoId">Conjunto *</label>
            <select
              id="conjuntoId"
              name="conjuntoId"
              value={formData.conjuntoId}
              onChange={handleChange}
              disabled={modo === 'editar'}
              required
            >
              <option value="">Seleccionar conjunto...</option>
              {conjuntos.map(conjunto => (
                <option key={conjunto.id} value={conjunto.id}>
                  {conjunto.nombre_conjunto || conjunto.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grupo">
            <label htmlFor="areaId">Área *</label>
            <select
              id="areaId"
              name="areaId"
              value={formData.areaId}
              onChange={handleChange}
              disabled={modo === 'editar' || !formData.conjuntoId}
              required
            >
              <option value="">Seleccionar área...</option>
              {areasDisponibles.map(area => (
                <option key={area.id} value={area.id}>
                  {area.nombre_area || area.nombre} (Cap: {area.maximo_personas || area.capacidad}) - {area.tiempo_minimo || 60} min
                </option>
              ))}
            </select>
            {!formData.conjuntoId && (
              <small style={{ color: '#999', marginTop: '4px', display: 'block' }}>
                Selecciona un conjunto primero
              </small>
            )}
          </div>

          {modo === 'crear' && formData.areaId && (
            <div className="form-grupo calendario-container">
              <label>Selecciona fecha y hora en el calendario *</label>
              <CalendarioReservas
                areaId={parseInt(formData.areaId)}
                areaSeleccionada={areaSeleccionada}
                onSeleccionFecha={handleSeleccionCalendario}
                fechaSeleccionada={formData.fecha_reserva}
                horaInicioSeleccionada={formData.hora_inicio}
              />
            </div>
          )}

          {modo === 'editar' && (
            <>
              {/* Información del Usuario */}
              <div className="info-section">
                <h3 className="section-title">👤 Información del Cliente</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Nombre:</span>
                    <span className="info-value">{reserva.Usuario?.nombre} {reserva.Usuario?.apellido}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{reserva.Usuario?.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Teléfono:</span>
                    <span className="info-value">{reserva.Usuario?.telefono || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Información de la Reserva */}
              <div className="info-section">
                <h3 className="section-title">📅 Detalles de la Reserva</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Área:</span>
                    <span className="info-value">{reserva.Area?.nombre_area || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Fecha:</span>
                    <span className="info-value">{new Date(reserva.fecha_reserva).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Hora Inicio:</span>
                    <span className="info-value">{reserva.hora_inicio}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Hora Fin:</span>
                    <span className="info-value">{reserva.hora_fin}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Personas:</span>
                    <span className="info-value">{reserva.personas} personas</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Estado:</span>
                    <span className={`estado-badge estado-${reserva.estado}`}>{reserva.estado?.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {reserva.observaciones && (
                <div className="info-section">
                  <h3 className="section-title">📝 Observaciones</h3>
                  <div className="observaciones-box">
                    {reserva.observaciones}
                  </div>
                </div>
              )}

              {/* Comprobante de Pago */}
              {reserva.foto_comprobante && (
                <div className="info-section">
                  <h3 className="section-title">💳 Comprobante de Pago</h3>
                  <div className="comprobante-wrapper">
                    <img 
                      src={reserva.foto_comprobante.includes('data:') ? reserva.foto_comprobante : `data:image/jpeg;base64,${reserva.foto_comprobante}`}
                      alt="Comprobante de Pago" 
                      className="comprobante-preview"
                      onClick={() => {
                        const imgSrc = reserva.foto_comprobante.includes('data:') ? reserva.foto_comprobante : `data:image/jpeg;base64,${reserva.foto_comprobante}`;
                        window.open(imgSrc, '_blank');
                      }}
                      onError={(e) => {
                        console.error('Error cargando imagen base64');
                        e.target.style.display = 'none';
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.textContent = '⚠️ Error al cargar la imagen del comprobante';
                        e.target.parentNode.appendChild(errorMsg);
                      }}
                    />
                    <p className="comprobante-hint">🔍 Click en la imagen para ver en tamaño completo</p>
                  </div>
                </div>
              )}

              {!reserva.foto_comprobante && reserva.estado === 'pendiente' && (
                <div className="info-section">
                  <div className="no-comprobante">
                    <p>⚠️ Esta reserva no tiene comprobante de pago adjunto</p>
                  </div>
                </div>
              )}
            </>
          )}

          {modo === 'crear' && (
            <div className="form-grupo">
              <label htmlFor="personas">Personas *</label>
              <input
                type="number"
                id="personas"
                name="personas"
                min="1"
                max={areaSeleccionada?.maximo_personas || 100}
                value={formData.personas}
                onChange={handleChange}
                required
              />
              {areaSeleccionada && (
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Capacidad máxima: {areaSeleccionada.maximo_personas} personas
                </small>
              )}
            </div>
          )}

          {modo === 'crear' && (
            <div className="form-grupo">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                name="observaciones"
                rows="3"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Detalles adicionales de la reserva..."
              />
            </div>
          )}

          {modo === 'crear' && (
            <div className="modal-footer">
              <button type="button" className="boton-secundario" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="boton-primario">
                Crear Reserva
              </button>
            </div>
          )}
          
          {modo === 'editar' && (
            <div className="modal-footer">
              <button type="button" className="boton-primario" onClick={onClose}>
                Cerrar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
