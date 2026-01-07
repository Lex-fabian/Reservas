import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { reservaService, conjuntoService, areaService } from '../services/api';

export default function InicioAdminScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [vistaActual, setVistaActual] = useState('reservas'); 
  const [modalAreaVisible, setModalAreaVisible] = useState(false);
  const [modalConjuntoVisible, setModalConjuntoVisible] = useState(false);
  const [modalDetalleReserva, setModalDetalleReserva] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [nuevaArea, setNuevaArea] = useState({
    nombre_area: '',
    maximo_personas: '',
    conjuntoId: '',
    observaciones: '',
    costo: '',
  });
  const [nuevoConjunto, setNuevoConjunto] = useState({
    nombre_conjunto: '',
    direccion: '',
    telefono: '',
    email: '',
  });
  
  const [conjuntos, setConjuntos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      if (usuarioStr) {
        const user = JSON.parse(usuarioStr);
        setUsuario(user);
      }
      
      await Promise.all([
        cargarReservasPendientes(),
        cargarConjuntos(),
        cargarAreas(),
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cargarReservasPendientes = async () => {
    try {
      const response = await reservaService.obtenerTodas();
      const pendientes = (response.reservas || response).filter(
        (r) => r.estado?.toLowerCase() === 'pendiente'
      );
      setReservasPendientes(pendientes);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    }
  };

  const cargarConjuntos = async () => {
    try {
      const response = await conjuntoService.obtenerTodos();
      setConjuntos(response.conjuntos || response);
    } catch (error) {
      console.error('Error cargando conjuntos:', error);
    }
  };

  const cargarAreas = async () => {
    try {
      const response = await areaService.obtenerTodas();
      setAreas(response.areas || response);
    } catch (error) {
      console.error('Error cargando áreas:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const handleAceptarReserva = async (reservaId) => {
    Alert.alert(
      'Confirmar Reserva',
      '¿Deseas confirmar esta reserva?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await reservaService.actualizar(reservaId, { estado: 'confirmada' });
              Alert.alert('Éxito', 'Reserva confirmada correctamente');
              cargarReservasPendientes();
              setModalDetalleReserva(false);
            } catch (error) {
              Alert.alert('Error', 'No se pudo confirmar la reserva');
              console.error('Error confirmando reserva:', error);
            }
          },
        },
      ]
    );
  };

  const handleRechazarReserva = async (reservaId) => {
    Alert.alert(
      'Rechazar Reserva',
      '¿Estás seguro de rechazar esta reserva?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservaService.cancelar(reservaId);
              Alert.alert('Éxito', 'Reserva rechazada');
              cargarReservasPendientes();
              setModalDetalleReserva(false);
            } catch (error) {
              Alert.alert('Error', 'No se pudo rechazar la reserva');
              console.error('Error rechazando reserva:', error);
            }
          },
        },
      ]
    );
  };

  const handleCrearArea = async () => {
    if (!nuevaArea.nombre_area || !nuevaArea.conjuntoId || !nuevaArea.maximo_personas) {
      Alert.alert('Error', 'Por favor completa los campos requeridos (nombre, conjunto y capacidad)');
      return;
    }

    try {
      const areaData = {
        nombre_area: nuevaArea.nombre_area,
        maximo_personas: parseInt(nuevaArea.maximo_personas),
        conjuntoId: nuevaArea.conjuntoId,
        observaciones: nuevaArea.observaciones || null,
        costo: nuevaArea.costo ? parseFloat(nuevaArea.costo) : 0,
        estado: 'activo',
      };

      await areaService.crear(areaData);
      Alert.alert('Éxito', 'Área creada correctamente');
      setModalAreaVisible(false);
      setNuevaArea({ nombre_area: '', maximo_personas: '', conjuntoId: '', observaciones: '', costo: '' });
      cargarAreas();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo crear el área');
      console.error('Error creando área:', error);
    }
  };

  const handleCrearConjunto = async () => {
    if (!nuevoConjunto.nombre_conjunto || !nuevoConjunto.direccion) {
      Alert.alert('Error', 'Por favor completa los campos requeridos (nombre y dirección)');
      return;
    }

    try {
      const conjuntoData = {
        nombre_conjunto: nuevoConjunto.nombre_conjunto,
        direccion: nuevoConjunto.direccion,
        estado: 'activo',
      };

      await conjuntoService.crear(conjuntoData);
      Alert.alert('Éxito', 'Conjunto creado correctamente');
      setModalConjuntoVisible(false);
      setNuevoConjunto({ nombre_conjunto: '', direccion: '', telefono: '', email: '' });
      cargarConjuntos();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo crear el conjunto');
      console.error('Error creando conjunto:', error);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  const renderReservaPendiente = (reserva) => (
    <TouchableOpacity
      key={reserva.id}
      style={styles.reservaCard}
      onPress={() => {
        setReservaSeleccionada(reserva);
        setModalDetalleReserva(true);
      }}
    >
      <View style={styles.reservaHeader}>
        <View style={styles.reservaHeaderLeft}>
          <Ionicons name="calendar-outline" size={24} color="#FF9800" />
          <View style={styles.reservaInfo}>
            <Text style={styles.reservaArea}>
              {reserva.Area?.nombre_area || 'Área no especificada'}
            </Text>
            <Text style={styles.reservaUsuario}>
              Solicitado por: {reserva.Usuario?.nombre || 'Usuario'}
            </Text>
          </View>
        </View>
        <View style={styles.badgePendiente}>
          <Text style={styles.badgeText}>Pendiente</Text>
        </View>
      </View>

      <View style={styles.reservaBody}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {formatearFecha(reserva.fecha_reserva)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="timer-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {reserva.hora_inicio} - {reserva.hora_fin}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {reserva.personas || 1} persona(s)
          </Text>
        </View>
      </View>

      <View style={styles.accionesRapidas}>
        <TouchableOpacity
          style={[styles.botonAccion, styles.botonAceptar]}
          onPress={(e) => {
            e.stopPropagation();
            handleAceptarReserva(reserva.id);
          }}
        >
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.textoBotonAccion}>Aceptar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botonAccion, styles.botonRechazar]}
          onPress={(e) => {
            e.stopPropagation();
            handleRechazarReserva(reserva.id);
          }}
        >
          <Ionicons name="close-circle" size={18} color="#fff" />
          <Text style={styles.textoBotonAccion}>Rechazar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderVistaReservas = () => (
    <View style={styles.contenido}>
      <View style={styles.seccionHeader}>
        <Text style={styles.seccionTitulo}>Reservas Pendientes</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeCount}>{reservasPendientes.length}</Text>
        </View>
      </View>

      {reservasPendientes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay reservas pendientes</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {reservasPendientes.map(renderReservaPendiente)}
        </ScrollView>
      )}
    </View>
  );

  const renderVistaAreas = () => (
    <View style={styles.contenido}>
      <View style={styles.seccionHeader}>
        <Text style={styles.seccionTitulo}>Gestión de Áreas</Text>
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => setModalAreaVisible(true)}
        >
          <Ionicons name="add-circle" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {areas.map((area) => (
          <View key={area.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Ionicons name="business-outline" size={24} color="#4a90e2" />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>{area.nombre_area}</Text>
                <Text style={styles.itemSubtitulo}>
                  {area.Conjunto?.nombre_conjunto || 'Sin conjunto'}
                </Text>
              </View>
            </View>
            {area.observaciones && (
              <Text style={styles.itemDescripcion}>{area.observaciones}</Text>
            )}
            <View style={styles.itemFooter}>
              <View style={styles.itemRow}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.itemDetalle}>
                  Capacidad: {area.maximo_personas || 'No especificada'} personas
                </Text>
              </View>
              {area.costo > 0 && (
                <View style={styles.itemRow}>
                  <Ionicons name="cash-outline" size={16} color="#666" />
                  <Text style={styles.itemDetalle}>Costo: ${area.costo}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderVistaConjuntos = () => (
    <View style={styles.contenido}>
      <View style={styles.seccionHeader}>
        <Text style={styles.seccionTitulo}>Gestión de Conjuntos</Text>
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => setModalConjuntoVisible(true)}
        >
          <Ionicons name="add-circle" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {conjuntos.map((conjunto) => (
          <View key={conjunto.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Ionicons name="location-outline" size={24} color="#4a90e2" />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>{conjunto.nombre_conjunto}</Text>
                <Text style={styles.itemSubtitulo}>{conjunto.direccion}</Text>
              </View>
            </View>
            {conjunto.telefono && (
              <View style={styles.itemRow}>
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text style={styles.itemDetalle}>{conjunto.telefono}</Text>
              </View>
            )}
            {conjunto.email && (
              <View style={styles.itemRow}>
                <Ionicons name="mail-outline" size={16} color="#666" />
                <Text style={styles.itemDetalle}>{conjunto.email}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Panel de Administración</Text>
          <Text style={styles.subtitulo}>
            Bienvenido, {usuario?.nombre || 'Admin'}
          </Text>
        </View>
      </View>

      {/* Tabs de navegación */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, vistaActual === 'reservas' && styles.tabActivo]}
          onPress={() => setVistaActual('reservas')}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={vistaActual === 'reservas' ? '#4a90e2' : '#999'}
          />
          <Text
            style={[
              styles.tabTexto,
              vistaActual === 'reservas' && styles.tabTextoActivo,
            ]}
          >
            Reservas
          </Text>
          {reservasPendientes.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{reservasPendientes.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, vistaActual === 'areas' && styles.tabActivo]}
          onPress={() => setVistaActual('areas')}
        >
          <Ionicons
            name="business"
            size={20}
            color={vistaActual === 'areas' ? '#4a90e2' : '#999'}
          />
          <Text
            style={[
              styles.tabTexto,
              vistaActual === 'areas' && styles.tabTextoActivo,
            ]}
          >
            Áreas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, vistaActual === 'conjuntos' && styles.tabActivo]}
          onPress={() => setVistaActual('conjuntos')}
        >
          <Ionicons
            name="location"
            size={20}
            color={vistaActual === 'conjuntos' ? '#4a90e2' : '#999'}
          />
          <Text
            style={[
              styles.tabTexto,
              vistaActual === 'conjuntos' && styles.tabTextoActivo,
            ]}
          >
            Conjuntos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido según vista actual */}
      {vistaActual === 'reservas' && renderVistaReservas()}
      {vistaActual === 'areas' && renderVistaAreas()}
      {vistaActual === 'conjuntos' && renderVistaConjuntos()}

      {/* Modal Detalle Reserva */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDetalleReserva}
        onRequestClose={() => setModalDetalleReserva(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Detalle de Reserva</Text>
              <TouchableOpacity onPress={() => setModalDetalleReserva(false)}>
                <Ionicons name="close-circle" size={32} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {reservaSeleccionada && (
                <>
                  <View style={styles.detalleSeccion}>
                    <Text style={styles.detalleLabel}>Área</Text>
                    <Text style={styles.detalleValor}>
                      {reservaSeleccionada.Area?.nombre_area}
                    </Text>
                  </View>

                  <View style={styles.detalleSeccion}>
                    <Text style={styles.detalleLabel}>Solicitante</Text>
                    <Text style={styles.detalleValor}>
                      {reservaSeleccionada.Usuario?.nombre}
                    </Text>
                    <Text style={styles.detalleSubvalor}>
                      {reservaSeleccionada.Usuario?.email}
                    </Text>
                  </View>

                  <View style={styles.detalleSeccion}>
                    <Text style={styles.detalleLabel}>Fecha</Text>
                    <Text style={styles.detalleValor}>
                      {formatearFecha(reservaSeleccionada.fecha_reserva)}
                    </Text>
                  </View>

                  <View style={styles.detalleSeccion}>
                    <Text style={styles.detalleLabel}>Horario</Text>
                    <Text style={styles.detalleValor}>
                      {reservaSeleccionada.hora_inicio} - {reservaSeleccionada.hora_fin}
                    </Text>
                  </View>

                  <View style={styles.detalleSeccion}>
                    <Text style={styles.detalleLabel}>Personas</Text>
                    <Text style={styles.detalleValor}>
                      {reservaSeleccionada.personas || 1} persona(s)
                    </Text>
                  </View>

                  {reservaSeleccionada.observaciones && (
                    <View style={styles.detalleSeccion}>
                      <Text style={styles.detalleLabel}>Observaciones</Text>
                      <Text style={styles.detalleValor}>
                        {reservaSeleccionada.observaciones}
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalAcciones}>
                    <TouchableOpacity
                      style={[styles.botonModal, styles.botonModalAceptar]}
                      onPress={() => handleAceptarReserva(reservaSeleccionada.id)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.textoBotonModal}>Confirmar Reserva</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.botonModal, styles.botonModalRechazar]}
                      onPress={() => handleRechazarReserva(reservaSeleccionada.id)}
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                      <Text style={styles.textoBotonModal}>Rechazar Reserva</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Crear Área */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAreaVisible}
        onRequestClose={() => setModalAreaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Nueva Área</Text>
              <TouchableOpacity onPress={() => setModalAreaVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Nombre del Área *</Text>
              <TextInput
                style={styles.input}
                value={nuevaArea.nombre_area}
                onChangeText={(text) =>
                  setNuevaArea({ ...nuevaArea, nombre_area: text })
                }
                placeholder="Ej: Cancha de fútbol"
              />

              <Text style={styles.label}>Capacidad Máxima (Personas) *</Text>
              <TextInput
                style={styles.input}
                value={nuevaArea.maximo_personas}
                onChangeText={(text) =>
                  setNuevaArea({ ...nuevaArea, maximo_personas: text })
                }
                placeholder="Ej: 20"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Costo (Opcional)</Text>
              <TextInput
                style={styles.input}
                value={nuevaArea.costo}
                onChangeText={(text) =>
                  setNuevaArea({ ...nuevaArea, costo: text })
                }
                placeholder="Ej: 50.00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={nuevaArea.observaciones}
                onChangeText={(text) =>
                  setNuevaArea({ ...nuevaArea, observaciones: text })
                }
                placeholder="Notas adicionales sobre el área"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Conjunto *</Text>
              <View style={styles.pickerContainer}>
                {conjuntos.map((conjunto) => (
                  <TouchableOpacity
                    key={conjunto.id}
                    style={[
                      styles.pickerOption,
                      nuevaArea.conjuntoId === conjunto.id && styles.pickerOptionSelected,
                    ]}
                    onPress={() =>
                      setNuevaArea({ ...nuevaArea, conjuntoId: conjunto.id })
                    }
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        nuevaArea.conjuntoId === conjunto.id &&
                          styles.pickerOptionTextSelected,
                      ]}
                    >
                      {conjunto.nombre_conjunto}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.botonCrear}
                onPress={handleCrearArea}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.textoBotonCrear}>Crear Área</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Crear Conjunto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalConjuntoVisible}
        onRequestClose={() => setModalConjuntoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Nuevo Conjunto/Urbanización</Text>
              <TouchableOpacity onPress={() => setModalConjuntoVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Nombre del Conjunto *</Text>
              <TextInput
                style={styles.input}
                value={nuevoConjunto.nombre_conjunto}
                onChangeText={(text) =>
                  setNuevoConjunto({ ...nuevoConjunto, nombre_conjunto: text })
                }
                placeholder="Ej: Urbanización Los Pinos"
              />

              <Text style={styles.label}>Dirección *</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={nuevoConjunto.direccion}
                onChangeText={(text) =>
                  setNuevoConjunto({ ...nuevoConjunto, direccion: text })
                }
                placeholder="Dirección completa"
                multiline
                numberOfLines={2}
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={nuevoConjunto.telefono}
                onChangeText={(text) =>
                  setNuevoConjunto({ ...nuevoConjunto, telefono: text })
                }
                placeholder="Ej: +1234567890"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={nuevoConjunto.email}
                onChangeText={(text) =>
                  setNuevoConjunto({ ...nuevoConjunto, email: text })
                }
                placeholder="email@ejemplo.com"
                keyboardType="email-address"
              />

              <TouchableOpacity
                style={styles.botonCrear}
                onPress={handleCrearConjunto}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.textoBotonCrear}>Crear Conjunto</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitulo: {
    fontSize: 14,
    color: '#e3f2fd',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    position: 'relative',
  },
  tabActivo: {
    borderBottomWidth: 3,
    borderBottomColor: '#4a90e2',
  },
  tabTexto: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  tabTextoActivo: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  contenido: {
    flex: 1,
    padding: 16,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seccionTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeCount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  botonAgregar: {
    padding: 4,
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
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reservaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  reservaInfo: {
    flex: 1,
  },
  reservaArea: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reservaUsuario: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  badgePendiente: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  reservaBody: {
    gap: 8,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  accionesRapidas: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
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
  botonAceptar: {
    backgroundColor: '#4CAF50',
  },
  botonRechazar: {
    backgroundColor: '#F44336',
  },
  textoBotonAccion: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSubtitulo: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  itemDescripcion: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  itemFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  itemDetalle: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  detalleSeccion: {
    marginBottom: 20,
  },
  detalleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detalleValor: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  detalleSubvalor: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalAcciones: {
    gap: 12,
    marginTop: 20,
  },
  botonModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  botonModalAceptar: {
    backgroundColor: '#4CAF50',
  },
  botonModalRechazar: {
    backgroundColor: '#F44336',
  },
  textoBotonModal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    gap: 8,
    marginBottom: 16,
  },
  pickerOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  pickerOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4a90e2',
    borderWidth: 2,
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#4a90e2',
    fontWeight: '600',
  },
  botonCrear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4a90e2',
    gap: 8,
    marginTop: 20,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBotonCrear: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
