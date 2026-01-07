import { useState, useEffect } from 'react';
import { areaService, conjuntoService } from '../services/api';
import './ConjuntoComponent.css';

export default function AreaComponent() {
  const [areas, setAreas] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroConjunto, setFiltroConjunto] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [areasData, conjuntosData] = await Promise.all([
        areaService.obtenerTodas(),
        conjuntoService.obtenerTodos()
      ]);
      setAreas(areasData.areas || []);
      setConjuntos(conjuntosData.conjuntos || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const areasFiltradas = filtroConjunto
    ? areas.filter(a => a.conjuntoId === parseInt(filtroConjunto))
    : areas;

  const obtenerNombreConjunto = (conjuntoId) => {
    const conjunto = conjuntos.find(c => c.id === conjuntoId);
    return conjunto?.nombre_conjunto || 'N/A';
  };

  if (loading) {
    return <div className="cargando">Cargando áreas...</div>;
  }

  return (
    <div className="contenedor-tabla">
      <div className="encabezado-seccion">
        <h2>🎯 Áreas Comunes</h2>
        <div className="acciones-encabezado">
          <select
            value={filtroConjunto}
            onChange={(e) => setFiltroConjunto(e.target.value)}
            className="filtro-select"
          >
            <option value="">Todos los conjuntos</option>
            {conjuntos.map(conjunto => (
              <option key={conjunto.id} value={conjunto.id}>
                {conjunto.nombre_conjunto}
              </option>
            ))}
          </select>
          <button className="boton-accion-primario">
            ➕ Nueva Área
          </button>
        </div>
      </div>

      {areasFiltradas.length === 0 ? (
        <div className="estado-vacio">
          <p>No hay áreas registradas</p>
        </div>
      ) : (
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Área</th>
              <th>Conjunto</th>
              <th>Capacidad</th>
              <th>Costo</th>
              <th>Tiempo Mín.</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {areasFiltradas.map((area) => (
              <tr key={area.id}>
                <td>
                  <div className="celda-usuario">
                    <div className="avatar-tabla">🎯</div>
                    <div>
                      <div className="nombre-usuario">{area.nombre_area}</div>
                      {area.observaciones && (
                        <div className="email-usuario">{area.observaciones.substring(0, 50)}...</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{obtenerNombreConjunto(area.conjuntoId)}</td>
                <td>{area.maximo_personas} personas</td>
                <td>${area.costo}</td>
                <td>{area.tiempo_minimo} min</td>
                <td>
                  <span className={`insignia-${area.estado}`}>
                    {area.estado}
                  </span>
                </td>
                <td>
                  <div className="acciones-tabla">
                    <button className="boton-accion-secundario">Ver</button>
                    <button className="boton-accion-secundario">Editar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
