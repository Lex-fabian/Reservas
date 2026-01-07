import { useState, useEffect } from 'react';
import { reservaService } from '../services/api';
import './CalendarioReservas.css';

export default function CalendarioReservas({ 
  areaId, 
  areaSeleccionada, 
  onSeleccionFecha, 
  fechaSeleccionada,
  horaInicioSeleccionada 
}) {
  const [semanaActual, setSemanaActual] = useState(obtenerSemanaActual());
  const [reservasExistentes, setReservasExistentes] = useState([]);
  const [loading, setLoading] = useState(false);

  const horasDelDia = generarHorasDelDia(); // 6:00 AM a 11:00 PM

  useEffect(() => {
    if (areaId) {
      cargarReservasDelArea();
    }
  }, [areaId, semanaActual]);

  function obtenerSemanaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const primerDia = new Date(hoy);
    primerDia.setDate(hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1));
    
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(primerDia);
      dia.setDate(primerDia.getDate() + i);
      dias.push(dia);
    }
    return dias;
  }

  function generarHorasDelDia() {
    const horas = [];
    for (let h = 6; h <= 23; h++) {
      horas.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return horas;
  }

  async function cargarReservasDelArea() {
    if (!areaId) return;
    
    setLoading(true);
    try {
      const fechaInicio = formatearFecha(semanaActual[0]);
      const fechaFin = formatearFecha(semanaActual[6]);
      
      const response = await reservaService.obtenerTodas({
        areaId,
        fecha_desde: fechaInicio,
        fecha_hasta: fechaFin
      });
      
      setReservasExistentes(response.reservas || []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatearFecha(fecha) {
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  function formatearFechaCorta(fecha) {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return {
      diaSemana: dias[fecha.getDay()],
      diaNumero: fecha.getDate(),
      mes: meses[fecha.getMonth()]
    };
  }

  function cambiarSemana(direccion) {
    const nuevaSemana = semanaActual.map(dia => {
      const nuevoDia = new Date(dia);
      nuevoDia.setDate(dia.getDate() + (direccion * 7));
      return nuevoDia;
    });
    setSemanaActual(nuevaSemana);
  }

  function esHoy(fecha) {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  function verificarDisponibilidad(fecha, hora) {
    if (!areaSeleccionada) return { disponible: true, reserva: null };
    
    const fechaStr = formatearFecha(fecha);
    const tiempoMinimo = areaSeleccionada.tiempo_minimo || 60;
    const horaFinCalculada = calcularHoraFin(hora, tiempoMinimo);
    
    // Verificar si hay conflicto con reservas existentes
    const conflicto = reservasExistentes.find(reserva => {
      if (reserva.fecha_reserva !== fechaStr) return false;
      if (reserva.estado === 'cancelada') return false;
      
      const inicioReserva = reserva.hora_inicio;
      const finReserva = reserva.hora_fin;
      
      // Verificar solapamiento
      return (hora >= inicioReserva && hora < finReserva) ||
             (horaFinCalculada > inicioReserva && horaFinCalculada <= finReserva) ||
             (hora <= inicioReserva && horaFinCalculada >= finReserva);
    });
    
    return {
      disponible: !conflicto,
      reserva: conflicto || null
    };
  }

  function calcularHoraFin(horaInicio, minutosAdicionales) {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + minutosAdicionales;
    const nuevasHoras = Math.floor(totalMinutos / 60);
    const nuevosMinutos = totalMinutos % 60;
    return `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
  }

  function handleSeleccionHora(fecha, hora) {
    if (!areaSeleccionada) return;
    
    const { disponible } = verificarDisponibilidad(fecha, hora);
    if (!disponible) return;
    
    const fechaStr = formatearFecha(fecha);
    const tiempoMinimo = areaSeleccionada.tiempo_minimo || 60;
    const horaFin = calcularHoraFin(hora, tiempoMinimo);
    
    onSeleccionFecha({
      fecha: fechaStr,
      horaInicio: hora,
      horaFin: horaFin
    });
  }

  function esCeldaSeleccionada(fecha, hora) {
    if (!fechaSeleccionada || !horaInicioSeleccionada) return false;
    const fechaStr = formatearFecha(fecha);
    return fechaStr === fechaSeleccionada && hora === horaInicioSeleccionada;
  }

  function obtenerReservaEnCelda(fecha, hora) {
    const fechaStr = formatearFecha(fecha);
    return reservasExistentes.find(reserva => {
      if (reserva.fecha_reserva !== fechaStr) return false;
      if (reserva.estado === 'cancelada') return false;
      
      const horaConSegundos = hora + ':00';
      return horaConSegundos >= reserva.hora_inicio && horaConSegundos < reserva.hora_fin;
    });
  }

  if (!areaId) {
    return (
      <div className="calendario-placeholder">
        <p>Selecciona un área para ver disponibilidad</p>
      </div>
    );
  }

  return (
    <div className="calendario-reservas">
      <div className="calendario-header">
        <button 
          className="btn-semana" 
          onClick={() => cambiarSemana(-1)}
          type="button"
        >
          ← Semana anterior
        </button>
        <h3>
          {formatearFechaCorta(semanaActual[0]).mes} {semanaActual[0].getDate()} - 
          {' '}{formatearFechaCorta(semanaActual[6]).mes} {semanaActual[6].getDate()}, {semanaActual[0].getFullYear()}
        </h3>
        <button 
          className="btn-semana" 
          onClick={() => cambiarSemana(1)}
          type="button"
        >
          Semana siguiente →
        </button>
      </div>

      {areaSeleccionada && (
        <div className="info-duracion">
          <span>⏱️ Duración de reserva: {areaSeleccionada.tiempo_minimo || 60} minutos</span>
        </div>
      )}

      <div className="calendario-grid-wrapper">
        <div className="calendario-grid">
          {/* Columna de horas */}
          <div className="columna-horas">
            <div className="celda-header"></div>
            {horasDelDia.map(hora => (
              <div key={hora} className="celda-hora">
                {hora}
              </div>
            ))}
          </div>

          {/* Columnas de días */}
          {semanaActual.map((fecha, index) => {
            const { diaSemana, diaNumero, mes } = formatearFechaCorta(fecha);
            const esHoyDia = esHoy(fecha);
            
            return (
              <div key={index} className="columna-dia">
                <div className={`celda-header ${esHoyDia ? 'hoy' : ''}`}>
                  <div className="dia-nombre">{diaSemana}</div>
                  <div className="dia-numero">{diaNumero}</div>
                  <div className="dia-mes">{mes}</div>
                </div>
                
                {horasDelDia.map(hora => {
                  const { disponible } = verificarDisponibilidad(fecha, hora);
                  const reserva = obtenerReservaEnCelda(fecha, hora);
                  const seleccionada = esCeldaSeleccionada(fecha, hora);
                  
                  return (
                    <div
                      key={hora}
                      className={`celda-tiempo ${
                        seleccionada ? 'seleccionada' : 
                        reserva ? 'ocupada' : 
                        disponible ? 'disponible' : ''
                      }`}
                      onClick={() => handleSeleccionHora(fecha, hora)}
                      title={
                        reserva 
                          ? `Ocupado: ${reserva.Usuario?.nombre || 'Usuario'} ${reserva.hora_inicio}-${reserva.hora_fin}` 
                          : disponible 
                          ? 'Disponible - Click para reservar' 
                          : ''
                      }
                    >
                      {reserva && (
                        <div className="reserva-info">
                          <small>{reserva.Usuario?.nombre || 'Reservado'}</small>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendario-leyenda">
        <div className="leyenda-item">
          <div className="cuadro disponible"></div>
          <span>Disponible</span>
        </div>
        <div className="leyenda-item">
          <div className="cuadro ocupada"></div>
          <span>Ocupado</span>
        </div>
        <div className="leyenda-item">
          <div className="cuadro seleccionada"></div>
          <span>Tu selección</span>
        </div>
      </div>
    </div>
  );
}
