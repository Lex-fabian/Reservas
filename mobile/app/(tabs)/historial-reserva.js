import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { reservaService } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function HistorialReservaScreen() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [usuarioId, setUsuarioId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState(new Date());
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarUsuario();
    }, [])
  );

  const cargarUsuario = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        setUsuarioId(usuario.id);
        cargarReservas(usuario.id);
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      setLoading(false);
    }
  };

  const cargarReservas = async (userId) => {
    try {
      const response = await reservaService.obtenerTodas();
      // Filtrar solo las reservas del usuario actual
      const reservasUsuario = (response.reservas || response).filter(
        (reserva) => reserva.usuarioId === userId || reserva.usuario_id === userId
      );
      // Ordenar reservas por fecha más reciente
      const reservasOrdenadas = reservasUsuario.sort((a, b) => {
        return new Date(b.fecha) - new Date(a.fecha);
      });
      setReservas(reservasOrdenadas);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las reservas');
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (usuarioId) {
      cargarReservas(usuarioId);
    }
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    if (filtroEstado === 'todas') return true;
    return reserva.estado?.toLowerCase() === filtroEstado;
  });

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
        return '#4CAF50';
      case 'pendiente':
        return '#FF9800';
      case 'cancelada':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
        return 'checkmark-circle';
      case 'pendiente':
        return 'time';
      case 'cancelada':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    const opciones = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    };
    return date.toLocaleDateString('es-ES', opciones);
  };

  const esReservaActual = (fecha) => {
    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaReserva >= hoy;
  };

  const handleEditarFecha = (reserva) => {
    setReservaEditando(reserva);
    
    // Convertir fecha string a Date object
    if (reserva.fecha_reserva) {
      const [year, month, day] = reserva.fecha_reserva.split('-');
      setNuevaFecha(new Date(year, month - 1, day));
    } else {
      setNuevaFecha(new Date());
    }
    
    // Convertir hora string a Date object
    if (reserva.hora_inicio) {
      const [hours, minutes] = reserva.hora_inicio.split(':');
      const horaDate = new Date();
      horaDate.setHours(parseInt(hours), parseInt(minutes), 0);
      setNuevaHoraInicio(horaDate);
    } else {
      setNuevaHoraInicio(new Date());
    }
    
    setModalVisible(true);
  };

  const onChangeFecha = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNuevaFecha(selectedDate);
    }
  };

  const onChangeHora = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setNuevaHoraInicio(selectedTime);
    }
  };

  const formatearFechaParaAPI = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatearHoraParaAPI = (hora) => {
    const hours = String(hora.getHours()).padStart(2, '0');
    const minutes = String(hora.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  const calcularHoraFin = (horaInicio, duracion = 2) => {
    const horaFin = new Date(horaInicio);
    horaFin.setHours(horaFin.getHours() + duracion);
    return formatearHoraParaAPI(horaFin);
  };

  const guardarCambios = async () => {
    try {
      const fechaFormateada = formatearFechaParaAPI(nuevaFecha);
      const horaInicioFormateada = formatearHoraParaAPI(nuevaHoraInicio);
      const horaFinFormateada = calcularHoraFin(nuevaHoraInicio, 2);

      await reservaService.actualizar(reservaEditando.id, {
        fecha_reserva: fechaFormateada,
        hora_inicio: horaInicioFormateada,
        hora_fin: horaFinFormateada,
      });
      
      Alert.alert('Éxito', 'Reserva actualizada correctamente');
      setModalVisible(false);
      cargarReservas(usuarioId);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la reserva');
      console.error('Error actualizando reserva:', error);
    }
  };

  const handleCancelar = async (reserva) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservaService.cancelar(reserva.id);
              Alert.alert('Éxito', 'Reserva cancelada correctamente');
              cargarReservas(usuarioId);
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
              console.error('Error cancelando reserva:', error);
            }
          },
        },
      ]
    );
  };

  const handleEliminar = async (reserva) => {
    Alert.alert(
      'Eliminar Reserva',
      '¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservaService.eliminar(reserva.id);
              Alert.alert('Éxito', 'Reserva eliminada correctamente');
              cargarReservas(usuarioId);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la reserva');
              console.error('Error eliminando reserva:', error);
            }
          },
        },
      ]
    );
  };

  const renderReserva = ({ item }) => {
    const fechaReserva = item.fecha_reserva || item.fecha;
    const actual = esReservaActual(fechaReserva);
    const nombreArea = item.Area?.nombre_area || item.area || 'Área no especificada';
    const esPendiente = item.estado?.toLowerCase() === 'pendiente';
    
    return (
      <View style={[styles.reservaCard, !actual && styles.reservaAnterior]}>
        <View style={styles.reservaHeader}>
          <View style={styles.headerLeft}>
            <Ionicons 
              name={getEstadoIcon(item.estado)} 
              size={24} 
              color={getEstadoColor(item.estado)} 
            />
            <View style={styles.headerInfo}>
              <Text style={styles.servicioText}>{nombreArea}</Text>
              <Text style={styles.fechaText}>{formatearFecha(fechaReserva)}</Text>
            </View>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
            <Text style={styles.estadoText}>{item.estado || 'Pendiente'}</Text>
          </View>
        </View>

        <View style={styles.reservaBody}>
          {actual && (
            <View style={styles.actualBadge}>
              <Ionicons name="calendar" size={14} color="#fff" />
              <Text style={styles.actualText}>Próxima/Actual</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.hora_inicio || item.hora || 'Sin hora'} - {item.hora_fin || 'Sin fin'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.personas || 1} persona{item.personas > 1 ? 's' : ''}</Text>
          </View>

          {item.Conjunto?.nombre_conjunto && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{item.Conjunto.nombre_conjunto}</Text>
            </View>
          )}

          {item.observaciones && (
            <View style={styles.notasContainer}>
              <Text style={styles.notasLabel}>Observaciones:</Text>
              <Text style={styles.notasText}>{item.observaciones}</Text>
            </View>
          )}

          {item.motivo_cancelacion && (
            <View style={styles.notasContainer}>
              <Text style={styles.notasLabel}>Motivo de cancelación:</Text>
              <Text style={styles.notasText}>{item.motivo_cancelacion}</Text>
            </View>
          )}

          {esPendiente && (
            <View style={styles.accionesContainer}>
              <TouchableOpacity
                style={[styles.botonAccion, styles.botonEditar]}
                onPress={() => handleEditarFecha(item)}
              >
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.textoBoton}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botonAccion, styles.botonCancelar]}
                onPress={() => handleCancelar(item)}
              >
                <Ionicons name="close-circle-outline" size={18} color="#fff" />
                <Text style={styles.textoBoton}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botonAccion, styles.botonEliminar]}
                onPress={() => handleEliminar(item)}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.textoBoton}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEstadisticas = () => {
    const confirmadas = reservas.filter(r => r.estado?.toLowerCase() === 'confirmada').length;
    const pendientes = reservas.filter(r => r.estado?.toLowerCase() === 'pendiente').length;
    const canceladas = reservas.filter(r => r.estado?.toLowerCase() === 'cancelada').length;

    return (
      <View style={styles.estadisticas}>
        <View style={styles.estadItem}>
          <Text style={styles.estadNumero}>{confirmadas}</Text>
          <Text style={styles.estadLabel}>Confirmadas</Text>
        </View>
        <View style={styles.estadItem}>
          <Text style={styles.estadNumero}>{pendientes}</Text>
          <Text style={styles.estadLabel}>Pendientes</Text>
        </View>
        <View style={styles.estadItem}>
          <Text style={styles.estadNumero}>{canceladas}</Text>
          <Text style={styles.estadLabel}>Canceladas</Text>
        </View>
        <View style={styles.estadItem}>
          <Text style={styles.estadNumero}>{reservas.length}</Text>
          <Text style={styles.estadLabel}>Total</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Reservas</Text>
        <Text style={styles.subtitle}>
          {reservas.length} {reservas.length === 1 ? 'reserva' : 'reservas'} en total
        </Text>
      </View>

      {renderEstadisticas()}

      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroBoton, filtroEstado === 'todas' && styles.filtroActivo]}
          onPress={() => setFiltroEstado('todas')}
        >
          <Text style={[styles.filtroTexto, filtroEstado === 'todas' && styles.filtroTextoActivo]}>
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filtroBoton, filtroEstado === 'confirmada' && styles.filtroActivo]}
          onPress={() => setFiltroEstado('confirmada')}
        >
          <Text style={[styles.filtroTexto, filtroEstado === 'confirmada' && styles.filtroTextoActivo]}>
            Confirmadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filtroBoton, filtroEstado === 'pendiente' && styles.filtroActivo]}
          onPress={() => setFiltroEstado('pendiente')}
        >
          <Text style={[styles.filtroTexto, filtroEstado === 'pendiente' && styles.filtroTextoActivo]}>
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filtroBoton, filtroEstado === 'cancelada' && styles.filtroActivo]}
          onPress={() => setFiltroEstado('cancelada')}
        >
          <Text style={[styles.filtroTexto, filtroEstado === 'cancelada' && styles.filtroTextoActivo]}>
            Canceladas
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reservasFiltradas}
        renderItem={renderReserva}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {filtroEstado === 'todas' 
                ? 'No tienes reservas aún'
                : `No hay reservas ${filtroEstado}s`}
            </Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
            style={styles.modalOverlay}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                {/* Header del Modal */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderContent}>
                    <View style={styles.modalIconContainer}>
                      <Ionicons name="create-outline" size={24} color="#4a90e2" />
                    </View>
                    <View style={styles.modalHeaderText}>
                      <Text style={styles.modalTitle}>Editar Reserva</Text>
                      <Text style={styles.modalSubtitle}>
                        {reservaEditando?.Area?.nombre_area || 'Área'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close-circle" size={32} color="#999" />
                  </TouchableOpacity>
                </View>

                {/* Body del Modal */}
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Selector de Fecha */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="calendar" size={18} color="#4a90e2" />
                      <Text style={styles.label}>Fecha de Reserva</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dateButtonContent}>
                        <Text style={styles.dateButtonText}>
                          {nuevaFecha.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                      </View>
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={nuevaFecha}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeFecha}
                        minimumDate={new Date()}
                      />
                    )}
                  </View>

                  {/* Selector de Hora */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="time" size={18} color="#4a90e2" />
                      <Text style={styles.label}>Hora de Inicio</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowTimePicker(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dateButtonContent}>
                        <Text style={styles.dateButtonText}>
                          {nuevaHoraInicio.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                      </View>
                    </TouchableOpacity>

                    {showTimePicker && (
                      <DateTimePicker
                        value={nuevaHoraInicio}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeHora}
                        is24Hour={true}
                      />
                    )}
                  </View>

                  {/* Información de Duración */}
                  <View style={styles.durationInfo}>
                    <View style={styles.durationHeader}>
                      <Ionicons name="timer-outline" size={20} color="#4a90e2" />
                      <Text style={styles.durationTitle}>Duración de la Reserva</Text>
                    </View>
                    <View style={styles.durationDetails}>
                      <View style={styles.durationRow}>
                        <Text style={styles.durationLabel}>Hora Inicio:</Text>
                        <Text style={styles.durationValue}>
                          {nuevaHoraInicio.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <View style={styles.durationRow}>
                        <Text style={styles.durationLabel}>Hora Fin:</Text>
                        <Text style={styles.durationValue}>
                          {(() => {
                            const horaFin = new Date(nuevaHoraInicio);
                            horaFin.setHours(horaFin.getHours() + 2);
                            return horaFin.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          })()}
                        </Text>
                      </View>
                      <View style={[styles.durationRow, styles.durationTotal]}>
                        <Text style={styles.durationTotalLabel}>Duración Total:</Text>
                        <Text style={styles.durationTotalValue}>2 horas</Text>
                      </View>
                    </View>
                  </View>

                  {/* Nota Informativa */}
                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={24} color="#2196F3" />
                    <Text style={styles.infoText}>
                      La hora de finalización se calcula automáticamente sumando 2 horas a la hora de inicio.
                    </Text>
                  </View>
                </ScrollView>

                {/* Footer con Botones */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.botonCancelarModal}
                    onPress={() => setModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.textoBotonCancelar}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.botonGuardar}
                    onPress={guardarCambios}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.textoBotonGuardar}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4a90e2',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  estadisticas: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  estadItem: {
    flex: 1,
    alignItems: 'center',
  },
  estadNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 4,
  },
  estadLabel: {
    fontSize: 12,
    color: '#666',
  },
  filtrosContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filtroBoton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  filtroActivo: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  filtroTexto: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filtroTextoActivo: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  reservaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reservaAnterior: {
    opacity: 0.7,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  servicioText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  fechaText: {
    fontSize: 14,
    color: '#666',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  reservaBody: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  actualText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  notasContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4a90e2',
  },
  notasLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 4,
  },
  notasText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  dateButton: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  dateButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
    textTransform: 'capitalize',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    padding: 14,
    borderRadius: 10,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  accionesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  botonAccion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  botonEditar: {
    backgroundColor: '#4a90e2',
  },
  botonCancelar: {
    backgroundColor: '#FF9800',
  },
  botonEliminar: {
    backgroundColor: '#F44336',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  modalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  durationInfo: {
    backgroundColor: '#f5f8fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  durationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  durationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  durationDetails: {
    gap: 8,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  durationLabel: {
    fontSize: 14,
    color: '#666',
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  durationTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  durationTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4a90e2',
  },
  durationTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4a90e2',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    backgroundColor: '#fafafa',
  },
  botonCancelarModal: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textoBotonCancelar: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    gap: 8,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBotonGuardar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
