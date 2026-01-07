import { useState, useEffect } from 'react';
import './ConjuntoComponent.css';

export default function ConjuntoComponent() {
  const [conjuntos, setConjuntos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarConjuntos();
  }, []);

  const cargarConjuntos = async () => {
    setLoading(true);
    try {
      // Mock de conjuntos - reemplazar con API real cuando esté disponible
      setTimeout(() => {
        const conjuntosMock = [
          {
            id: 1,
            nombre: 'Conjunto Residencial Los Arrayanes',
            direccion: 'Av. 6 de Diciembre N34-150 y Portugal',
            estado: 'activo',
            casas: 45,
            fechaCreacion: '2023-05-15'
          },
          {
            id: 2,
            nombre: 'Portal del Bosque',
            direccion: 'Calle García Moreno 234 y Bolívar',
            estado: 'activo',
            casas: 32,
            fechaCreacion: '2023-08-20'
          },
          {
            id: 3,
            nombre: 'Villa Carolina',
            direccion: 'Av. República del Salvador N36-84',
            estado: 'inactivo',
            casas: 18,
            fechaCreacion: '2022-11-10'
          },
          {
            id: 4,
            nombre: 'Ciudadela San Rafael',
            direccion: 'Calle Antonio Elizalde y Av. De los Shyris',
            estado: 'activo',
            casas: 67,
            fechaCreacion: '2023-01-25'
          }
        ];
        setConjuntos(conjuntosMock);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error al cargar conjuntos:', error);
      setLoading(false);
    }
  };

  const getEstadoClass = (estado) => {
    return estado === 'activo' ? 'insignia-activo' : 'insignia-inactivo';
  };

  if (loading) {
    return (
      <div className="contenedor-conjuntos">
        <div className="cargando">Cargando conjuntos...</div>
      </div>
    );
  }

  return (
    <div className="contenedor-conjuntos">
      <div className="encabezado-seccion">
        <h2>Conjuntos Residenciales</h2>
        <p className="subtitulo-seccion">Total: {conjuntos.length} conjuntos</p>
      </div>

      <div className="tabla-wrapper">
        <table className="tabla-conjuntos">
          <thead>
            <tr>
              <th>Nombre del Conjunto</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Casas</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conjuntos.map((conjunto) => (
              <tr key={conjunto.id}>
                <td>
                  <div className="conjunto-info">
                    <div className="icono-conjunto">🏘️</div>
                    <span className="nombre-conjunto">{conjunto.nombre}</span>
                  </div>
                </td>
                <td className="direccion-texto">{conjunto.direccion}</td>
                <td>
                  <span className={`insignia ${getEstadoClass(conjunto.estado)}`}>
                    {conjunto.estado}
                  </span>
                </td>
                <td className="centrado">{conjunto.casas}</td>
                <td>{new Date(conjunto.fechaCreacion).toLocaleDateString('es-ES')}</td>
                <td>
                  <div className="acciones-tabla">
                    <button 
                      className="boton-tabla boton-ver" 
                      onClick={() => alert(`Ver detalles de ${conjunto.nombre}`)}
                      title="Ver detalles"
                    >
                      Ver
                    </button>
                    <button 
                      className="boton-tabla boton-editar" 
                      onClick={() => alert(`Editar ${conjunto.nombre}`)}
                      title="Editar conjunto"
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
