import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reservaService, conjuntoService, areaService } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function ReservasScreen() {
  const router = useRouter();
  const [reservas, setReservas] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [conjuntoSeleccionado, setConjuntoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    cargarUsuario();
    cargarConjuntos();
    cargarAreas();
  }, []);

  const cargarUsuario = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        setNombreUsuario(usuario.nombre || usuario.usuario || 'Usuario');
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
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
      console.log('=== DATOS DE ÁREAS ===');
      console.log('Response completa:', JSON.stringify(response, null, 2));
      console.log('Primera área:', response.areas?.[0]);
      console.log('Fotos primera área:', response.areas?.[0]?.fotos);
      console.log('Tipo de fotos:', typeof response.areas?.[0]?.fotos);
      setAreas(response.areas || response);
    } catch (error) {
      console.error('Error cargando áreas:', error);
    }
  };

  const areasFiltradas = conjuntoSeleccionado === null 
    ? areas 
    : areas.filter(area => area.conjuntoId === conjuntoSeleccionado);

  useFocusEffect(
    useCallback(() => {
      cargarReservas();
    }, [])
  );

  const cargarReservas = async () => {
    try {
      const response = await reservaService.obtenerTodas();
      setReservas(response.reservas);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelar = async (id) => {
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
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: '#FFA500',
      confirmada: '#4CAF50',
      cancelada: '#F44336',
      completada: '#2196F3',
    };
    return colores[estado] || '#999';
  };

  const renderReserva = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.servicio}>{item.servicio}</Text>
        <View style={[styles.badge, { backgroundColor: getEstadoColor(item.estado) }]}>
          <Text style={styles.badgeText}>{item.estado}</Text>
        </View>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.infoText}>📅 {item.fecha}</Text>
        <Text style={styles.infoText}>🕐 {item.hora}</Text>
        <Text style={styles.infoText}>⏱️ {item.duracion} min</Text>
        {item.precio && <Text style={styles.precio}>💰 ${item.precio}</Text>}
      </View>

      {item.notas && (
        <Text style={styles.notas}>Notas: {item.notas}</Text>
      )}

      {item.estado === 'pendiente' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelar(item.id)}
        >
          <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Cargando Áreas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>Hola, {nombreUsuario}</Text>
        <Text style={styles.question}>¿Qué espacio deseas reservar hoy?</Text>
      </View>
      
      <ScrollView>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="location" size={22} color="#4a90e2" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Urbanización</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.conjuntosScroll}
          >
            <TouchableOpacity 
              style={[
                styles.conjuntoCard,
                conjuntoSeleccionado === null && styles.conjuntoCardSelected
              ]}
              onPress={() => setConjuntoSeleccionado(null)}
            >
              <Text style={[
                styles.conjuntoNombre,
                conjuntoSeleccionado === null && styles.conjuntoNombreSelected
              ]}>Todos</Text>
            </TouchableOpacity>
            {conjuntos.map((conjunto) => (
              <TouchableOpacity 
                key={conjunto.id} 
                style={[
                  styles.conjuntoCard,
                  conjuntoSeleccionado === conjunto.id && styles.conjuntoCardSelected
                ]}
                onPress={() => setConjuntoSeleccionado(conjunto.id)}
              >
                <Text style={[
                  styles.conjuntoNombre,
                  conjuntoSeleccionado === conjunto.id && styles.conjuntoNombreSelected
                ]}>{conjunto.nombre_conjunto}</Text>
                {conjunto.ubicacion && (
                  <Text style={[
                    styles.conjuntoUbicacion,
                    conjuntoSeleccionado === conjunto.id && styles.conjuntoUbicacionSelected
                  ]}>{conjunto.ubicacion}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="grid-outline" size={22} color="#4a90e2" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Áreas</Text>
          </View>
          <View style={styles.areasContainer}>
            {areasFiltradas.map((area) => (
              <TouchableOpacity 
                key={area.id} 
                style={styles.areaCard}
                onPress={() => router.push({
                  pathname: '/nueva_reserva',
                  params: { 
                    areaId: area.id,
                    areaNombre: area.nombre_area,
                    areaFoto: area.fotos,
                    areaCosto: area.costo,
                    areaMaxPersonas: area.maximo_personas,
                    areaTiempoMinimo: area.tiempo_minimo,
                    areaObservaciones: area.observaciones || '',
                    conjuntoNombre: area.Conjunto?.nombre_conjunto || 'Sin conjunto',
                  }
                })}
              >
                <View style={styles.areaImageContainer}>
                  {area.fotos ? (
                    <Image 
                      source={{ 
                        uri: area.fotos.includes('data:') 
                          ? area.fotos 
                          : `data:image/jpeg;base64,${area.fotos}` 
                      }} 
                      style={styles.areaImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.log('Error cargando imagen área:', area.nombre_area);
                        console.log('URI de imagen:', area.fotos?.substring(0, 100));
                        console.log('Error:', error.nativeEvent.error);
                      }}
                      onLoad={() => {
                        console.log('✓ Imagen cargada correctamente:', area.nombre_area);
                      }}
                    />
                  ) : (
                    <View style={styles.areaImagePlaceholder}>
                      <Ionicons name="image-outline" size={80} color="#ddd" />
                      <Text style={styles.noImageText}>Sin imagen</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.areaInfoRow}>
                  <View style={styles.areaInfoLeft}>
                    <View style={styles.areaConjuntoRow}>
                      <Ionicons name="location" size={14} color="#999" />
                      <Text style={styles.areaConjunto} numberOfLines={1}>
                        {area.Conjunto?.nombre_conjunto || 'Sin conjunto'}
                      </Text>
                    </View>
                    <Text style={styles.areaNombre} numberOfLines={2}>{area.nombre_area}</Text>
                    {area.observaciones && (
                      <Text style={styles.areaDescripcion} numberOfLines={2}>
                        {area.observaciones}
                      </Text>
                    )}
                    <View style={styles.areaPersonas}>
                      <Ionicons name="people" size={16} color="#999" />
                      <Text style={styles.areaPersonasText}>Capacidad: {area.maximo_personas} personas</Text>
                    </View>
                  </View>
                  
                  <View style={styles.areaInfoRight}>
                    <Text style={styles.areaCosto}>${area.costo}/h</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  question: {
    fontSize: 16,
    color: '#000',
    opacity: 0.7,
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginTop: 5,
  },
  areaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  areaImageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#e0e0e0',
  },
  areaImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  areaImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '500',
  },
  areaInfoRow: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  areaInfoLeft: {
    flex: 1,
    paddingRight: 8,
  },
  areaConjuntoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  areaConjunto: {
    fontSize: 11,
    color: '#999',
    fontWeight: '400',
    marginLeft: 3,
  },
  areaNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 3,
    lineHeight: 20,
  },
  areaDescripcion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 16,
  },
  areaPersonas: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  areaPersonasText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 5,
  },
  areaInfoRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  areaCosto: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4a90e2',
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 15,
  },
  conjuntosScroll: {
    marginHorizontal: -5,
  },
  conjuntoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    minWidth: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  conjuntoCardSelected: {
    backgroundColor: '#4a90e2',
  },
  conjuntoNombre: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  conjuntoNombreSelected: {
    color: '#fff',
  },
  conjuntoUbicacion: {
    fontSize: 11,
    color: '#999',
  },
  conjuntoUbicacionSelected: {
    color: '#fff',
    opacity: 0.9,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '500',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  servicio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  info: {
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  precio: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 5,
  },
  notas: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F44336',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
});
