import { useState, useEffect } from 'react';
import { configuracionService, authService } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUniversity } from '@fortawesome/free-solid-svg-icons';
import '../style/SistemaComponent.css';

export default function SistemaComponent() {
  const [formData, setFormData] = useState({
    banco: '',
    tipo_cuenta: 'Ahorro',
    numero_cuenta: '',
    nombre_titular: '',
    cedula_titular: ''
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const esSuperAdmin = authService.getUsuario()?.tipo_usuario === 'superadmin';

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const data = await configuracionService.obtener();
      if (data) {
        setFormData({
          banco: data.banco || '',
          tipo_cuenta: data.tipo_cuenta || 'Ahorro',
          numero_cuenta: data.numero_cuenta || '',
          nombre_titular: data.nombre_titular || '',
          cedula_titular: data.cedula_titular || '' // Añadido campo cédula
        });
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar los datos del sistema' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!esSuperAdmin) {
      setMensaje({ tipo: 'error', texto: 'No tienes permisos para modificar esta configuración' });
      return;
    }

    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      await configuracionService.actualizar(formData);
      setMensaje({ tipo: 'exito', texto: 'Configuración guardada exitosamente' });
    } catch (error) {
      console.error('Error al guardar:', error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar la configuración' });
    } finally {
      setLoading(false);
    }
  };

  if (!esSuperAdmin) {
    return (
      <div className="sistema-container">
        <div className="mensaje-error">
          No tienes permisos para acceder a esta sección.
        </div>
      </div>
    );
  }

  return (
    <div className="sistema-container">
      <div className="sistema-header">
        <h2><FontAwesomeIcon icon={faUniversity} /> Configuración del Sistema</h2>
        <p>Gestiona los datos bancarios para las transferencias de reservas.</p>
      </div>

      {mensaje.texto && (
        <div className={mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-sistema">
        <div className="form-group-sistema">
          <label>Nombre del Banco</label>
          <input
            type="text"
            name="banco"
            value={formData.banco}
            onChange={handleChange}
            placeholder="Ej: Banco Pichincha"
            required
          />
        </div>

        <div className="form-group-sistema">
          <label>Tipo de Cuenta</label>
          <select
            name="tipo_cuenta"
            value={formData.tipo_cuenta}
            onChange={handleChange}
          >
            <option value="Ahorro">Ahorro</option>
            <option value="Corriente">Corriente</option>
          </select>
        </div>

        <div className="form-group-sistema">
          <label>Número de Cuenta</label>
          <input
            type="text"
            name="numero_cuenta"
            value={formData.numero_cuenta}
            onChange={handleChange}
            placeholder="Ej: 220XXXXXXX"
            required
          />
        </div>

        <div className="form-group-sistema">
          <label>Nombre del Titular</label>
          <input
            type="text"
            name="nombre_titular"
            value={formData.nombre_titular}
            onChange={handleChange}
            placeholder="Nombre completo del dueño de la cuenta"
            required
          />
        </div>

        <div className="form-group-sistema">
            <label>Cédula/RUC del Titular</label>
            <input
                type="text"
                name="cedula_titular"
                value={formData.cedula_titular}
                onChange={handleChange}
                placeholder="Identificación del titular"
            />
        </div>

        <button type="submit" className="btn-guardar-sistema" disabled={loading}>
          <FontAwesomeIcon icon={faSave} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
