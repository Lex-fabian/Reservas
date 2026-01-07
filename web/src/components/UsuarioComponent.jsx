import { useState, useEffect } from 'react';
import './UsuarioComponent.css';

export default function UsuarioComponent() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const usuariosMock = [
          {
            id: 1,
            nombre: 'Lex',
            email: 'lex@example.com',
            rol: 'admin',
            estado: 'activo',
            reservas: 5,
            fechaRegistro: '2024-01-15'
          },
          {
            id: 2,
            nombre: 'María González',
            email: 'maria@example.com',
            rol: 'usuario',
            estado: 'activo',
            reservas: 3,
            fechaRegistro: '2024-02-20'
          },
          {
            id: 3,
            nombre: 'Carlos López',
            email: 'carlos@example.com',
            rol: 'usuario',
            estado: 'activo',
            reservas: 8,
            fechaRegistro: '2024-01-10'
          },
          {
            id: 4,
            nombre: 'Ana Martínez',
            email: 'ana@example.com',
            rol: 'usuario',
            estado: 'inactivo',
            reservas: 1,
            fechaRegistro: '2024-03-05'
          }
        ];
        setUsuarios(usuariosMock);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setLoading(false);
    }
  };

  const getRolClass = (rol) => {
    return rol === 'admin' ? 'insignia-admin' : 'insignia-usuario';
  };

  const getEstadoClass = (estado) => {
    return estado === 'activo' ? 'insignia-activo' : 'insignia-inactivo';
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
        <p className="subtitulo-seccion">Total: {usuarios.length} usuarios</p>
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
                    <span className="nombre-usuario">{usuario.nombre}</span>
                  </div>
                </td>
                <td>{usuario.email}</td>
                <td>
                  <span className={`insignia ${getRolClass(usuario.rol)}`}>
                    {usuario.rol === 'admin' ? 'Admin' : 'Usuario'}
                  </span>
                </td>
                <td>
                  <span className={`insignia ${getEstadoClass(usuario.estado)}`}>
                    {usuario.estado}
                  </span>
                </td>
                <td className="centrado">{usuario.reservas}</td>
                <td>{new Date(usuario.fechaRegistro).toLocaleDateString('es-ES')}</td>
                <td>
                  <div className="acciones-tabla">
                    <button 
                      className="boton-tabla boton-ver" 
                      onClick={() => alert(`Ver detalles de ${usuario.nombre}`)}
                      title="Ver detalles"
                    >
                      Ver
                    </button>
                    <button 
                      className="boton-tabla boton-editar" 
                      onClick={() => alert(`Editar ${usuario.nombre}`)}
                      title="Editar usuario"
                    >
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
