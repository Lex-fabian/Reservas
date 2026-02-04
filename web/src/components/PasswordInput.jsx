import { useState } from 'react';

export default function PasswordInput({ value, onChange, disabled, placeholder = "Contraseña" }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="contenedor-password">
      <input
        type={mostrar ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
      />
      <button
        type="button"
        className="boton-ojo"
        onClick={() => setMostrar(!mostrar)}
        disabled={disabled}
        aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {mostrar ? '👁️' : '👁️‍🗨️'}
      </button>
    </div>
  );
}
