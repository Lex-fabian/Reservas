import { useState, useEffect } from 'react';
import { usuarioService, authService, conjuntoService } from '../services/api';
import ModalUsuario from './ModalUsuario';
import ModalPasswordGenerada from './ModalPasswordGenerada';
import ModalConfirmacion from './ModalConfirmacion';
import Notificacion from './Notificacion';
import Paginacion from './Paginacion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import './UsuarioComponent.css';

export default function UsuarioComponent() {
  const [usuarios, setUsuarios] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [modoModal, setModoModal] = useState('crear');
  const [notificacionVisible, setNotificacionVisible] = useState(false);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 7;
  const [currentUser, setCurrentUser] = useState(null);
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const [credencialesGeneradas, setCredencialesGeneradas] = useState({ usuario: '', password: '' });
  const [busqueda, setBusqueda] = useState('');
  const [conjuntoFiltro, setConjuntoFiltro] = useState('');

  useEffect(() => {
    const user = authService.getUsuario();
    setCurrentUser(user);
    cargarUsuarios();
    cargarConjuntos();
  }, []);

  const cargarConjuntos = async () => {
    try {
      const response = await conjuntoService.obtenerTodos();
      setConjuntos(response.conjuntos || []);
    } catch (error) {
      console.error('Error al cargar conjuntos:', error);
      setConjuntos([
        { id: 1, nombre_conjunto: 'Conjunto Primavera', direccion: 'Calle 45 #12-34', estado: 'activo' },
        { id: 2, nombre_conjunto: 'Conjunto Verano', direccion: 'Carrera 23 #45-67', estado: 'activo' },
        { id: 3, nombre_conjunto: 'Conjunto Otoño', direccion: 'Avenida 15 #89-12', estado: 'activo' },
        { id: 4, nombre_conjunto: 'Conjunto Invierno', direccion: 'Transversal 78 #34-56', estado: 'inactivo' }
      ]);
    }
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await usuarioService.obtenerTodos();
      setUsuarios(response.usuarios || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrear = () => {
    setModoModal('crear');
    setUsuarioEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario) => {
    setModoModal('editar');
    setUsuarioEditando(usuario);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
  };

  const handleSubmit = async (formData) => {
    // Cerrar modal inmediatamente
    cerrarModal();
    setNotificacionVisible(true);
    
    // Procesar en segundo plano
    try {
      if (modoModal === 'crear') {
        // Crear usuario SIN contraseña (se genera automáticamente en backend)
        const response = await usuarioService.crear({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          cedula: formData.cedula,
          usuario: formData.usuario,
          // NO enviamos contraseña - el backend la genera
          tipo_usuario: formData.tipo_usuario,
          estado: formData.estado,
          conjuntos: formData.conjuntos || []
        });
        
        // Mostrar modal con la contraseña generada
        if (response.contraseñaTemporal) {
          setCredencialesGeneradas({
            usuario: formData.usuario,
            password: response.contraseñaTemporal
          });
          setModalPasswordAbierto(true);
        }
      } else {
        await usuarioService.actualizar(usuarioEditando.id, formData);
      }
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert(error.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleEliminar = async (usuario) => {
    setUsuarioAEliminar(usuario);
    setModalConfirmacionAbierto(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await usuarioService.eliminar(usuarioAEliminar.id);
      setModalConfirmacionAbierto(false);
      setUsuarioAEliminar(null);
      cargarUsuarios();
      setNotificacionVisible(true);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const cancelarEliminacion = () => {
    setModalConfirmacionAbierto(false);
    setUsuarioAEliminar(null);
  };

  const getRolClass = (tipo_usuario) => {
    if (tipo_usuario === 'superadmin') return 'insignia-superadmin';
    if (tipo_usuario === 'admin') return 'insignia-admin';
    return 'insignia-usuario';
  };

  const getEstadoClass = (estado) => {
    return estado === 'activo' ? 'insignia-activo' : 'insignia-inactivo';
  };

  const getRolTexto = (tipo_usuario) => {
    if (tipo_usuario === 'superadmin') return 'Super Admin';
    if (tipo_usuario === 'admin') return 'Admin';
    return 'Usuario';
  };

  if (loading) {
    return (
      <div className="contenedor-usuarios">
        <div className="cargando">Cargando usuarios...</div>
      </div>
    );
  }

  // Filtrar usuarios por búsqueda y conjunto
  const usuariosFiltrados = usuarios.filter(usuario => {
    // Filtro de búsqueda (nombre o cédula)
    const terminoBusqueda = busqueda.toLowerCase();
    const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
    const cedula = usuario.cedula?.toString().toLowerCase() || '';
    const cumpleBusqueda = nombreCompleto.includes(terminoBusqueda) || cedula.includes(terminoBusqueda);
    
    // Filtro de conjunto
    const cumpleConjunto = !conjuntoFiltro || 
      (usuario.conjuntos && usuario.conjuntos.some(c => c.id?.toString() === conjuntoFiltro));
    
    return cumpleBusqueda && cumpleConjunto;
  });

  // Calcular usuarios para la página actual
  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosActuales = usuariosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  return (
    <div className="contenedor-usuarios">
      <div className="encabezado-seccion">
        <h2>Usuarios Registrados</h2>
        <div className="acciones-encabezado">
          <p className="subtitulo-seccion">Total: {usuarios.length} usuarios</p>
          <button className="boton-nuevo" onClick={abrirModalCrear}>
            <FontAwesomeIcon icon={faUserPlus} /> Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="filtros-container">
        <div className="filtro-busqueda">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="input-busqueda"
          />
        </div>
        <div className="filtro-conjunto">
          <select
            value={conjuntoFiltro}
            onChange={(e) => {
              setConjuntoFiltro(e.target.value);
              setPaginaActual(1);
            }}
            className="select-filtro"
          >
            <option value="">Todos los conjuntos</option>
            {conjuntos
              .filter(c => c.estado === 'activo')
              .map(conjunto => (
                <option key={conjunto.id} value={conjunto.id}>
                  {conjunto.nombre_conjunto}
                </option>
              ))}
          </select>
        </div>
        {(busqueda || conjuntoFiltro) && (
          <div className="filtros-info">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </div>
        )}
      </div>

      <div className="tabla-wrapper">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Usuario</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th>Conjuntos</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: usuariosPorPagina }).map((_, index) => {
              const usuario = usuariosActuales[index];
              const numeroFila = indicePrimero + index + 1;
              if (usuario) {
                return (
                  <tr key={usuario.id}>
                    <td>{numeroFila}</td>
                    <td>{usuario.nombre} {usuario.apellido}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.usuario}</td>
                    <td>{usuario.cedula}</td>
                    <td>{usuario.telefono}</td>
                    <td>
                      {usuario.conjuntos && usuario.conjuntos.length > 0
                        ? usuario.conjuntos.map(c => c.nombre_conjunto || c.nombre).join(', ')
                        : 'Sin conjuntos'}
                    </td>
                    <td>
                      <span className={`insignia ${getRolClass(usuario.tipo_usuario)}`}>
                        {getRolTexto(usuario.tipo_usuario)}
                      </span>
                    </td>
                    <td>
                      <span className={`insignia ${getEstadoClass(usuario.estado)}`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {(currentUser?.tipo_usuario === 'superadmin' || (currentUser?.tipo_usuario === 'admin' && usuario.tipo_usuario !== 'superadmin')) && (
                          <button
                            className="boton-editar"
                            onClick={() => abrirModalEditar(usuario)}
                            title="Editar usuario"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                        
                        {currentUser?.tipo_usuario === 'superadmin' && (
                          <button
                            className="boton-eliminar"
                            onClick={() => handleEliminar(usuario)}
                            title="Eliminar usuario"
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
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onChange={setPaginaActual}
      />

      <ModalUsuario
        isOpen={modalAbierto}
        onClose={cerrarModal}
        modo={modoModal}
        usuario={usuarioEditando}
        onSubmit={handleSubmit}
        conjuntos={conjuntos}
        currentUser={currentUser}
      />

      <ModalConfirmacion
        isOpen={modalConfirmacionAbierto}
        titulo="Confirmar Eliminación"
        mensaje={`¿Está seguro que desea eliminar al usuario ${usuarioAEliminar?.nombre} ${usuarioAEliminar?.apellido}?`}
        onConfirmar={confirmarEliminacion}
        onCancelar={cancelarEliminacion}
      />

      <ModalPasswordGenerada
        isOpen={modalPasswordAbierto}
        onClose={() => setModalPasswordAbierto(false)}
        usuario={credencialesGeneradas.usuario}
        password={credencialesGeneradas.password}
      />

      <Notificacion
        visible={notificacionVisible}
        mensaje={modoModal === 'crear' ? 'Usuario creado exitosamente' : 'Usuario actualizado exitosamente'}
        onClose={() => setNotificacionVisible(false)}
      />
    </div>
  );
}