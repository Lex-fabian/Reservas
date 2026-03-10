import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { areaService } from '../../services/api';

export default function GestionAreasTab() {
  const navigation = useNavigation();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useFocusEffect(
    useCallback(() => {
      verificarTipoUsuario();
      cargarAreas();
    }, [])
  );

  const verificarTipoUsuario = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        setEsSuperAdmin(usuario.tipo_usuario === 'superadmin');
      }
    } catch (error) {
      console.error('Error verificando tipo de usuario:', error);
    }
  };

  const cargarAreas = async () => {
    try {
      setLoading(true);
      const response = await areaService.obtenerTodas();
      const areasData = response.areas || response || [];
      setAreas(areasData);
    } catch (error) {
      console.error('Error cargando áreas:', error);
      Alert.alert('Error', 'No se pudieron cargar las áreas');
    } finally {
      setLoading(false);
    }
  };

  const eliminarArea = (area) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro que desea eliminar el área "${area.nombre_area}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await areaService.eliminar(area.id);
              Alert.alert('Éxito', 'Área eliminada correctamente');
              cargarAreas();
            } catch (error) {
              console.error('Error al eliminar área:', error);
              Alert.alert('Error', error.response?.data?.error || 'No se pudo eliminar el área');
            }
          }
        }
      ]
    );
  };

  const renderArea = ({ item }) => {
    const hasImageError = imageErrors[item.id];
    
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {item.fotos && !hasImageError ? (
            <Image
              source={{ uri: item.fotos }}
              style={styles.imagenCard}
              resizeMode="cover"
              onError={(error) => {
                console.log('Error cargando imagen:', error.nativeEvent.error);
                setImageErrors(prev => ({ ...prev, [item.id]: true }));
              }}
            />
          ) : (
            <View style={styles.iconContainer}>
              <Icon name="apps" size={24} color="#4a90e2" />
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.nombreText}>{item.nombre_area}</Text>
            <Text style={styles.conjuntoText}>
              {item.Conjunto?.nombre_conjunto || 'Sin conjunto'}
            </Text>
            {item.costo > 0 && (
              <Text style={styles.infoText}>
                <Icon name="cash-outline" size={14} color="#666" /> ${item.costo}
              </Text>
            )}
            {item.maximo_personas > 0 && (
              <Text style={styles.infoText}>
                <Icon name="people-outline" size={14} color="#666" /> Máx. {item.maximo_personas} personas
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.editarBtn}
          onPress={() => navigation.navigate('AreaForm', { areaEditar: item })}
        >
          <Icon name="pencil" size={18} color="#4a90e2" />
        </TouchableOpacity>
        {esSuperAdmin && (
          <TouchableOpacity
            style={styles.eliminarBtn}
            onPress={() => eliminarArea(item)}
          >
            <Icon name="trash-outline" size={20} color="#f44336" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.agregarBtn} 
        onPress={() => navigation.navigate('AreaForm')}
      >
        <Icon name="add-circle" size={20} color="#fff" />
        <Text style={styles.agregarText}>Agregar Área</Text>
      </TouchableOpacity>

      <FlatList
        data={areas}
        renderItem={renderArea}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="apps-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No hay áreas registradas</Text>
          </View>
        }
      />
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
  agregarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    margin: 16,
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  agregarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lista: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  imagenCard: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  cardInfo: {
    flex: 1,
  },
  nombreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  conjuntoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  editarBtn: {
    padding: 8,
  },
  eliminarBtn: {
    padding: 8,
    marginLeft: 8,
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
});
