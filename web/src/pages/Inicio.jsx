import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservaService, authService } from '../services/api';
import UsuarioComponent from '../components/UsuarioComponent';
import ConjuntoComponent from '../components/ConjuntoComponent';
import AreaComponent from '../components/AreaComponent';
import '../style/Inicio.css';

export default function Inicio() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [vistaActual, setVistaActual] = useState('reservas'); 
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);

  useEffect(() => {
    const user = authService.getUsuario();
    setUsuario(user);
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    setLoading(true);
    try {
      const response = await reservaService.obtenerTodas();
      setReservas(response.reservas);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    try {
      await reservaService.cancelar(id);
      alert('Reserva cancelada');
      cargarReservas();
    } catch (error) {
      alert('Error al cancelar reserva');
    }
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas salir?')) {
      authService.logout();
      navigate('/login');
    }
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

  return (
    <div className="panel-principal">
      <nav className="barra-navegacion">
        <div className="marca-navegacion">
          <h2>ReservasApp</h2>
        </div>
        <div className="menu-navegacion">
          <div className="botones-navegacion">
            <button 
              className={`boton-nav ${vistaActual === 'reservas' ? 'activo' : ''}`}
              onClick={() => setVistaActual('reservas')}
            >
              📋 Reservas
            </button>
            <button 
              className={`boton-nav ${vistaActual === 'usuarios' ? 'activo' : ''}`}
              onClick={() => setVistaActual('usuarios')}
            >
              👥 Usuarios
            </button>
            <button 
              className={`boton-nav ${vistaActual === 'conjuntos' ? 'activo' : ''}`}
              onClick={() => setVistaActual('conjuntos')}
            >
              🏘️ Conjuntos
            </button>
            <button 
              className={`boton-nav ${vistaActual === 'areas' ? 'activo' : ''}`}
              onClick={() => setVistaActual('areas')}
            >
              🎯 Áreas
            </button>
          </div>
          <div 
            className="circulo-perfil"
            onClick={() => setMostrarModalPerfil(!mostrarModalPerfil)}
          >
            {usuario?.nombre?.charAt(0).toUpperCase() || '?'}
          </div>
        </div>
      </nav>

      {mostrarModalPerfil && (
        <>
          <div className="overlay-modal" onClick={() => setMostrarModalPerfil(false)}></div>
          <div className="modal-perfil">
            <div className="item-modal">
              <span className="icono-modal">👤</span>
              <span>{usuario?.nombre}</span>
            </div>
            <div className="separador-modal"></div>
            <div className="item-modal" onClick={() => setMostrarModalPerfil(false)}>
              <span className="icono-modal">⚙️</span>
              <span>Ajustes</span>
            </div>
            <div className="item-modal" onClick={handleLogout}>
              <span className="icono-modal">🚪</span>
              <span>Cerrar Sesión</span>
            </div>
          </div>
        </>
      )}

      <div className="contenedor-panel">
        {vistaActual === 'reservas' ? (
          <ReservasTab
            reservas={reservas}
            loading={loading}
            onCancelar={handleCancelar}
            onRefresh={cargarReservas}
            getEstadoClass={getEstadoClass}
          />
        ) : vistaActual === 'usuarios' ? (
          <UsuarioComponent />
        ) : vistaActual === 'conjuntos' ? (
          <ConjuntoComponent />
        ) : (
          <AreaComponent />
        )}
      </div>
    </div>
  );
}

function ReservasTab({ reservas, loading, onCancelar, onRefresh, getEstadoClass }) {
  if (loading) {
    return <div className="cargando">Cargando reservas...</div>;
  }

  if (reservas.length === 0) {
    return (
      <div className="estado-vacio">
        <p>No tienes reservas</p>
        <p className="subtitulo-vacio">Crea tu primera reserva en la pestaña Nueva Reserva</p>
      </div>
    );
  }

  return (
    <div className="cuadricula-reservas">
      {reservas.map((reserva) => (
        <div key={reserva.id} className="tarjeta-reserva">
          <div className="encabezado-reserva">
            <h3>{reserva.servicio}</h3>
            <span className={`insignia ${getEstadoClass(reserva.estado)}`}>
              {reserva.estado}
            </span>
          </div>
          <div className="cuerpo-reserva">
            <p>📅 {reserva.fecha}</p>
            <p>🕐 {reserva.hora}</p>
            <p>⏱️ {reserva.duracion} minutos</p>
            {reserva.precio && <p className="precio">💰 ${reserva.precio}</p>}
            {reserva.notas && (
              <p className="notas">
                <strong>Notas:</strong> {reserva.notas}
              </p>
            )}
          </div>
          {reserva.estado === 'pendiente' && (
            <button
              className="boton-cancelar"
              onClick={() => onCancelar(reserva.id)}
            >
              Cancelar Reserva
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function NuevaReservaTab({ onSuccess }) {
  const [formData, setFormData] = useState({
    servicio: '',
    fecha: '',
    hora: '',
    duracion: '60',
    notas: '',
    precio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const servicios = [
    'Consulta General',
    'Servicio Premium',
    'Mantenimiento',
    'Asesoría',
    'Otro',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.servicio || !formData.fecha || !formData.hora) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await reservaService.crear({
        servicio: formData.servicio,
        fecha: formData.fecha,
        hora: formData.hora,
        duracion: parseInt(formData.duracion) || 60,
        notas: formData.notas || null,
        precio: formData.precio ? parseFloat(formData.precio) : null,
      });

      alert('Reserva creada exitosamente');
      setFormData({
        servicio: '',
        fecha: '',
        hora: '',
        duracion: '60',
        notas: '',
        precio: '',
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-nueva-reserva">
      <h2>Nueva Reserva</h2>
      {error && <div className="mensaje-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grupo-formulario">
          <label>Servicio *</label>
          <div className="cuadricula-servicios">
            {servicios.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip-servicio ${formData.servicio === s ? 'activo' : ''}`}
                onClick={() => setFormData({ ...formData, servicio: s })}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="fila-formulario">
          <div className="grupo-formulario">
            <label htmlFor="fecha">Fecha *</label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grupo-formulario">
            <label htmlFor="hora">Hora *</label>
            <input
              id="hora"
              name="hora"
              type="time"
              value={formData.hora}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="fila-formulario">
          <div className="grupo-formulario">
            <label htmlFor="duracion">Duración (minutos)</label>
            <input
              id="duracion"
              name="duracion"
              type="number"
              value={formData.duracion}
              onChange={handleChange}
              min="15"
              step="15"
            />
          </div>

          <div className="form-group">
            <label htmlFor="precio">Precio (opcional)</label>
            <input
              id="precio"
              name="precio"
              type="number"
              step="0.01"
              placeholder="50.00"
              value={formData.precio}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grupo-formulario">
          <label htmlFor="notas">Notas (opcional)</label>
          <textarea
            id="notas"
            name="notas"
            rows="4"
            placeholder="Información adicional..."
            value={formData.notas}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="boton-primario" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Reserva'}
        </button>
      </form>
    </div>
  );
}

function PerfilTab({ usuario }) {
  return (
    <div className="contenedor-perfil">
      <div className="tarjeta-perfil">
        <div className="avatar-perfil">
          {usuario?.nombre?.charAt(0).toUpperCase() || '?'}
        </div>
        <h2>{usuario?.nombre}</h2>
        <p className="email-perfil">{usuario?.email}</p>
        {usuario?.rol === 'admin' && (
          <span className="insignia insignia-oro">👑 ADMIN</span>
        )}
      </div>

      <div className="tarjeta-info">
        <h3>Información</h3>
        <div className="fila-info">
          <span className="etiqueta-info">Email:</span>
          <span className="valor-info">{usuario?.email}</span>
        </div>
        <div className="fila-info">
          <span className="etiqueta-info">ID:</span>
          <span className="valor-info">{usuario?.id}</span>
        </div>
        <div className="fila-info">
          <span className="etiqueta-info">Rol:</span>
          <span className="valor-info">{usuario?.rol}</span>
        </div>
      </div>

      <div className="tarjeta-info">
        <h3>Acerca de</h3>
        <p>ReservasApp v1.0.0</p>
        <p>Desarrollado con React + Vite</p>
      </div>
    </div>
  );
}
