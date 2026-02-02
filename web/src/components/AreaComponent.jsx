import { useState, useEffect } from 'react';
import { areaService, conjuntoService, authService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import ModalArea from './ModalArea';
import ModalConfirmacion from './ModalConfirmacion';
import Notificacion from './Notificacion';
import Paginacion from './Paginacion';
import './AreaComponent.css';

export default function AreaComponent() {
  const [areas, setAreas] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const areasPorPagina = 7;
  const [modalAbierto, setModalAbierto] = useState(false);
  const [areaEditando, setAreaEditando] = useState(null);
  const [modoModal, setModoModal] = useState('crear');
  const [notificacionVisible, setNotificacionVisible] = useState(false);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [areaAEliminar, setAreaAEliminar] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(authService.getUsuario());
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    setLoading(true);
    try {
      // Cargar conjuntos y áreas desde la API
      const [conjuntosResponse, areasResponse] = await Promise.all([
        conjuntoService.obtenerTodos(),
        areaService.obtenerTodas()
      ]);
      
      setConjuntos(conjuntosResponse.conjuntos || []);
      setAreas(areasResponse.areas || []);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
      alert('Error al cargar áreas');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrear = () => {
    setModoModal('crear');
    setAreaEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (area) => {
    setModoModal('editar');
    setAreaEditando(area);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAreaEditando(null);
  };

  const handleSubmit = async (formData) => {
    // Cerrar modal inmediatamente
    cerrarModal();
    setNotificacionVisible(true);
    
    // Procesar en segundo plano
    try {
      if (modoModal === 'crear') {
        await areaService.crear(formData);
      } else {
        await areaService.actualizar(areaEditando.id, formData);
      }
      cargarAreas();
    } catch (error) {
      console.error('Error al guardar área:', error);
      alert('Error al guardar área');
    }
  };

  const handleEliminar = (area) => {
    setAreaAEliminar(area);
    setModalConfirmacionAbierto(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await areaService.eliminar(areaAEliminar.id);
      setModalConfirmacionAbierto(false);
      setAreaAEliminar(null);
      cargarAreas();
      setNotificacionVisible(true);
    } catch (error) {
      console.error('Error al eliminar área:', error);
      alert('Error al eliminar área');
    }
  };

  const cancelarEliminacion = () => {
    setModalConfirmacionAbierto(false);
    setAreaAEliminar(null);
  };

  const getEstadoClass = (estado) => {
    return estado === 'activo' ? 'insignia-activo' : 'insignia-inactivo';
  };

  if (loading) {
    return (
      <div className="contenedor-areas">
        <div className="cargando">Cargando áreas...</div>
      </div>
    );
  }

  // Calcular áreas para la página actual
  const indiceUltimo = paginaActual * areasPorPagina;
  const indicePrimero = indiceUltimo - areasPorPagina;
  const areasActuales = areas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(areas.length / areasPorPagina);

  return (
    <div className="contenedor-areas">
      <div className="encabezado-seccion">
        <h2>Áreas Comunes</h2>
        <div className="acciones-encabezado">
          <p className="subtitulo-seccion">Total: {areas.length} áreas</p>
          <button className="boton-nuevo" onClick={abrirModalCrear}>
            <FontAwesomeIcon icon={faPlus} /> Nueva Área
          </button>
        </div>
      </div>

      <div className="tabla-wrapper">
      <div className="tabla-wrapper">
        {areas.length > 0 ? (
          <table className="tabla-areas">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre del Área</th>
                <th>Conjunto</th>
                <th>Capacidad</th>
                <th>Costo</th>
                <th>Tiempo Mín.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: areasPorPagina }).map((_, index) => {
                const area = areasActuales[index];
                const numeroFila = indicePrimero + index + 1;
                if (area) {
                  return (
                    <tr key={area.id}>
                      <td>{numeroFila}</td>
                      <td>
                        <div className="area-info">
                          <span className="nombre-area">{area.nombre_area || area.nombre}</span>
                        </div>
                      </td>
                      <td>{area.Conjunto?.nombre_conjunto || area.conjunto}</td>
                      <td className="centrado">{area.maximo_personas || area.capacidad} pers.</td>
                      <td>${area.costo}</td>
                      <td className="centrado">{area.tiempo_minimo || area.tiempoMinimo} min</td>
                      <td>
                        <span className={`insignia ${getEstadoClass(area.estado)}`}>
                          {area.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="boton-editar"
                            onClick={() => abrirModalEditar(area)}
                            title="Editar área"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          
                          {currentUser?.tipo_usuario === 'superadmin' && (
                            <button
                              className="boton-eliminar"
                              onClick={() => handleEliminar(area)}
                              title="Eliminar área"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
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
        ) : (
          <div className="mensaje-sin-datos">
            <p>No tiene asignada ninguna área.</p>
          </div>
        )}
      </div>
      </div>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onChange={setPaginaActual}
      />

      <ModalArea
        isOpen={modalAbierto}
        onClose={cerrarModal}
        modo={modoModal}
        area={areaEditando}
        conjuntos={conjuntos}
        onSubmit={handleSubmit}
      />

      <ModalConfirmacion
        isOpen={modalConfirmacionAbierto}
        titulo="Confirmar Eliminación"
        mensaje={`¿Está seguro que desea eliminar el área ${areaAEliminar?.nombre_area || areaAEliminar?.nombre}?`}
        onConfirmar={confirmarEliminacion}
        onCancelar={cancelarEliminacion}
      />

      <Notificacion
        visible={notificacionVisible}
        mensaje={modoModal === 'crear' ? 'Área creada exitosamente' : 'Área actualizada exitosamente'}
        onClose={() => setNotificacionVisible(false)}
      />
    </div>
  );
}
