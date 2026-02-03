import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuditoriaComponent.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.108:10000/api';

const AuditoriaComponent = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    usuarioId: '',
    accion: '',
    entidad: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [estadisticas, setEstadisticas] = useState(null);
  const [vistaActual, setVistaActual] = useState('logs'); // 'logs' o 'estadisticas'

  useEffect(() => {
    cargarLogs();
  }, [pagination.page, filtros]);

  useEffect(() => {
    if (vistaActual === 'estadisticas') {
      cargarEstadisticas();
    }
  }, [vistaActual, filtros.fechaDesde, filtros.fechaHasta]);

  const cargarLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filtros).filter(([_, v]) => v !== '')
        )
      });

      const response = await axios.get(`${API_URL}/auditoria?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLogs(response.data.logs);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error cargando logs:', error);
      alert('Error al cargar los logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            fechaDesde: filtros.fechaDesde,
            fechaHasta: filtros.fechaHasta
          }).filter(([_, v]) => v !== '')
        )
      );

      const response = await axios.get(`${API_URL}/auditoria/estadisticas?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      usuarioId: '',
      accion: '',
      entidad: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getAccionBadge = (accion) => {
    const badges = {
      crear: 'badge-success',
      actualizar: 'badge-warning',
      eliminar: 'badge-danger',
      login: 'badge-info',
      logout: 'badge-secondary',
      confirmar_reserva: 'badge-primary',
      cancelar_reserva: 'badge-danger'
    };
    return badges[accion] || 'badge-default';
  };

  const renderLogs = () => (
    <div className="logs-container">
      <div className="filtros-container">
        <div className="filtro-grupo">
          <label>Acción:</label>
          <select name="accion" value={filtros.accion} onChange={handleFiltroChange}>
            <option value="">Todas</option>
            <option value="crear">Crear</option>
            <option value="actualizar">Actualizar</option>
            <option value="eliminar">Eliminar</option>
            <option value="login">Login</option>
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Entidad:</label>
          <select name="entidad" value={filtros.entidad} onChange={handleFiltroChange}>
            <option value="">Todas</option>
            <option value="usuario">Usuario</option>
            <option value="reserva">Reserva</option>
            <option value="area">Área</option>
            <option value="conjunto">Conjunto</option>
          </select>
        </div>

        <button onClick={limpiarFiltros} className="btn-limpiar">
          Limpiar
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <div className="tabla-container">
            <table className="tabla-auditoria">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="fecha-col">{formatearFecha(log.createdAt)}</td>
                    <td className="usuario-col">{log.Usuario?.nombre || log.Usuario?.usuario}</td>
                    <td>
                      <span className={`badge ${getAccionBadge(log.accion)}`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="descripcion-col">{log.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="paginacion">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Anterior
            </button>
            <span>
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderEstadisticas = () => (
    <div className="estadisticas-container">
      {estadisticas && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total de Registros</h3>
              <div className="stat-value">{estadisticas.totalLogs}</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Acciones Más Comunes</h3>
              <div className="chart-list">
                {estadisticas.logsPorAccion.map((item, index) => (
                  <div key={index} className="chart-item">
                    <span className={`badge ${getAccionBadge(item.accion)}`}>
                      {item.accion}
                    </span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(item.total / estadisticas.totalLogs) * 100}%`
                        }}
                      />
                    </div>
                    <span className="count">{item.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3>Entidades Más Modificadas</h3>
              <div className="chart-list">
                {estadisticas.logsPorEntidad.map((item, index) => (
                  <div key={index} className="chart-item">
                    <span className="entidad-name">{item.entidad}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(item.total / estadisticas.totalLogs) * 100}%`
                        }}
                      />
                    </div>
                    <span className="count">{item.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card full-width">
              <h3>Usuarios Más Activos</h3>
              <div className="usuarios-activos">
                {estadisticas.usuariosMasActivos.map((item, index) => (
                  <div key={index} className="usuario-activo-item">
                    <div className="ranking">{index + 1}</div>
                    <div className="usuario-info">
                      <strong>{item.Usuario?.nombre || item.Usuario?.usuario}</strong>
                      <span className="tipo-usuario">{item.Usuario?.tipo_usuario}</span>
                    </div>
                    <div className="actividad-count">
                      <span className="count">{item.total}</span>
                      <span className="label">acciones</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="auditoria-component">
      <div className="auditoria-header">
        <h2>Auditoría del Sistema</h2>
        <div className="vista-toggles">
          <button
            className={vistaActual === 'logs' ? 'active' : ''}
            onClick={() => setVistaActual('logs')}
          >
            Registros
          </button>
          <button
            className={vistaActual === 'estadisticas' ? 'active' : ''}
            onClick={() => setVistaActual('estadisticas')}
          >
            Estadísticas
          </button>
        </div>
      </div>

      {vistaActual === 'logs' ? renderLogs() : renderEstadisticas()}
    </div>
  );
};

export default AuditoriaComponent;
