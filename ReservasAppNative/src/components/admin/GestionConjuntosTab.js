import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { conjuntoService } from '../../services/api';

export default function GestionConjuntosTab() {
  const navigation = useNavigation();
  const [conjuntos, setConjuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);

  useFocusEffect(
    useCallback(() => {
      verificarTipoUsuario();
      cargarConjuntos();
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

  const cargarConjuntos = async () => {
    try {
      setLoading(true);
      const response = await conjuntoService.obtenerTodos();
      setConjuntos(response.conjuntos || response || []);
    } catch (error) {
      console.error('Error cargando conjuntos:', error);
      Alert.alert('Error', 'No se pudieron cargar los conjuntos');
    } finally {
      setLoading(false);
    }
  };

  const eliminarConjunto = (conjunto) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro que desea eliminar el conjunto "${conjunto.nombre_conjunto}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await conjuntoService.eliminar(conjunto.id);
              Alert.alert('Éxito', 'Conjunto eliminado correctamente');
              cargarConjuntos();
            } catch (error) {
              console.error('Error al eliminar conjunto:', error);
              Alert.alert('Error', error.response?.data?.error || 'No se pudo eliminar el conjunto');
            }
          }
        }
      ]
    );
  };

  const renderConjunto = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Icon name="business" size={24} color="#4a90e2" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.nombreText}>{item.nombre_conjunto}</Text>
          {item.direccion && (
            <Text style={styles.infoText}>
              <Icon name="location-outline" size={14} color="#666" /> {item.direccion}
            </Text>
          )}
          <View style={styles.estadoContainer}>
            <Icon 
              name={item.estado === 'activo' ? 'checkmark-circle' : 'close-circle'} 
              size={14} 
              color={item.estado === 'activo' ? '#4caf50' : '#f44336'} 
            />
            <Text style={[
              styles.estadoText,
              { color: item.estado === 'activo' ? '#4caf50' : '#f44336' }
            ]}>
              {item.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
      </View>
      {esSuperAdmin && (
        <TouchableOpacity
          style={styles.editarBtn}
          onPress={() => navigation.navigate('ConjuntoForm', { conjuntoEditar: item })}
        >
          <Icon name="pencil" size={18} color="#4a90e2" />
        </TouchableOpacity>
      )}
      {esSuperAdmin && (
        <TouchableOpacity
          style={styles.eliminarBtn}
          onPress={() => eliminarConjunto(item)}
        >
          <Icon name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      )}
    </View>
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
      {esSuperAdmin && (
        <TouchableOpacity 
          style={styles.agregarBtn} 
          onPress={() => navigation.navigate('ConjuntoForm')}
        >
          <Icon name="add-circle" size={20} color="#fff" />
          <Text style={styles.agregarText}>Agregar Conjunto</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={conjuntos}
        renderItem={renderConjunto}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="business-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No hay conjuntos registrados</Text>
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
  cardInfo: {
    flex: 1,
  },
  nombreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
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
