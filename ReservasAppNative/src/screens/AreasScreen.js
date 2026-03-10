import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ScrollView,
  StatusBar,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { conjuntoService, areaService } from '../services/api';

export default function AreasScreen({ navigation }) {
  const [conjuntos, setConjuntos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [conjuntoSeleccionado, setConjuntoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    cargarUsuario();
  }, []);

  useEffect(() => {
    if (usuario) {
      cargarConjuntos();
      cargarAreas();
    }
  }, [usuario]);

  const cargarUsuario = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      if (usuarioStr) {
        const usuarioData = JSON.parse(usuarioStr);
        setUsuario(usuarioData);
        setNombreUsuario(usuarioData.nombre || usuarioData.usuario || 'Usuario');
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  const cargarConjuntos = async () => {
    try {
      const response = await conjuntoService.obtenerTodos();
      const todosConjuntos = response.conjuntos || response;
      
      // Filtrar conjuntos según los asignados al usuario
      if (usuario && usuario.tipo_usuario === 'usuario' && usuario.conjuntos && usuario.conjuntos.length > 0) {
        const idsConjuntosUsuario = usuario.conjuntos.map(c => c.id);
        const conjuntosFiltrados = todosConjuntos.filter(c => idsConjuntosUsuario.includes(c.id));
        setConjuntos(conjuntosFiltrados);
      } else {
        // Admin y superadmin ven todos los conjuntos
        setConjuntos(todosConjuntos);
      }
    } catch (error) {
      console.error('Error cargando conjuntos:', error);
    }
  };

  const cargarAreas = async () => {
    try {
      const response = await areaService.obtenerTodas();
      const todasAreas = response.areas || response;
      
      // Filtrar áreas según los conjuntos del usuario
      if (usuario && usuario.tipo_usuario === 'usuario' && usuario.conjuntos && usuario.conjuntos.length > 0) {
        const idsConjuntosUsuario = usuario.conjuntos.map(c => c.id);
        const areasFiltradas = todasAreas.filter(area => idsConjuntosUsuario.includes(area.conjuntoId));
        setAreas(areasFiltradas);
      } else {
        // Admin y superadmin ven todas las áreas
        setAreas(todasAreas);
      }
    } catch (error) {
      console.error('Error cargando áreas:', error);
      Alert.alert('Error', 'No se pudieron cargar las áreas');
    } finally {
      setLoading(false);
      setRefreshing(false);
      // Animar entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const areasFiltradas = areas.filter(area => {
    // Filtro por conjunto
    const cumpleConjunto = conjuntoSeleccionado === null || area.conjuntoId === conjuntoSeleccionado;
    
    // Filtro por búsqueda
    const terminoBusqueda = busqueda.toLowerCase();
    const nombreArea = (area.nombre_area || '').toLowerCase();
    const observaciones = (area.observaciones || '').toLowerCase();
    const cumpleBusqueda = !busqueda || nombreArea.includes(terminoBusqueda) || observaciones.includes(terminoBusqueda);
    
    return cumpleConjunto && cumpleBusqueda;
  });

  const onRefresh = () => {
    setRefreshing(true);
    cargarAreas();
    cargarConjuntos();
  };

  const handleSelectArea = (area) => {
    // Navegar a la pantalla de nueva reserva con el área seleccionada
    navigation.navigate('NuevaReserva', { area });
  };

  const renderArea = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity 
        style={styles.areaCard}
        onPress={() => handleSelectArea(item)}
        activeOpacity={0.7}
      >
      <View style={styles.areaImageContainer}>
        {item.fotos ? (
          <Image 
            source={{ 
              uri: item.fotos.includes('data:') 
                ? item.fotos 
                : `data:image/jpeg;base64,${item.fotos}` 
            }} 
            style={styles.areaImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.areaImagePlaceholder}>
            <Icon name="image-outline" size={80} color="#ddd" />
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}
      </View>
      
      <View style={styles.areaInfoRow}>
        <View style={styles.areaInfoLeft}>
          <View style={styles.areaConjuntoRow}>
            <Icon name="location" size={14} color="#999" />
            <Text style={styles.areaConjunto} numberOfLines={1}>
              {item.Conjunto?.nombre_conjunto || 'Sin conjunto'}
            </Text>
          </View>
          <Text style={styles.areaNombre} numberOfLines={2}>{item.nombre_area}</Text>
          {item.observaciones && (
            <Text style={styles.areaDescripcion} numberOfLines={2}>
              {item.observaciones}
            </Text>
          )}
          <View style={styles.areaPersonas}>
            <Icon name="people" size={16} color="#999" />
            <Text style={styles.areaPersonasText}>Capacidad: {item.maximo_personas} personas</Text>
          </View>
        </View>
        
        <View style={styles.areaInfoRight}>
          <Text style={styles.areaCosto}>${item.costo}/h</Text>
        </View>
      </View>
    </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {nombreUsuario}</Text>
        <Text style={styles.subtitle}>¿Qué espacio deseas reservar hoy?</Text>
        
        {/* Búsqueda */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar área..."
            placeholderTextColor="#999"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {conjuntos.length > 0 && (
        <View>
          <Text style={styles.seccionTitulo}>Urbanizaciones</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
          <TouchableOpacity
            style={[
              styles.filterButton,
              conjuntoSeleccionado === null && styles.filterButtonActive
            ]}
            onPress={() => setConjuntoSeleccionado(null)}
          >
            <Text style={[
              styles.filterButtonText,
              conjuntoSeleccionado === null && styles.filterButtonTextActive
            ]}>
              Todas
            </Text>
          </TouchableOpacity>
          {conjuntos.map((conjunto) => (
            <TouchableOpacity
              key={conjunto.id}
              style={[
                styles.filterButton,
                conjuntoSeleccionado === conjunto.id && styles.filterButtonActive
              ]}
              onPress={() => setConjuntoSeleccionado(conjunto.id)}
            >
              <Text style={[
                styles.filterButtonText,
                conjuntoSeleccionado === conjunto.id && styles.filterButtonTextActive
              ]}>
                {conjunto.nombre_conjunto}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        </View>
      )}

      <Text style={styles.seccionTitulo}>Tipo de espacio</Text>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <FlatList
          data={areasFiltradas}
          renderItem={renderArea}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4a90e2']}
              tintColor="#4a90e2"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name={busqueda ? "search-outline" : "file-tray-outline"} size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {busqueda ? `No se encontraron áreas con "${busqueda}"` : 'No hay áreas disponibles'}
              </Text>
              {busqueda && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setBusqueda('')}
                >
                  <Text style={styles.clearButtonText}>Limpiar búsqueda</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

// Componente Loading Skeleton
const LoadingSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.listContent}>
      {[1, 2, 3].map((item) => (
        <Animated.View key={item} style={[styles.skeletonCard, { opacity }]}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '60%' }]} />
            <View style={[styles.skeletonLine, { width: '80%', marginTop: 8 }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#4a90e2',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  clearButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4a90e2',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  // Loading Skeleton
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  skeletonImage: {
    width: '100%',
    height: 320,
    backgroundColor: '#e0e0e0',
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 8,
  },
});
