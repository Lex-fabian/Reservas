import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reservaService } from '../services/api';

export default function NuevaReservaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [numPersonas, setNumPersonas] = useState(1);
  const [mesActual, setMesActual] = useState(new Date());
  const [diasMes, setDiasMes] = useState([]);
  const [reservasDelMes, setReservasDelMes] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    cargarUsuarioId();
  }, []);

  useEffect(() => {
    if (usuarioId) {
      generarCalendarioMes();
      cargarReservasDelMes();
    }
  }, [mesActual, usuarioId]);

  const cargarUsuarioId = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      const usuario = JSON.parse(usuarioStr);
      setUsuarioId(usuario.id);
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  const cargarReservasDelMes = async () => {
    try {
      const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
      const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
      
      const fechaDesde = primerDia.toISOString().split('T')[0];
      const fechaHasta = ultimoDia.toISOString().split('T')[0];
      
      const response = await reservaService.obtenerTodas({
        areaId: params.areaId,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
      });
      
      setReservasDelMes(response.reservas || []);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setReservasDelMes([]);
    }
  };

  const generarCalendarioMes = () => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    
    const diasArray = [];
    const diaSemanaInicio = primerDia.getDay();
    
    // Días vacíos antes del primer día del mes
    for (let i = 0; i < diaSemanaInicio; i++) {
      diasArray.push(null);
    }
    
    // Días del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(año, mes, dia);
      diasArray.push({
        dia: dia,
        fecha: fecha,
        completa: fecha.toISOString().split('T')[0],
      });
    }
    
    setDiasMes(diasArray);
    
    // Seleccionar hoy si es el mes actual
    const hoy = new Date();
    if (año === hoy.getFullYear() && mes === hoy.getMonth()) {
      setFechaSeleccionada(hoy.toISOString().split('T')[0]);
    }
  };

  const obtenerEstadoDia = (fechaCompleta) => {
    if (!fechaCompleta) return null;
    
    const reservasDelDia = reservasDelMes.filter(
      r => r.fecha_reserva === fechaCompleta
    );
    
    if (reservasDelDia.length === 0) return 'disponible'; // Azul
    
    const tieneReservaPropia = reservasDelDia.some(r => r.usuarioId === usuarioId);
    if (tieneReservaPropia) return 'reservado-propio'; // Verde
    
    return 'reservado-otro'; // Rojo
  };

  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(mesActual);
    nuevoMes.setMonth(mesActual.getMonth() + direccion);
    setMesActual(nuevoMes);
  };

  const horarios = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', 
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const handleReservar = async () => {
    if (!fechaSeleccionada || !horaSeleccionada) {
      Alert.alert('Error', 'Por favor selecciona fecha y hora');
      return;
    }

    if (numPersonas > parseInt(params.areaMaxPersonas)) {
      Alert.alert('Error', `El máximo de personas es ${params.areaMaxPersonas}`);
      return;
    }

    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      const usuario = JSON.parse(usuarioStr);

      // Calcular hora fin basándose en tiempo_minimo
      const [horas, minutos] = horaSeleccionada.split(':');
      const horaInicio = new Date();
      horaInicio.setHours(parseInt(horas), parseInt(minutos), 0);
      
      const horaFin = new Date(horaInicio.getTime() + parseInt(params.areaTiempoMinimo) * 60000);
      const horaFinStr = `${horaFin.getHours().toString().padStart(2, '0')}:${horaFin.getMinutes().toString().padStart(2, '0')}`;

      const reservaData = {
        usuarioId: usuario.id,
        conjuntoId: usuario.conjuntoId || 1, // TODO: Obtener del usuario
        areaId: parseInt(params.areaId),
        fecha_reserva: fechaSeleccionada,
        hora_inicio: horaSeleccionada + ':00',
        hora_fin: horaFinStr + ':00',
        personas: numPersonas,
        estado: 'pendiente',
      };

      await reservaService.crear(reservaData);
      Alert.alert('Éxito', 'Reserva creada correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error al crear reserva:', error);
      Alert.alert('Error', 'No se pudo crear la reserva');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen del área con botón flotante */}
        <View style={styles.imageContainer}>
          {params.areaFoto ? (
            <Image
              source={{
                uri: params.areaFoto.includes('data:')
                  ? params.areaFoto
                  : `data:image/jpeg;base64,${params.areaFoto}`,
              }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={80} color="#ddd" />
            </View>
          )}
          
          {/* Botón de retroceso flotante */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Información del área */}
        <View style={styles.infoContainer}>
          <View style={styles.ubicacionRow}>
            <Ionicons name="location" size={16} color="#999" />
            <Text style={styles.ubicacionText}>{params.conjuntoNombre}</Text>
          </View>
          
          <Text style={styles.titulo}>{params.areaNombre}</Text>

          <View style={styles.detallesRow}>
            <View style={styles.detalleItem}>
              <Ionicons name="people" size={20} color="#4a90e2" />
              <Text style={styles.detalleText}>Hasta {params.areaMaxPersonas} personas</Text>
            </View>
            <View style={styles.detalleItem}>
              <Ionicons name="time" size={20} color="#4a90e2" />
              <Text style={styles.detalleText}>{params.areaTiempoMinimo} minutos</Text>
            </View>
          </View>

          <View style={styles.costoContainer}>
            <Text style={styles.costoLabel}>Costo</Text>
            <Text style={styles.costoValor}>${params.areaCosto}/h</Text>
          </View>

          {params.areaObservaciones && (
            <View style={styles.observacionesContainer}>
              <Text style={styles.observacionesLabel}>Observaciones</Text>
              <Text style={styles.observacionesText}>{params.areaObservaciones}</Text>
            </View>
          )}
        </View>

        {/* Calendario mensual */}
        <View style={styles.seccionContainer}>
          <View style={styles.calendarioHeader}>
            <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.mesBtn}>
              <Ionicons name="chevron-back" size={24} color="#4a90e2" />
            </TouchableOpacity>
            <Text style={styles.mesTitulo}>
              {mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => cambiarMes(1)} style={styles.mesBtn}>
              <Ionicons name="chevron-forward" size={24} color="#4a90e2" />
            </TouchableOpacity>
          </View>
          
          {/* Días de la semana */}
          <View style={styles.diasSemanaRow}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, index) => (
              <Text key={index} style={styles.diaSemanaLabel}>{dia}</Text>
            ))}
          </View>
          
          {/* Grid del calendario */}
          <View style={styles.calendarioGrid}>
            {diasMes.map((dia, index) => {
              if (!dia) {
                return <View key={`empty-${index}`} style={styles.diaVacio} />;
              }
              
              const estado = obtenerEstadoDia(dia.completa);
              const esHoy = dia.completa === new Date().toISOString().split('T')[0];
              const esPasado = new Date(dia.completa) < new Date().setHours(0, 0, 0, 0);
              const seleccionado = fechaSeleccionada === dia.completa;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.diaCalendario,
                    estado === 'disponible' && styles.diaDisponible,
                    estado === 'reservado-propio' && styles.diaReservadoPropio,
                    estado === 'reservado-otro' && styles.diaReservadoOtro,
                    esPasado && styles.diaPasado,
                    seleccionado && styles.diaSeleccionado,
                  ]}
                  onPress={() => !esPasado && setFechaSeleccionada(dia.completa)}
                  disabled={esPasado}
                >
                  <Text style={[
                    styles.diaNumeroCalendario,
                    esPasado && styles.diaNumeroDeshabilitado,
                    seleccionado && styles.diaNumeroSeleccionado,
                  ]}>
                    {dia.dia}
                  </Text>
                  {esHoy && !seleccionado && <View style={styles.hoyIndicador} />}
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Leyenda */}
          <View style={styles.leyendaContainer}>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaColor, { backgroundColor: '#4a90e2' }]} />
              <Text style={styles.leyendaTexto}>Disponible</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaColor, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.leyendaTexto}>Tu reserva</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaColor, { backgroundColor: '#F44336' }]} />
              <Text style={styles.leyendaTexto}>Reservado</Text>
            </View>
          </View>
        </View>

        {/* Selector de hora */}
        <View style={styles.seccionContainer}>
          <Text style={styles.seccionTitulo}>Selecciona la hora de inicio</Text>
          <View style={styles.horariosGrid}>
            {horarios.map((hora) => (
              <TouchableOpacity
                key={hora}
                style={[
                  styles.horarioCard,
                  horaSeleccionada === hora && styles.horarioCardSelected,
                ]}
                onPress={() => setHoraSeleccionada(hora)}
              >
                <Text style={[
                  styles.horarioText,
                  horaSeleccionada === hora && styles.horarioTextSelected,
                ]}>
                  {hora}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selector de número de personas */}
        <View style={styles.seccionContainer}>
          <Text style={styles.seccionTitulo}>Número de personas</Text>
          <View style={styles.personasContainer}>
            <TouchableOpacity
              style={styles.personasBtn}
              onPress={() => setNumPersonas(Math.max(1, numPersonas - 1))}
            >
              <Ionicons name="remove" size={24} color="#4a90e2" />
            </TouchableOpacity>
            <Text style={styles.personasNumero}>{numPersonas}</Text>
            <TouchableOpacity
              style={styles.personasBtn}
              onPress={() => setNumPersonas(Math.min(parseInt(params.areaMaxPersonas), numPersonas + 1))}
            >
              <Ionicons name="add" size={24} color="#4a90e2" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Botón de reservar */}
      <View style={styles.bottomContainer}>
        <View style={styles.resumenContainer}>
          <Text style={styles.resumenLabel}>Total a pagar</Text>
          <Text style={styles.resumenValor}>${params.areaCosto}</Text>
        </View>
        <TouchableOpacity style={styles.btnReservar} onPress={handleReservar}>
          <Text style={styles.btnReservarText}>Confirmar Reserva</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  ubicacionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ubicacionText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  detallesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detalleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  detalleText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  costoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 12,
  },
  costoLabel: {
    fontSize: 16,
    color: '#666',
  },
  costoValor: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4a90e2',
  },
  observacionesContainer: {
    marginTop: 8,
  },
  observacionesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  observacionesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  seccionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  calendarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mesBtn: {
    padding: 8,
  },
  mesTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textTransform: 'capitalize',
  },
  diasSemanaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  diaSemanaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  calendarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  diaVacio: {
    width: '14.28%',
    aspectRatio: 1,
  },
  diaCalendario: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
    position: 'relative',
  },
  diaDisponible: {
    backgroundColor: '#E3F2FD',
  },
  diaReservadoPropio: {
    backgroundColor: '#C8E6C9',
  },
  diaReservadoOtro: {
    backgroundColor: '#FFCDD2',
  },
  diaPasado: {
    backgroundColor: '#f5f5f5',
    opacity: 0.5,
  },
  diaSeleccionado: {
    backgroundColor: '#4a90e2',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  diaNumeroCalendario: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  diaNumeroDeshabilitado: {
    color: '#999',
  },
  diaNumeroSeleccionado: {
    color: '#fff',
    fontWeight: '700',
  },
  hoyIndicador: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4a90e2',
  },
  leyendaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leyendaColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  leyendaTexto: {
    fontSize: 12,
    color: '#666',
  },
  horariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  horarioCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    margin: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  horarioCardSelected: {
    backgroundColor: '#4a90e2',
  },
  horarioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  horarioTextSelected: {
    color: '#fff',
  },
  personasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personasBtn: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personasNumero: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginHorizontal: 32,
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  resumenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resumenLabel: {
    fontSize: 16,
    color: '#666',
  },
  resumenValor: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4a90e2',
  },
  btnReservar: {
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  btnReservarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
