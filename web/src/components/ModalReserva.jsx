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
              <div className="form-row">
                <div className="form-grupo">
                  <label htmlFor="fecha_reserva">Fecha</label>
                  <input
                    type="date"
                    id="fecha_reserva"
                    name="fecha_reserva"
                    value={formData.fecha_reserva}
                    disabled
                  />
                </div>

                <div className="form-grupo">
                  <label htmlFor="personas">Personas</label>
                  <input
                    type="number"
                    id="personas"
                    name="personas"
                    value={formData.personas}
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-grupo">
                  <label htmlFor="hora_inicio">Hora Inicio</label>
                  <input
                    type="time"
                    id="hora_inicio"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    disabled
                  />
                </div>

                <div className="form-grupo">
                  <label htmlFor="hora_fin">Hora Fin</label>
                  <input
                    type="time"
                    id="hora_fin"
                    name="hora_fin"
                    value={formData.hora_fin}
                    disabled
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  rows="3"
                  value={formData.observaciones}
                  disabled
                />
              </div>
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
