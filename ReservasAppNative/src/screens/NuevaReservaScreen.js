import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Clipboard // Importar Clipboard si es posible, si no, borrar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reservaService, configuracionService } from '../services/api';
import { launchImageLibrary } from 'react-native-image-picker';

export default function NuevaReservaScreen({ navigation, route }) {
  const { area } = route.params || {};
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [numPersonas, setNumPersonas] = useState(1);
  const [mesActual, setMesActual] = useState(new Date());
  const [diasMes, setDiasMes] = useState([]);
  const [reservasDelMes, setReservasDelMes] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [comprobante, setComprobante] = useState(null);

  useEffect(() => {
    cargarUsuarioId();
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const config = await configuracionService.obtener();
      setConfiguracion(config);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const copiarCuenta = () => {
    if (configuracion?.numero_cuenta) {
      if (Clipboard) Clipboard.setString(configuracion.numero_cuenta);
      Alert.alert('Copiado', 'Número de cuenta copiado al portapapeles');
    }
  };

  const seleccionarComprobante = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true, // Cambiar a true
      quality: 0.5, // Reducir más la calidad
      maxWidth: 800, // Reducir tamaño máximo
      maxHeight: 800,
    };

    const result = await launchImageLibrary(options);
    if (result.assets && result.assets.length > 0) {
      console.log('Imagen seleccionada, tiene base64:', !!result.assets[0].base64);
      setComprobante(result.assets[0]);
    }
  };

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
        areaId: area?.id,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        todas: 'true', 
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
    
    for (let i = 0; i < diaSemanaInicio; i++) {
      diasArray.push(null);
    }
    
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(año, mes, dia);
      diasArray.push({
        dia: dia,
        fecha: fecha,
        completa: fecha.toISOString().split('T')[0],
      });
    }
    
    setDiasMes(diasArray);
    
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
    
    if (reservasDelDia.length === 0) return 'disponible';
    
    const tieneReservaPropia = reservasDelDia.some(r => r.usuarioId === usuarioId);
    if (tieneReservaPropia) return 'reservado-propio';
    
    return 'reservado-otro';
  };

  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(mesActual);
    nuevoMes.setMonth(mesActual.getMonth() + direccion);
    setMesActual(nuevoMes);
  };

  const verificarHoraOcupada = (hora) => {
    if (!fechaSeleccionada) return false;
    
    const reservasDelDia = reservasDelMes.filter(
      r => r.fecha_reserva === fechaSeleccionada && r.estado !== 'cancelada'
    );
    
    // Verificar si la hora está ocupada por alguna reserva
    return reservasDelDia.some(r => {
      const horaInicioReserva = r.hora_inicio.substring(0, 5); // "HH:MM"
      const horaFinReserva = r.hora_fin.substring(0, 5);
      
      // Verificar si la hora seleccionada cae dentro del rango de la reserva
      return hora >= horaInicioReserva && hora < horaFinReserva;
    });
  };

  const horarios = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const handleReservar = async () => {
    if (!fechaSeleccionada || !horaSeleccionada) {
      Alert.alert('Error', 'Por favor selecciona fecha y hora');
      return;
    }

    if (numPersonas > parseInt(area?.maximo_personas || 10)) {
      Alert.alert('Error', `El máximo de personas es ${area?.maximo_personas}`);
      return;
    }

    if (!comprobante) {
      Alert.alert('Error', 'Debes subir el comprobante de pago');
      return;
    }

    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      const usuario = JSON.parse(usuarioStr);

      const [horas, minutos] = horaSeleccionada.split(':');
      const horaInicio = new Date();
      horaInicio.setHours(parseInt(horas), parseInt(minutos), 0);
      
      const horaFin = new Date(horaInicio.getTime() + parseInt(area?.tiempo_minimo || 60) * 60000);
      const horaFinStr = `${horaFin.getHours().toString().padStart(2, '0')}:${horaFin.getMinutes().toString().padStart(2, '0')}`;

      // Usar base64 directamente del image picker
      let fotoBase64 = null;
      if (comprobante && comprobante.base64) {
        const imageType = comprobante.type || 'image/jpeg';
        fotoBase64 = `data:${imageType};base64,${comprobante.base64}`;
        console.log('Imagen base64 preparada, tamaño:', fotoBase64.length);
      }

      const reservaData = {
        usuarioId: usuario.id,
        conjuntoId: usuario.conjuntoId || 1,
        areaId: parseInt(area?.id),
        fecha_reserva: fechaSeleccionada,
        hora_inicio: horaSeleccionada + ':00',
        hora_fin: horaFinStr + ':00',
        personas: numPersonas,
        observaciones: '',
        foto_comprobante: fotoBase64
      };

      console.log('Enviando reserva...');
      await reservaService.crear(reservaData);
      Alert.alert('Éxito', 'Reserva enviada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error al crear reserva:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo crear la reserva');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen del área con botón flotante */}
        <View style={styles.imageContainer}>
          {area?.fotos ? (
            <Image
              source={{
                uri: area.fotos.includes('data:')
                  ? area.fotos
                  : `data:image/jpeg;base64,${area.fotos}`,
              }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="image-outline" size={80} color="#ddd" />
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Información del área */}
        <View style={styles.infoContainer}>
          <View style={styles.ubicacionRow}>
            <Icon name="location" size={16} color="#999" />
            <Text style={styles.ubicacionText}>{area?.Conjunto?.nombre_conjunto || 'Conjunto'}</Text>
          </View>
          
          <Text style={styles.titulo}>{area?.nombre_area}</Text>

          {/* ... resto de detalles ... */}
        </View>

        {/* Datos Bancarios */}
        <View style={styles.seccionContainer}>
          <Text style={styles.seccionTitulo}>Datos para Transferencia</Text>
          {configuracion ? (
            <View style={styles.bancoCard}>
              <Text style={styles.bancoNombre}>{configuracion.banco}</Text>
              <Text style={styles.bancoDetalle}>{configuracion.tipo_cuenta} - {configuracion.numero_cuenta}</Text>
              <Text style={styles.bancoDetalle}>{configuracion.nombre_titular}</Text>
              {configuracion.cedula_titular && (
                <Text style={styles.bancoDetalle}>CI/RUC: {configuracion.cedula_titular}</Text>
              )}
              <TouchableOpacity style={styles.copiarBtn} onPress={copiarCuenta}>
                <Icon name="copy-outline" size={16} color="#4a90e2" />
                <Text style={styles.copiarText}>Copiar Cuenta</Text>
              </TouchableOpacity>
            </View>
          ) : (
             <Text style={styles.mensajeInfo}>Cargando datos bancarios...</Text>
          )}

          <TouchableOpacity style={styles.uploadBtn} onPress={seleccionarComprobante}>
            <Icon name={comprobante ? "checkmark-circle" : "cloud-upload-outline"} size={24} color={comprobante ? "#4CAF50" : "#666"} />
            <Text style={[styles.uploadText, comprobante && { color: '#4CAF50' }]}>
              {comprobante ? 'Comprobante Seleccionado' : 'Subir Comprobante de Pago'}
            </Text>
          </TouchableOpacity>
          {comprobante && (
            <Image source={{ uri: comprobante.uri }} style={styles.comprobantePreview} />
          )}
        </View>

        {/* Calendario mensual */}
        <View style={styles.seccionContainer}>
          {/* ... (código existente del calendario) ... */}
           <View style={styles.calendarioHeader}>
            <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.mesBtn}>
              <Icon name="chevron-back" size={24} color="#4a90e2" />
            </TouchableOpacity>
            <Text style={styles.mesTitulo}>
              {mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => cambiarMes(1)} style={styles.mesBtn}>
              <Icon name="chevron-forward" size={24} color="#4a90e2" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.diasSemanaRow}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, index) => (
              <Text key={index} style={styles.diaSemanaLabel}>{dia}</Text>
            ))}
          </View>
          
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

        {/* ... (resto del scrollview) selector hora, personas ... */}
        {/* Selector de hora */}
        <View style={styles.seccionContainer}>
          <Text style={styles.seccionTitulo}>Selecciona la hora de inicio</Text>
          <View style={styles.horariosGrid}>
            {horarios.map((hora) => {
              const estaOcupada = verificarHoraOcupada(hora);
              return (
                <TouchableOpacity
                  key={hora}
                  style={[
                    styles.horarioCard,
                    horaSeleccionada === hora && styles.horarioCardSelected,
                    estaOcupada && styles.horarioCardOcupado,
                  ]}
                  onPress={() => !estaOcupada && setHoraSeleccionada(hora)}
                  disabled={estaOcupada}
                >
                  <Text style={[
                    styles.horarioText,
                    horaSeleccionada === hora && styles.horarioTextSelected,
                    estaOcupada && styles.horarioTextOcupado,
                  ]}>
                    {hora}
                  </Text>
                  {estaOcupada && (
                    <Icon name="lock-closed" size={12} color="#fff" style={styles.horarioIcono} />
                  )}
                </TouchableOpacity>
              );
            })}
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
              <Icon name="remove" size={24} color="#4a90e2" />
            </TouchableOpacity>
            <Text style={styles.personasNumero}>{numPersonas}</Text>
            <TouchableOpacity
              style={styles.personasBtn}
              onPress={() => setNumPersonas(Math.min(parseInt(area?.maximo_personas || 10), numPersonas + 1))}
            >
              <Icon name="add" size={24} color="#4a90e2" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Botón de reservar */}
      <View style={styles.bottomContainer}>
        <View style={styles.resumenContainer}>
          <Text style={styles.resumenLabel}>Total a pagar</Text>
          <Text style={styles.resumenValor}>${area?.costo}</Text>
        </View>
        <TouchableOpacity style={[styles.btnReservar, !comprobante && { backgroundColor: '#ccc' }]} onPress={handleReservar} disabled={!comprobante}>
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
  horarioCardOcupado: {
    backgroundColor: '#F44336',
    opacity: 0.8,
  },
  horarioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  horarioTextSelected: {
    color: '#fff',
  },
  horarioTextOcupado: {
    color: '#fff',
  },
  horarioIcono: {
    marginTop: 4,
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
  bancoCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bcdbfb',
    marginBottom: 16,
  },
  bancoNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  bancoDetalle: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 2,
  },
  copiarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  copiarText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '600',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  uploadText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  comprobantePreview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  mensajeInfo: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 10,
  }
});
