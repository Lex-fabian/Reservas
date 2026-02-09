import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import PasswordInput from '../components/PasswordInput';
import ModalCambioPasswordObligatorio from '../components/ModalCambioPasswordObligatorio';
import icono from '../assets/icono.jpeg';
import loginImg from '../assets/login.jpeg';
import areasImg from '../assets/areas.jpeg';
import historialImg from '../assets/historial.jpeg';
import registrarImg from '../assets/registrar.jpeg';
import superadminImg from '../assets/superadmin.jpeg';
import '../style/login.css';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [modalCambioPasswordAbierto, setModalCambioPasswordAbierto] = useState(false);
  const [modalLoginAbierto, setModalLoginAbierto] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const abrirModalLogin = () => {
    setModalLoginAbierto(true);
  };

  const cerrarModalLogin = () => {
    setModalLoginAbierto(false);
  };
  
  const { login, loading, error, handlePasswordChangeSuccess } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await login(usuario, contraseña, () => setModalCambioPasswordAbierto(true));
  };

  const onCambioPasswordExitoso = () => {
    setModalCambioPasswordAbierto(false);
    handlePasswordChangeSuccess();
  };

  return (
    <>
      <nav className="navbar-login">
        <div className="navbar-contenido">
          <div className="navbar-logo">
            <img src={icono} alt="Reservas" className="logo-icono" />
            <span className="logo-texto">Reservas</span>
          </div>
          <ul className="navbar-menu">
            <li>
              <button onClick={() => scrollToSection('inicio')} className="navbar-link">
                Inicio
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('descarga')} className="navbar-link">
                Descargar
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('sobre-nosotros')} className="navbar-link">
                Sobre Nosotros
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('contacto')} className="navbar-link">
                Contáctanos
              </button>
            </li>
            <li>
              <button onClick={abrirModalLogin} className="navbar-boton-login">
                Iniciar Sesión
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="contenedor-auth" id="inicio">
        <div className="seccion-promocional">
          <h2 className="titulo-promocional">Reserva áreas de manera rápida y fácil</h2>
          <p className="texto-promocional">
            Gestiona todas tus reservas en un solo lugar. Simple, rápido y eficiente.
          </p>
        </div>

        <div className="tarjeta-auth-inicio">
          <h1 className="titulo-auth">Bienvenido a ReservasApp</h1>
          <p className="subtitulo-auth-inicio">
            Sistema de gestión de reservas para urbanizaciones
          </p>
          <div className="caracteristicas-inicio">
            <div className="caracteristica-item">
              <i className="fas fa-calendar-check"></i>
              <p>Reserva áreas comunes fácilmente</p>
            </div>
            <div className="caracteristica-item">
              <i className="fas fa-clock"></i>
              <p>Disponibilidad en tiempo real</p>
            </div>
            <div className="caracteristica-item">
              <i className="fas fa-users"></i>
              <p>Gestión para toda tu comunidad</p>
            </div>
          </div>
        </div>
      </div>

      {modalLoginAbierto && (
        <div className="modal-login-overlay" onClick={cerrarModalLogin}>
          <div className="modal-login-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="modal-login-cerrar" onClick={cerrarModalLogin}>
              <i className="fas fa-times"></i>
            </button>
            <h1 className="titulo-auth">Iniciar Sesión</h1>
            {error && <div className="mensaje-error">{error}</div>}
            <form onSubmit={handleSubmit} className="formulario-auth">
              <input
                type="text"
                placeholder="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                disabled={loading}
                required
              />
              <PasswordInput
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="boton-primario" disabled={loading}>
                {loading ? 'Ingresando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ModalCambioPasswordObligatorio
        isOpen={modalCambioPasswordAbierto}
        onClose={() => {}}
        onCambioExitoso={onCambioPasswordExitoso}
      />


      <div className="seccion-descarga-movil" id="descarga">
        <div className="contenido-descarga-amplio">
          <div className="icono-movil"><i className="fas fa-mobile-alt"></i></div>
          <h3 className="titulo-descarga">Descarga la Versión Móvil</h3>
          <p className="descripcion-descarga">
            Gestiona tus reservas desde cualquier lugar con nuestra app móvil. 
            Disponible para Android con todas las funcionalidades que necesitas.
          </p>
          
          <div className="galeria-app">
            <div className="imagen-app-container">
              <img src={loginImg} alt="Login de la app" className="imagen-app" />
              <div className="imagen-app-overlay">
                <p className="imagen-app-titulo">Inicio de Sesión</p>
                <p className="imagen-app-descripcion">Acceso rápido y seguro</p>
              </div>
            </div>
            <div className="imagen-app-container">
              <img src={areasImg} alt="Áreas disponibles" className="imagen-app" />
              <div className="imagen-app-overlay">
                <p className="imagen-app-titulo">Explora Áreas</p>
                <p className="imagen-app-descripcion">Descubre espacios disponibles</p>
              </div>
            </div>
            <div className="imagen-app-container">
              <img src={historialImg} alt="Historial de reservas" className="imagen-app" />
              <div className="imagen-app-overlay">
                <p className="imagen-app-titulo">Historial</p>
                <p className="imagen-app-descripcion">Revisa tus reservas</p>
              </div>
            </div>
            <div className="imagen-app-container">
              <img src={registrarImg} alt="Registrar reserva" className="imagen-app" />
              <div className="imagen-app-overlay">
                <p className="imagen-app-titulo">Crear Reserva</p>
                <p className="imagen-app-descripcion">Reserva en segundos</p>
              </div>
            </div>
            <div className="imagen-app-container">
              <img src={superadminImg} alt="Panel de administrador" className="imagen-app" />
              <div className="imagen-app-overlay">
                <p className="imagen-app-titulo">Panel Admin</p>
                <p className="imagen-app-descripcion">Gestión completa</p>
              </div>
            </div>
          </div>
          
          <a 
            href="/apk/ReservasApp.apk" 
            download="ReservasApp.apk"
            className="boton-descarga"
          >
            <i className="fas fa-download"></i> 
            <span>Descargar APK para Android</span>
            <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>

      <div className="seccion-sobre-nosotros" id="sobre-nosotros">
        <div className="contenido-sobre-nosotros">
          <h2 className="titulo-seccion"><i className="fas fa-landmark"></i> Sobre Nosotros</h2>
          <div className="grid-info">
            <div className="card-info">
              <div className="icono-card"><i className="fas fa-bullseye"></i></div>
              <h3>Nuestra Misión</h3>
              <p>
                Agilizar los procesos de gestión de áreas comunes en urbanizaciones y conjuntos residenciales,
                ofreciendo una plataforma eficiente que optimiza la administración de espacios compartidos
                sin complicaciones.
              </p>
            </div>
            <div className="card-info">
              <div className="icono-card"><i className="fas fa-shield-alt"></i></div>
              <h3>Privacidad y Seguridad</h3>
              <p>
                Nuestro sistema está diseñado para uso exclusivo de cada urbanización. 
                NO registramos información privada para uso público. Tus datos permanecen seguros
                y privados dentro de tu comunidad.
              </p>
            </div>
            <div className="card-info">
              <div className="icono-card"><i className="fas fa-star"></i></div>
              <h3>Nuestro Enfoque</h3>
              <p>
                Nos especializamos en urbanizaciones, brindando herramientas que simplifican
                la coordinación de espacios comunes, reducen conflictos y mejoran la experiencia
                de todos los residentes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="seccion-contacto" id="contacto">
        <div className="contenido-contacto">
          <h2 className="titulo-seccion">Contáctanos</h2>
          <p className="subtitulo-contacto">
            ¿Tienes alguna pregunta? Escríbenos por WhatsApp
          </p>
          <a 
            href="https://wa.me/5930969528311" 
            target="_blank"
            rel="noopener noreferrer"
            className="boton-whatsapp"
          >
            <i className="fab fa-whatsapp"></i>
            WhatsApp
          </a>
        </div>
      </div>

      <footer className="footer">
      <div className="footer-contenido">
        <div className="footer-seccion">
          <img src={icono} alt="Reservas" className="footer-logo" />
          <h4>ReservasApp</h4>
          <p>Gestión inteligente de espacios comunes</p>
        </div>
        <div className="footer-seccion">
          <h4>Enlaces rápidos</h4>
          <button onClick={() => scrollToSection('inicio')} className="footer-link">Inicio</button>
          <button onClick={() => scrollToSection('descarga')} className="footer-link">Descargar</button>
          <button onClick={() => scrollToSection('sobre-nosotros')} className="footer-link">Sobre Nosotros</button>
          <button onClick={() => scrollToSection('contacto')} className="footer-link">Contacto</button>
        </div>
        <div className="footer-seccion">
          <h4>Contacto</h4>
          <p><i className="fas fa-phone"></i> +593 096 952 8311</p>
          <p><i className="fas fa-map-marker-alt"></i> Ecuador</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 ReservasApp. Todos los derechos reservados.</p>
      </div>
    </footer>
    </>
  );
}