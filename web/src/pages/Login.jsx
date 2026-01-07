import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import '../style/login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('lex');
  const [password, setPassword] = useState('lex');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('usuario', JSON.stringify({ nombre: email, email: email }));
      navigate('/inicio');
      setLoading(false);
    }, 500);
  };

  return (
    <div className="contenedor-auth">
      <div className="seccion-promocional">
        <h2 className="titulo-promocional">Reserva áreas de manera rápida y fácil</h2>
        <p className="texto-promocional">
          Gestiona todas tus reservas en un solo lugar. Simple, rápido y eficiente.
        </p>
      </div>

      <div className="tarjeta-auth">
        <h1 className="titulo-auth">Reservas</h1>

        {error && <div className="mensaje-error">{error}</div>}

        <form onSubmit={handleSubmit} className="formulario-auth">
          <input
            type="text"
            placeholder="Usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <div className="contenedor-password">
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="boton-ojo"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              disabled={loading}
            >
              {mostrarPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button type="submit" className="boton-primario" disabled={loading}>
            {loading ? '...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
