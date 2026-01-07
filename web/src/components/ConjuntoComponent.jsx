import { useState, useEffect } from 'react';
import { conjuntoService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import ModalConjunto from './ModalConjunto';
import ModalConfirmacion from './ModalConfirmacion';
import Notificacion from './Notificacion';
import './ConjuntoComponent.css';

export default function ConjuntoComponent() {
  const [conjuntos, setConjuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const conjuntosPorPagina = 7;
  const [modalAbierto, setModalAbierto] = useState(false);
  const [conjuntoEditando, setConjuntoEditando] = useState(null);
  const [modoModal, setModoModal] = useState('crear');
  const [notificacionVisible, setNotificacionVisible] = useState(false);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [conjuntoAEliminar, setConjuntoAEliminar] = useState(null);

  useEffect(() => {
    cargarConjuntos();
  }, []);

  const cargarConjuntos = async () => {
    setLoading(true);
    try {
      const response = await conjuntoService.obtenerTodos();
      setConjuntos(response.conjuntos || []);
    } catch (error) {
      console.error('Error al cargar conjuntos:', error);
      alert('Error al cargar conjuntos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrear = () => {
    setModoModal('crear');
    setConjuntoEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (conjunto) => {
    setModoModal('editar');
    setConjuntoEditando(conjunto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setConjuntoEditando(null);
  };

  const handleSubmit = async (formData) => {
    // Cerrar modal inmediatamente
    cerrarModal();
    setNotificacionVisible(true);
    
    // Procesar en segundo plano
    try {
      if (modoModal === 'crear') {
        await conjuntoService.crear(formData);
      } else {
        await conjuntoService.actualizar(conjuntoEditando.id, formData);
      }
      cargarConjuntos();
    } catch (error) {
      console.error('Error al guardar conjunto:', error);
      alert('Error al guardar conjunto');
    }
  };

  const handleEliminar = (conjunto) => {
    setConjuntoAEliminar(conjunto);
    setModalConfirmacionAbierto(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await conjuntoService.eliminar(conjuntoAEliminar.id);
      setModalConfirmacionAbierto(false);
      setConjuntoAEliminar(null);
      cargarConjuntos();
      setNotificacionVisible(true);
    } catch (error) {
      console.error('Error al eliminar conjunto:', error);
      alert('Error al eliminar conjunto');
    }
  };

  const cancelarEliminacion = () => {
    setModalConfirmacionAbierto(false);
    setConjuntoAEliminar(null);
  };

  const getEstadoClass = (estado) => {
    return estado === 'activo' ? 'insignia-activo' : 'insignia-inactivo';
  };

  if (loading) {
    return (
      <div className="contenedor-conjuntos">
        <div className="cargando">Cargando conjuntos...</div>
      </div>
    );
  }

  // Calcular conjuntos para la página actual
  const indiceUltimo = paginaActual * conjuntosPorPagina;
  const indicePrimero = indiceUltimo - conjuntosPorPagina;
  const conjuntosActuales = conjuntos.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(conjuntos.length / conjuntosPorPagina);

  return (
    <div className="contenedor-conjuntos">
      <div className="encabezado-seccion">
        <h2>Conjuntos Residenciales</h2>
        <div className="acciones-encabezado">
          <p className="subtitulo-seccion">Total: {conjuntos.length} conjuntos</p>
          <button className="boton-nuevo" onClick={abrirModalCrear}>
            <FontAwesomeIcon icon={faPlus} /> Nuevo Conjunto
          </button>
        </div>
      </div>

      <div className="tabla-wrapper">
        <table className="tabla-conjuntos">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre del Conjunto</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: conjuntosPorPagina }).map((_, index) => {
              const conjunto = conjuntosActuales[index];
              const numeroFila = indicePrimero + index + 1;
              if (conjunto) {
                return (
                  <tr key={conjunto.id}>
                    <td>{numeroFila}</td>
                    <td>
                      <div className="conjunto-info">
                        <span className="nombre-conjunto">{conjunto.nombre_conjunto || conjunto.nombre}</span>
                      </div>
                    </td>
                    <td className="direccion-texto">{conjunto.direccion}</td>
                    <td>
                      <span className={`insignia ${getEstadoClass(conjunto.estado)}`}>
                        {conjunto.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          className="boton-editar" 
                          onClick={() => abrirModalEditar(conjunto)}
                          title="Editar conjunto"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="boton-eliminar" 
                          onClick={() => handleEliminar(conjunto)}
                          title="Eliminar conjunto"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
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

      <ModalConjunto
        isOpen={modalAbierto}
        onClose={cerrarModal}
        modo={modoModal}
        conjunto={conjuntoEditando}
        onSubmit={handleSubmit}
      />

      <ModalConfirmacion
        isOpen={modalConfirmacionAbierto}
        titulo="Confirmar Eliminación"
        mensaje={`¿Está seguro que desea eliminar el conjunto ${conjuntoAEliminar?.nombre_conjunto || conjuntoAEliminar?.nombre}?`}
        onConfirmar={confirmarEliminacion}
        onCancelar={cancelarEliminacion}
      />

      <Notificacion
        visible={notificacionVisible}
        mensaje={modoModal === 'crear' ? 'Conjunto creado exitosamente' : 'Conjunto actualizado exitosamente'}
        onClose={() => setNotificacionVisible(false)}
      />
    </div>
  );
}
