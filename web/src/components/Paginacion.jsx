export default function Paginacion({ paginaActual, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="paginacion">
      {Array.from({ length: totalPaginas }).map((_, index) => {
        const numeroPagina = index + 1;
        const mostrarPagina = 
          numeroPagina === 1 ||
          numeroPagina === totalPaginas ||
          (numeroPagina >= paginaActual - 2 && numeroPagina <= paginaActual + 2);
        
        if (!mostrarPagina && numeroPagina === paginaActual - 3) {
          return <span key={numeroPagina} className="puntos-suspensivos">...</span>;
        }
        if (!mostrarPagina && numeroPagina === paginaActual + 3) {
          return <span key={numeroPagina} className="puntos-suspensivos">...</span>;
        }
        if (!mostrarPagina) {
          return null;
        }
        
        return (
          <button
            key={numeroPagina}
            className={`boton-paginacion ${paginaActual === numeroPagina ? 'activo' : ''}`}
            onClick={() => onChange(numeroPagina)}
          >
            {numeroPagina}
          </button>
        );
      })}
    </div>
  );
}
