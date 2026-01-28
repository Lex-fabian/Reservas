import { useState, useEffect } from 'react';
import { reservaService, conjuntoService, areaService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faEye, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import ModalReserva from './ModalReserva';
import ModalConfirmacion from './ModalConfirmacion';
import Notificacion from './Notificacion';
import './ReservaComponent.css';

export default function ReservaComponent() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const reservasPorPagina = 7;
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);
  const [modoModal, setModoModal] = useState('crear');
  const [notificacionVisible, setNotificacionVisible] = useState(false);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [reservaAEliminar, setReservaAEliminar] = useState(null);
  const [accionConfirmacion, setAccionConfirmacion] = useState('');
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
  
  const [conjuntos, setConjuntos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filtroConjunto, setFiltroConjunto] = useState('');
  const [filtroArea, setFiltroArea] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (filtroConjunto) {
      cargarAreas(filtroConjunto);
    } else {
      setAreas([]);
      setFiltroArea('');
    }
  }, [filtroConjunto]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [reservasRes, conjuntosRes] = await Promise.all([
        reservaService.obtenerTodas(),
        conjuntoService.obtenerTodos()
      ]);
      setReservas(reservasRes.reservas || []);
      setConjuntos(conjuntosRes.conjuntos || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarAreas = async (conjuntoId) => {
    try {
      const areasRes = await areaService.obtenerPorConjunto(conjuntoId);
      setAreas(areasRes);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  const abrirModalCrear = () => {
    setModoModal('crear');
    setReservaEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (reserva) => {
    setModoModal('editar');
    setReservaEditando(reserva);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setReservaEditando(null);
  };

  const handleSubmit = async (formData) => {
    cerrarModal();
    setNotificacionVisible(true);
    
    try {
      if (modoModal === 'crear') {
        await reservaService.crear(formData);
      } else {
        await reservaService.actualizar(reservaEditando.id, formData);
      }
      cargarDatos(); 
    } catch (error) {
      console.error('Error al guardar reserva:', error);
      alert('Error al guardar reserva');
    }
  };

  const handleEliminar = (reserva) => {
    setReservaAEliminar(reserva);
    setAccionConfirmacion('cancelar');
    setMensajeConfirmacion('¿Está seguro que desea cancelar la reserva?');
    setModalConfirmacionAbierto(true);
  };

  const handleConfirmar = (reserva) => {
    setReservaAEliminar(reserva);
    setAccionConfirmacion('confirmar');
    setMensajeConfirmacion('¿Está seguro que desea confirmar esta reserva?');
    setModalConfirmacionAbierto(true);
  };

  const handleRechazar = (reserva) => {
    setReservaAEliminar(reserva);
    setAccionConfirmacion('rechazar');
    setMensajeConfirmacion('¿Está seguro que desea rechazar esta reserva?');
    setModalConfirmacionAbierto(true);
  };

  const confirmarEliminacion = async () => {
    try {
      if (accionConfirmacion === 'confirmar') {
        await reservaService.confirmar(reservaAEliminar.id);
        setNotificacionVisible(true);
      } else if (accionConfirmacion === 'rechazar') {
        await reservaService.cancelar(reservaAEliminar.id, 'Rechazada por el administrador');
        setNotificacionVisible(true);
      } else {
        await reservaService.cancelar(reservaAEliminar.id);
        setNotificacionVisible(true);
      }
      setModalConfirmacionAbierto(false);
      setReservaAEliminar(null);
      setAccionConfirmacion('');
      cargarDatos();
    } catch (error) {
      console.error('Error al procesar la acción:', error);
      alert('Error al procesar la acción');
    }
  };

  const cancelarEliminacion = () => {
    setModalConfirmacionAbierto(false);
    setReservaAEliminar(null);
    setAccionConfirmacion('');
  };

  const getEstadoClass = (estado) => {
    const classes = {
      pendiente: 'insignia-advertencia',
      confirmada: 'insignia-exito',
      cancelada: 'insignia-peligro',
      completada: 'insignia-info',
    };
    return classes[estado] || 'insignia-secundaria';
  };

  if (loading) {
    return (
      <div className="contenedor-reservas">
        <div className="cargando">Cargando reservas...</div>
      </div>
    );
  }

  const reservasFiltradas = reservas.filter(reserva => {
    if (filtroConjunto && reserva.conjuntoId !== parseInt(filtroConjunto) && reserva.Area?.conjuntoId !== parseInt(filtroConjunto)) {
       return false;
    }
    if (filtroArea && reserva.areaId !== parseInt(filtroArea)) {
      return false;
    }
    return true;
  });

  const indiceUltimo = paginaActual * reservasPorPagina;
  const indicePrimero = indiceUltimo - reservasPorPagina;
  const reservasActuales = reservasFiltradas.slice(indicePrimero, indiceUltimo); 
  const totalPaginas = Math.ceil(reservasFiltradas.length / reservasPorPagina);

  return (
    <div className="contenedor-reservas">
      <div className="encabezado-seccion">
        <div className="titulo-y-contador">
          <h2>Reservas</h2>
          <span className="contador-badge">{reservasFiltradas.length}</span>
        </div>

        <div className="acciones-encabezado">
          <select 
            className="filtro-select"
            value={filtroConjunto}
            onChange={(e) => setFiltroConjunto(e.target.value)}
          >
            <option value="">Todos los Conjuntos</option>
            {Array.isArray(conjuntos) && conjuntos.map(conjunto => (
              <option key={conjunto.id} value={conjunto.id}>
                {conjunto.nombre_conjunto}
              </option>
            ))}
          </select>

          {filtroConjunto && (
            <select 
              className="filtro-select"
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
            >
              <option value="">Todas las Áreas</option>
              {Array.isArray(areas) && areas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.nombre_area}
                </option>
              ))}
            </select>
          )}

          <button className="boton-nuevo" onClick={abrirModalCrear}>
            <FontAwesomeIcon icon={faPlus} /> Nueva Reserva
          </button>
        </div>
      </div>

      <div className="tabla-wrapper">
        <table className="tabla-reservas">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Área</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Personas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: reservasPorPagina }).map((_, index) => {
              const reserva = reservasActuales[index];
              const numeroFila = indicePrimero + index + 1;
              if (reserva) {
                return (
                  <tr key={reserva.id}>
                    <td>{numeroFila}</td>
                    <td>{reserva.Usuario?.nombre || 'N/A'} {reserva.Usuario?.apellido || ''}</td>
                    <td>{reserva.Area?.nombre_area || reserva.servicio || 'N/A'}</td>
                    <td>{reserva.fecha_reserva || reserva.fecha}</td>
                    <td>{reserva.hora_inicio || reserva.hora} - {reserva.hora_fin}</td>
                    <td className="centrado">{reserva.personas} pers.</td>
                    <td>
                      <span className={`insignia ${getEstadoClass(reserva.estado)}`}>
                        {reserva.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        {reserva.estado === 'pendiente' ? (
                          <>
                            <button
                              className="boton-confirmar"
                              onClick={() => handleConfirmar(reserva)}
                              title="Confirmar reserva"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                            <button
                              className="boton-rechazar"
                              onClick={() => handleRechazar(reserva)}
                              title="Rechazar reserva"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="boton-editar"
                              onClick={() => abrirModalEditar(reserva)}
                              title="Ver reserva"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            {reserva.estado !== 'cancelada' && (
                              <button
                                className="boton-eliminar"
                                onClick={() => handleEliminar(reserva)}
                                title="Cancelar reserva"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={`empty-${index}`}>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="paginacion">
          {Array.from({ length: totalPaginas }).map((_, index) => {
            const numeroPagina = index + 1;
            const mostrarPagina = 
              numeroPagina === 1 ||
              numeroPagina === totalPaginas ||
              (numeroPagina >= paginaActual - 2 && numeroPagina <= paginaActual + 2);
            
            if (!mostrarPagina && numeroPagina === paginaActual - 3) {
              return <span key={numeroPagina} className="puntos-suspensivos">...</span>;
            }
            if (!mostrarPagina && numeroPagina === paginaActual + 3) {
              return <span key={numeroPagina} className="puntos-suspensivos">...</span>;
            }
            if (!mostrarPagina) {
              return null;
            }
            
            return (
              <button
                key={numeroPagina}
                className={`boton-paginacion ${paginaActual === numeroPagina ? 'activo' : ''}`}
                onClick={() => setPaginaActual(numeroPagina)}
              >
                {numeroPagina}
              </button>
            );
          })}
        </div>
      )}

      <ModalReserva
        isOpen={modalAbierto}
        onClose={cerrarModal}
        modo={modoModal}
        reserva={reservaEditando}
        onSubmit={handleSubmit}
      />

      <ModalConfirmacion
        isOpen={modalConfirmacionAbierto}
        titulo={accionConfirmacion === 'confirmar' ? 'Confirmar Reserva' : accionConfirmacion === 'rechazar' ? 'Rechazar Reserva' : 'Confirmar Cancelación'}
        mensaje={mensajeConfirmacion}
        onConfirmar={confirmarEliminacion}
        onCancelar={cancelarEliminacion}
      />

      <Notificacion
        visible={notificacionVisible}
        mensaje={
          accionConfirmacion === 'confirmar' 
            ? 'Reserva confirmada exitosamente' 
            : accionConfirmacion === 'rechazar'
            ? 'Reserva rechazada exitosamente'
            : modoModal === 'crear' 
            ? 'Reserva creada exitosamente' 
            : 'Reserva actualizada exitosamente'
        }
        onClose={() => setNotificacionVisible(false)}
      />
    </div>
  );
}
