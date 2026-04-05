import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PasswordValidator from '../components/PasswordValidator';
import { APP_CONFIG } from '../config/appConfig';
import type { MainTabsScreenProps } from '../types/navigation';
import type { Usuario } from '../types';
import { authService, usuarioService } from '../services/api';

type Props = MainTabsScreenProps<'Perfil'>;

export default function PerfilScreen({ navigation }: Props) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [contraseñaActual, setContraseñaActual] = useState('');
  const [contraseñaNueva, setContraseñaNueva] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [cargando, setCargando] = useState(false);
  const [passwordValido, setPasswordValido] = useState(false);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const usuarioData = await authService.getUsuario();
      setUsuario(usuarioData);
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              navigation.replace('Login' as any);
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleCambiarContraseña = async () => {
    // Validaciones
    if (!contraseñaActual || !contraseñaNueva || !confirmarContraseña) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (!passwordValido) {
      Alert.alert('Error', 'La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    if (contraseñaNueva !== confirmarContraseña) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await usuarioService.cambiarContraseñaPropia({
        contraseñaActual,
        contraseñaNueva,
      });

      Alert.alert(
        'Éxito',
        'Contraseña actualizada exitosamente. Recibirás un correo de confirmación.',
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setContraseñaActual('');
              setContraseñaNueva('');
              setConfirmarContraseña('');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'No se pudo cambiar la contraseña'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con información del usuario */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.nombre}>{usuario?.nombre || 'Usuario'}</Text>
        <Text style={styles.email}>{usuario?.email || usuario?.usuario || ''}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Sección Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <MenuItem
            icon="key-outline"
            title="Cambiar Contraseña"
            onPress={() => setModalVisible(true)}
          />
          <MenuItem
            icon="person-outline"
            title="Editar Perfil"
            onPress={() => Alert.alert('En Mantenimiento', 'Esta función está en mantenimiento. Pronto estará disponible.')}
          />
        </View>

        {/* Sección Soporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          <MenuItem
            icon="help-circle-outline"
            title="Ayuda"
            onPress={() => {
              const phoneNumber = APP_CONFIG.SUPPORT_WHATSAPP_NUMBER;
              const url = `whatsapp://send?phone=${phoneNumber}`;
              Linking.openURL(url).catch(() => {
                Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.');
              });
            }}
          />
          <MenuItem
            icon="information-circle-outline"
            title="Acerca de"
            onPress={() => Alert.alert(
              'ReservasApp',
              'ReservasApp es una aplicación diseñada para facilitar la gestión y reserva de áreas comunes en conjuntos residenciales.\n\n' +
              '¿Cómo funciona?\n\n' +
              '• Explora las áreas disponibles en tu urbanización\n' +
              '• Selecciona fecha, hora y número de personas\n' +
              '• Confirma tu reserva al instante\n' +
              '• Gestiona tus reservas desde el historial\n' +
              '• Cancela o modifica cuando lo necesites\n\n' +
              'Versión 1.0.0',
              [{ text: 'Entendido' }]
            )}
          />
        </View>

        {/* Cerrar Sesión */}
        <View style={styles.section}>
          <MenuItem
            icon="log-out-outline"
            title="Cerrar Sesión"
            onPress={handleLogout}
            danger
          />
        </View>
      </ScrollView>

      {/* Modal de Cambio de Contraseña */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña Actual</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock-closed-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu contraseña actual"
                    value={contraseñaActual}
                    onChangeText={setContraseñaActual}
                    secureTextEntry
                    editable={!cargando}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nueva Contraseña</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock-closed-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa la nueva contraseña (mínimo 6 caracteres)"
                    value={contraseñaNueva}
                    onChangeText={setContraseñaNueva}
                    secureTextEntry
                    editable={!cargando}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock-closed-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirma la nueva contraseña"
                    value={confirmarContraseña}
                    onChangeText={setConfirmarContraseña}
                    secureTextEntry
                    editable={!cargando}
                  />
                </View>
              </View>

              <PasswordValidator 
                password={contraseñaNueva} 
                onValidChange={setPasswordValido}
              />

              <TouchableOpacity
                style={[styles.submitButton, (cargando || !passwordValido) && styles.submitButtonDisabled]}
                onPress={handleCambiarContraseña}
                disabled={cargando || !passwordValido}
              >
                {cargando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Cambiar Contraseña</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================
// COMPONENTE MENU ITEM
// ============================================

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, danger }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <Icon name={icon} size={24} color={danger ? '#f44336' : '#4a90e2'} />
      <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>
        {title}
      </Text>
    </View>
    <Icon name="chevron-forward" size={20} color="#999" />
  </TouchableOpacity>
);

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a90e2',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuItemTextDanger: {
    color: '#f44336',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
