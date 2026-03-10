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
import { usuarioService } from '../../services/api';

export default function GestionUsuariosTab() {
  const navigation = useNavigation();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);
  const [tipoUsuarioActual, setTipoUsuarioActual] = useState('');

  useFocusEffect(
    useCallback(() => {
      verificarTipoUsuario();
      cargarDatos();
    }, [])
  );

  const verificarTipoUsuario = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        setEsSuperAdmin(usuario.tipo_usuario === 'superadmin');
        setTipoUsuarioActual(usuario.tipo_usuario);
      }
    } catch (error) {
      console.error('Error verificando tipo de usuario:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const usuariosResponse = await usuarioService.obtenerTodos();
      setUsuarios(usuariosResponse.usuarios || usuariosResponse || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = (usuario) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro que desea eliminar al usuario "${usuario.nombre} ${usuario.apellido}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await usuarioService.eliminar(usuario.id);
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
              cargarDatos();
            } catch (error) {
              console.error('Error al eliminar usuario:', error);
              Alert.alert('Error', error.response?.data?.error || 'No se pudo eliminar el usuario');
            }
          }
        }
      ]
    );
  };

  const renderUsuario = ({ item }) => {
    // Determinar tipo de usuario y colores
    const tipoUsuario = item.tipo_usuario;
    const esSuperAdmin = tipoUsuario === 'superadmin';
    const esAdmin = tipoUsuario === 'admin';
    const esUsuario = tipoUsuario === 'usuario';
    
    // Colores según tipo
    const colorIcono = esSuperAdmin ? '#f44336' : esAdmin ? '#2196F3' : '#4CAF50';
    const colorBorde = esSuperAdmin ? '#f44336' : esAdmin ? '#2196F3' : '#4CAF50';
    const iconoNombre = esSuperAdmin ? 'star' : esAdmin ? 'shield-checkmark' : 'person';
    const textoBadge = esSuperAdmin ? 'SuperAdmin' : esAdmin ? 'Admin' : 'Cliente';
    const colorBadge = esSuperAdmin ? '#ffebee' : esAdmin ? '#e3f2fd' : '#e8f5e9';
    const colorTextoBadge = esSuperAdmin ? '#c62828' : esAdmin ? '#1565c0' : '#2e7d32';
    
    return (
      <View style={[styles.card, { borderLeftColor: colorBorde, borderLeftWidth: 4 }]}>
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: colorIcono + '20' }]}>
            <Icon name={iconoNombre} size={24} color={colorIcono} />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.nombreRow}>
              <Text style={styles.nombreText}>{item.nombre} {item.apellido}</Text>
              <View style={[styles.badge, { backgroundColor: colorBadge }]}>
                <Text style={[styles.badgeText, { color: colorTextoBadge }]}>{textoBadge}</Text>
              </View>
            </View>
            <Text style={styles.infoText}>
              <Icon name="at-outline" size={14} color="#666" /> {item.usuario}
            </Text>
            {item.email && (
              <Text style={styles.infoText}>
                <Icon name="mail-outline" size={14} color="#666" /> {item.email}
              </Text>
            )}
            {item.conjuntos && item.conjuntos.length > 0 && (
              <Text style={styles.infoText}>
                <Icon name="business-outline" size={14} color="#666" /> {item.conjuntos.length} Conjunto(s)
              </Text>
            )}
          </View>
        </View>
        {!(tipoUsuarioActual === 'admin' && item.tipo_usuario === 'superadmin') && (
          <TouchableOpacity
            style={styles.editarBtn}
            onPress={() => navigation.navigate('UsuarioForm', { usuarioEditar: item })}
          >
            <Icon name="pencil" size={18} color="#4a90e2" />
          </TouchableOpacity>
        )}
        {esSuperAdmin && (
          <TouchableOpacity
            style={styles.eliminarBtn}
            onPress={() => eliminarUsuario(item)}
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
        onPress={() => navigation.navigate('UsuarioForm')}
      >
        <Icon name="add-circle" size={20} color="#fff" />
        <Text style={styles.agregarText}>Agregar Usuario</Text>
      </TouchableOpacity>

      <FlatList
        data={usuarios}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No hay usuarios registrados</Text>
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
  iconContainerAdmin: {
    backgroundColor: '#ffebee',
  },
  cardInfo: {
    flex: 1,
  },
  nombreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nombreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
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
