import { useState, useEffect } from 'react';
import { usuarioService, authService } from '../services/api';
import ModalUsuario from './ModalUsuario';
import './UsuarioComponent.css';

export default function UsuarioComponent() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [modoModal, setModoModal] = useState('crear');

  useEffect(() => {
    cargarUsuarios();
  }, []);

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
    try {
      if (modoModal === 'crear') {
        await authService.register(
          formData.nombre,
          formData.apellido,
          formData.email,
          formData.telefono,
          formData.cedula,
          formData.usuario,
          formData.contraseña
        );
        alert('Usuario creado exitosamente');
      } else {
        await usuarioService.actualizar(usuarioEditando.id, formData);
        alert('Usuario actualizado exitosamente');
      }
      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert(error.response?.data?.error || 'Error al guardar usuario');
    }
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

  return (
    <div className="contenedor-usuarios">
      <div className="encabezado-seccion">
        <h2>Usuarios Registrados</h2>
        <div className="acciones-encabezado">
          <p className="subtitulo-seccion">Total: {usuarios.length} usuarios</p>
          <button className="boton-nuevo" onClick={abrirModalCrear}>
            + Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="tabla-wrapper">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Reservas</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>
                  <div className="usuario-info">
                    <div className="avatar-tabla">
                      {usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="nombre-usuario">
                      {usuario.nombre} {usuario.apellido}
                    </span>
                  </div>
                </td>
                <td>{usuario.email}</td>
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
                <td className="centrado">{usuario.Reservas?.length || 0}</td>
                <td>{new Date(usuario.createdAt).toLocaleDateString('es-ES')}</td>
                <td>
                  <div className="acciones-tabla">
                    <button 
                      className="boton-tabla boton-ver" 
                      onClick={() => alert(`Ver detalles de ${usuario.nombre} ${usuario.apellido}`)}
                      title="Ver detalles"
                    >brirModalEditar(usuario)
                      title="Editar usuario"
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalUsuario
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onSubmit={handleSubmit}
        usuario={usuarioEditando}
        modo={modoModal}
      />
    </div>
  );
}