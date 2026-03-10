import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { reservaService } from '../../services/api';

export default function GestionReservasTab() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendiente');
  const [modalComprobanteVisible, setModalComprobanteVisible] = useState(false);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    cargarReservas();
  }, [filtro]);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const response = await reservaService.obtenerTodas();
      const data = response.reservas || [];
      
      // Debug: ver qué reservas tienen foto_comprobante
      console.log('Total reservas:', data.length);
      const conFoto = data.filter(r => r.foto_comprobante);
      console.log('Reservas con foto_comprobante:', conFoto.length);
      if (conFoto.length > 0) {
        console.log('Ejemplo de foto_comprobante:', conFoto[0].foto_comprobante?.substring(0, 50));
      }
      
      const filtradas = data.filter(r => {
        if (filtro === 'todas') return true;
        return r.estado === filtro;
      });
      setReservas(filtradas.sort((a, b) => 
        new Date(b.fecha_reserva) - new Date(a.fecha_reserva)
      ));
    } catch (error) {
      console.error('Error cargando reservas:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const confirmarReserva = async (id) => {
    try {
      await reservaService.confirmar(id);
      Alert.alert('Éxito', 'Reserva confirmada');
      cargarReservas();
    } catch (error) {
      console.error('Error confirmando reserva:', error);
      Alert.alert('Error', 'No se pudo confirmar la reserva');
    }
  };

  const rechazarReserva = async (id) => {
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
              await reservaService.cancelar(id);
              Alert.alert('Éxito', 'Reserva rechazada');
              cargarReservas();
            } catch (error) {
              console.error('Error rechazando reserva:', error);
              Alert.alert('Error', 'No se pudo rechazar la reserva');
            }
          },
        },
      ]
    );
  };

  const cancelarReserva = async (id) => {
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
              await reservaService.cancelar(id);
              Alert.alert('Éxito', 'Reserva cancelada');
              cargarReservas();
            } catch (error) {
              console.error('Error cancelando reserva:', error);
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
  };

  const verComprobante = (foto) => {
    console.log('Ver comprobante:', foto ? `${foto.substring(0, 50)}...` : 'null');
    setComprobanteSeleccionado(foto);
    setModalComprobanteVisible(true);
  };

  const renderReserva = ({ item }) => {
    const estadoColor = {
      pendiente: '#ff9800',
      confirmada: '#4caf50',
      cancelada: '#f44336',
    };

    const esPendiente = item.estado === 'pendiente';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.areaText}>{item.Area?.nombre_area || 'Área'}</Text>
            <Text style={styles.conjuntoText}>
              {item.Conjunto?.nombre_conjunto || 'Conjunto'}
            </Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: estadoColor[item.estado] }]}>
            <Text style={styles.estadoText}>{item.estado}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.Usuario?.nombre || item.Usuario?.usuario || 'Usuario'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.fecha_reserva}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.hora_inicio} - {item.hora_fin}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="people-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.personas} personas</Text>
          </View>

          {item.foto_comprobante && (
            <TouchableOpacity 
              style={styles.comprobanteButton}
              onPress={() => verComprobante(item.foto_comprobante)}
            >
              <Icon name="image-outline" size={18} color="#4a90e2" />
              <Text style={styles.comprobanteButtonText}>Ver Comprobante de Pago</Text>
              <Icon name="chevron-forward" size={18} color="#4a90e2" />
            </TouchableOpacity>
          )}
        </View>

        {esPendiente && (
          <View style={styles.accionesContainer}>
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonConfirmar]}
              onPress={() => confirmarReserva(item.id)}
            >
              <Icon name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.textoBoton}>Confirmar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonAccion, styles.botonRechazar]}
              onPress={() => rechazarReserva(item.id)}
            >
              <Icon name="close-circle-outline" size={18} color="#fff" />
              <Text style={styles.textoBoton}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.estado === 'confirmada' && (
          <View style={styles.accionesContainer}>
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonCancelar]}
              onPress={() => cancelarReserva(item.id)}
            >
              <Icon name="close-circle-outline" size={18} color="#fff" />
              <Text style={styles.textoBoton}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const FiltroButton = ({ label, valor }) => (
    <TouchableOpacity
      style={[styles.filtroBtn, filtro === valor && styles.filtroBtnActivo]}
      onPress={() => setFiltro(valor)}
    >
      <Text style={[styles.filtroText, filtro === valor && styles.filtroTextActivo]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filtrosContainer}>
        <FiltroButton label="Pendientes" valor="pendiente" />
        <FiltroButton label="Confirmadas" valor="confirmada" />
        <FiltroButton label="Canceladas" valor="cancelada" />
        <FiltroButton label="Todas" valor="todas" />
      </View>

      <FlatList
        data={reservas}
        renderItem={renderReserva}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No hay reservas {filtro !== 'todas' ? filtro + 's' : ''}</Text>
          </View>
        }
      />

      {/* Modal para ver comprobante */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalComprobanteVisible}
        onRequestClose={() => setModalComprobanteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalComprobanteContainer}>
            <View style={styles.modalComprobanteHeader}>
              <Text style={styles.modalComprobanteTitle}>Comprobante de Pago</Text>
              <TouchableOpacity 
                onPress={() => setModalComprobanteVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close-circle" size={32} color="#999" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalComprobanteBody}
              contentContainerStyle={styles.modalComprobanteContent}
              showsVerticalScrollIndicator={false}
            >
              {comprobanteSeleccionado ? (
                <>
                  {imageLoading && (
                    <View style={styles.imageLoaderContainer}>
                      <ActivityIndicator size="large" color="#4a90e2" />
                      <Text style={styles.loadingText}>Cargando imagen...</Text>
                    </View>
                  )}
                  <Image
                    source={{
                      uri: comprobanteSeleccionado.includes('data:')
                        ? comprobanteSeleccionado
                        : `data:image/jpeg;base64,${comprobanteSeleccionado}`,
                    }}
                    style={styles.comprobanteImageFull}
                    resizeMode="contain"
                    onLoadStart={() => {
                      console.log('Iniciando carga de imagen...');
                      setImageLoading(true);
                    }}
                    onLoad={() => {
                      console.log('Imagen cargada exitosamente');
                    }}
                    onLoadEnd={() => {
                      console.log('Carga finalizada');
                      setImageLoading(false);
                    }}
                    onError={(error) => {
                      console.error('Error cargando imagen:', error.nativeEvent);
                      setImageLoading(false);
                      Alert.alert('Error', 'No se pudo cargar la imagen del comprobante. Formato de imagen no válido.');
                    }}
                  />
                </>
              ) : (
                <View style={styles.noImageContainer}>
                  <Icon name="image-outline" size={64} color="#ccc" />
                  <Text style={styles.noImageText}>No hay imagen disponible</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalComprobanteVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  filtrosContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtroBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filtroBtnActivo: {
    backgroundColor: '#4a90e2',
  },
  filtroText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filtroTextActivo: {
    color: '#fff',
  },
  lista: {
    padding: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  areaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  conjuntoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  comprobanteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4a90e2',
    gap: 8,
  },
  comprobanteButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
  },
  accionesContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
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
  botonConfirmar: {
    backgroundColor: '#4caf50',
  },
  botonRechazar: {
    backgroundColor: '#f44336',
  },
  botonCancelar: {
    backgroundColor: '#ff9800',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalComprobanteContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalComprobanteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalComprobanteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalComprobanteBody: {
    maxHeight: 500,
  },
  modalComprobanteContent: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 450,
  },
  comprobanteImageFull: {
    width: '100%',
    height: 450,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  imageLoaderContainer: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4a90e2',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    zIndex: 1,
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noImageText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  modalCloseButton: {
    backgroundColor: '#4a90e2',
    padding: 14,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
