import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faUsers, faBuilding, faBullseye, faUser, faCog, faRightFromBracket, faChartLine } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/icono.jpeg';
import ReservaComponent from '../components/ReservaComponent';
import UsuarioComponent from '../components/UsuarioComponent';
import ConjuntoComponent from '../components/ConjuntoComponent';
import AreaComponent from '../components/AreaComponent';
import SistemaComponent from '../components/SistemaComponent';
import PerfilComponent from '../components/PerfilComponent';
import AuditoriaComponent from '../components/AuditoriaComponent';
import ModalConfirmacion from '../components/ModalConfirmacion';
import '../style/Inicio.css';

export default function Inicio() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [vistaActual, setVistaActual] = useState('reservas'); 
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    const user = authService.getUsuario();
    setUsuario(user);
  }, []);

  const handleLogout = () => {
    setMostrarModalPerfil(false);
    setLogoutModalOpen(true);
  };

  const confirmarLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="panel-principal">
      <nav className="barra-navegacion">
        <div className="marca-navegacion">
          <img src={logo} alt="Logo" className="logo-nav" />
          <h2>ReservasWeb</h2>
        </div>
        <div className="menu-navegacion">
          <div className="botones-navegacion">
            <button 
              className={`boton-nav ${vistaActual === 'reservas' ? 'activo' : ''}`}
              onClick={() => setVistaActual('reservas')}
            >
              <FontAwesomeIcon icon={faClipboardList} /> Reservas
            </button>
            <button 
              className={`boton-nav ${vistaActual === 'usuarios' ? 'activo' : ''}`}
              onClick={() => setVistaActual('usuarios')}
            >
              <FontAwesomeIcon icon={faUsers} /> Usuarios
            </button>
            <button 
              className={`boton-nav ${vistaActual === 'conjuntos' ? 'activo' : ''}`}
              onClick={() => setVistaActual('conjuntos')}
            >
              <FontAwesomeIcon icon={faBuilding} /> Conjuntos
            </button>
            <button 
              className={`boton-nav ${vistaActual === 'areas' ? 'activo' : ''}`}
              onClick={() => setVistaActual('areas')}
            >
              <FontAwesomeIcon icon={faBullseye} /> Áreas
            </button>
            
            {/* Botón Sistema solo para SuperAdmin */}
            {authService.isAdminOrSuper() && (
              <button 
                className={`boton-nav ${vistaActual === 'sistema' ? 'activo' : ''}`}
                onClick={() => setVistaActual('sistema')}
              >
                <FontAwesomeIcon icon={faCog} /> Sistema
              </button>
            )}
            
            {/* Botón Auditoría solo para SuperAdmin */}
            {usuario?.tipo_usuario === 'superadmin' && (
              <button 
                className={`boton-nav ${vistaActual === 'auditoria' ? 'activo' : ''}`}
                onClick={() => setVistaActual('auditoria')}
              >
                <FontAwesomeIcon icon={faChartLine} /> Auditoría
              </button>
            )}
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
              <span className="icono-modal"><FontAwesomeIcon icon={faUser} /></span>
              <span>{usuario?.nombre}</span>
            </div>
            <div className="separador-modal"></div>
            <div className="item-modal" onClick={() => {
              setMostrarModalPerfil(false);
              setVistaActual('perfil');
            }}>
              <span className="icono-modal"><FontAwesomeIcon icon={faCog} /></span>
              <span>Mi Perfil</span>
            </div>
            <div className="item-modal item-logout" onClick={handleLogout}>
              <span className="icono-modal"><FontAwesomeIcon icon={faRightFromBracket} /></span>
              <span>Cerrar Sesión</span>
            </div>
          </div>
        </>
      )}

      <div className="contenedor-panel">
        {vistaActual === 'reservas' ? (
          <ReservaComponent />
        ) : vistaActual === 'usuarios' ? (
          <UsuarioComponent />
        ) : vistaActual === 'conjuntos' ? (
          <ConjuntoComponent />
        ) : vistaActual === 'areas' ? (
          <AreaComponent />
        ) : vistaActual === 'perfil' ? (
          <PerfilComponent />
        ) : vistaActual === 'auditoria' ? (
          <AuditoriaComponent />
        ) : (
          <SistemaComponent />
        )}
      </div>

      <ModalConfirmacion
        isOpen={logoutModalOpen}
        titulo="Cerrar Sesión"
        mensaje="¿Estás seguro que deseas salir de la aplicación?"
        onConfirmar={confirmarLogout}
        onCancelar={() => setLogoutModalOpen(false)}
        textoConfirmar="Cerrar Sesión"
        tipo="peligro"
      />
    </div>
  );
}
