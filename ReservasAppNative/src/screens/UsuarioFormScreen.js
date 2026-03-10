import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Linking,
  Alert,
  StatusBar,
  Modal,
  Clipboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { usuarioService, conjuntoService } from '../services/api.ts';

export default function UsuarioFormScreen({ navigation, route }) {
  const { usuarioEditar } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  
  const [conjuntos, setConjuntos] = useState([]);
  const [tipoUsuarioDropdownVisible, setTipoUsuarioDropdownVisible] = useState(false);
  const [conjuntoDropdownVisible, setConjuntoDropdownVisible] = useState(false);
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);
  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);
  const [passwordGenerada, setPasswordGenerada] = useState('');
  
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    usuario: '',
    contraseña: '',
    tipo_usuario: 'usuario',
    estado: 'activo',
    conjuntos: [],
  });

  useEffect(() => {
    verificarTipoUsuario();
    cargarConjuntos();
    if (usuarioEditar) {
      cargarDatosUsuario(usuarioEditar);
    }
  }, [usuarioEditar]);

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
      const response = await conjuntoService.obtenerTodos();
      setConjuntos(response.conjuntos || response || []);
    } catch (error) {
      console.error('Error cargando conjuntos:', error);
      Alert.alert('Error', 'No se pudieron cargar los conjuntos');
    }
  };

  const cargarDatosUsuario = (usuario) => {
    navigation.setOptions({ title: 'Editar Usuario' });
    
    // Extraer IDs de conjuntos
    const conjuntosIds = usuario.conjuntos 
      ? usuario.conjuntos.map(c => typeof c === 'object' ? c.id : c)
      : [];
    
    setFormulario({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      cedula: usuario.cedula || '',
      usuario: usuario.usuario || '',
      contraseña: '',
      tipo_usuario: usuario.tipo_usuario || 'usuario',
      estado: usuario.estado || 'activo',
      conjuntos: conjuntosIds,
    });
  };

  const compartirWhatsApp = (usuarioData, contrasena) => {
    const mensaje = `Hola ${usuarioData.nombre}, bienvenido a ReservasApp.
Tus credenciales de acceso son:

Usuario: *${usuarioData.usuario}*
Contraseña: *${contrasena}*

Por favor, cambia tu contraseña al ingresar.`;

    // Usar https://api.whatsapp.com/send para mejor compatibilidad en Android
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    
    Linking.openURL(url).catch(err => {
      console.error('Error al abrir WhatsApp:', err);
      Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de que esté instalado.');
    });
  };

  const guardarUsuario = async () => {
    if (!formulario.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!formulario.apellido.trim()) {
      Alert.alert('Error', 'El apellido es requerido');
      return;
    }

    if (!formulario.email.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return;
    }

    if (!formulario.usuario.trim()) {
      Alert.alert('Error', 'El usuario es requerido');
      return;
    }

    // RBAC: Admin no puede crear SuperAdmin o Admin
    if (!esSuperAdmin && (formulario.tipo_usuario === 'admin' || formulario.tipo_usuario === 'superadmin')) {
        Alert.alert('Acceso Denegado', 'No tienes permisos para crear este tipo de usuario');
        return;
    }

    setLoading(true);
    try {
      const data = {
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        email: formulario.email,
        telefono: formulario.telefono || null,
        cedula: formulario.cedula || null,
        usuario: formulario.usuario,
        tipo_usuario: formulario.tipo_usuario,
        estado: formulario.estado,
        conjuntos: formulario.conjuntos || [],
      };

      // Solo incluir contraseña en modo edición si se proporcionó
      if (usuarioEditar && formulario.contraseña) {
        data.contraseña = formulario.contraseña;
      }
      // En modo crear NO enviamos contraseña (se genera automáticamente)

      let response;
      if (usuarioEditar) {
        response = await usuarioService.actualizar(usuarioEditar.id, data);
        
        // Si se cambió la contraseña, ofrecer compartir por WhatsApp
        if (formulario.contraseña && formulario.contraseña.trim() !== '') {
          Alert.alert(
            'Usuario Actualizado',
            'La contraseña ha sido cambiada. ¿Deseas compartir las nuevas credenciales via WhatsApp?',
            [
              { text: 'No', onPress: () => navigation.goBack() },
              { 
                text: 'Sí, compartir', 
                onPress: () => {
                  compartirWhatsApp(data, formulario.contraseña);
                  navigation.goBack();
                }
              }
            ]
          );
        } else {
          Alert.alert('Éxito', 'Usuario actualizado correctamente', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      } else {
        response = await usuarioService.crear(data);
        
        // Backend devuelve contraseñaTemporal
        if (response.contraseñaTemporal) {
          setPasswordGenerada(response.contraseñaTemporal);
          setModalPasswordVisible(true);
        } else {
          Alert.alert('Éxito', 'Usuario creado correctamente', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
      Alert.alert('Error', error.response?.data?.message || error.response?.data?.error || 'No se pudo guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4a90e2" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {usuarioEditar ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Text>
        <TouchableOpacity onPress={guardarUsuario} style={styles.saveButton} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={formulario.nombre}
          onChangeText={(text) => setFormulario({ ...formulario, nombre: text })}
          placeholder="Ej: Juan"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Apellido *</Text>
        <TextInput
          style={styles.input}
          value={formulario.apellido}
          onChangeText={(text) => setFormulario({ ...formulario, apellido: text })}
          placeholder="Ej: Pérez"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formulario.email}
          onChangeText={(text) => setFormulario({ ...formulario, email: text })}
          placeholder="Ej: juan@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Cédula</Text>
        <TextInput
          style={styles.input}
          value={formulario.cedula}
          onChangeText={(text) => setFormulario({ ...formulario, cedula: text })}
          placeholder="Ej: 1234567890"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={formulario.telefono}
          onChangeText={(text) => setFormulario({ ...formulario, telefono: text })}
          placeholder="Ej: +593999999999"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Usuario *</Text>
        <TextInput
          style={styles.input}
          value={formulario.usuario}
          onChangeText={(text) => setFormulario({ ...formulario, usuario: text })}
          placeholder="Ej: juanperez"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />

        {/* Solo mostrar campo de contraseña en modo edición */}
        {usuarioEditar && (
          <>
            <Text style={styles.label}>
              Contraseña (dejar vacío para no cambiar)
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formulario.contraseña}
                onChangeText={(text) => setFormulario({ ...formulario, contraseña: text })}
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry={!mostrarContraseña}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setMostrarContraseña(!mostrarContraseña)}
              >
                <Icon 
                  name={mostrarContraseña ? 'eye-off' : 'eye'} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Info cuando está creando */}
        {!usuarioEditar && (
          <View style={styles.infoBox}>
            <Icon name="information-circle" size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              La contraseña se generará automáticamente y se mostrará después de crear el usuario.
            </Text>
          </View>
        )}

        <Text style={styles.label}>Tipo de Usuario *</Text>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => {
            Keyboard.dismiss();
            setTipoUsuarioDropdownVisible(!tipoUsuarioDropdownVisible);
          }}
        >
          <Text style={styles.selectorText}>
            {formulario.tipo_usuario === 'superadmin' ? 'Super Administrador' : 
             formulario.tipo_usuario === 'admin' ? 'Administrador' : 'Usuario'}
          </Text>
          <Icon 
            name={tipoUsuarioDropdownVisible ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {tipoUsuarioDropdownVisible && (
          <View style={styles.dropdownList}>
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                formulario.tipo_usuario === 'usuario' && styles.dropdownItemSelected
              ]}
              onPress={() => {
                setFormulario({ ...formulario, tipo_usuario: 'usuario' });
                setTipoUsuarioDropdownVisible(false);
              }}
            >
              <Icon 
                name="person" 
                size={20} 
                color={formulario.tipo_usuario === 'usuario' ? '#4a90e2' : '#666'} 
              />
              <Text style={[
                styles.dropdownItemText,
                formulario.tipo_usuario === 'usuario' && styles.dropdownItemTextSelected
              ]}>
                Usuario
              </Text>
            </TouchableOpacity>

            {esSuperAdmin && (
              <>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  formulario.tipo_usuario === 'admin' && styles.dropdownItemSelected
                ]}
                onPress={() => {
                  setFormulario({ ...formulario, tipo_usuario: 'admin' });
                  setTipoUsuarioDropdownVisible(false);
                }}
              >
                <Icon 
                  name="shield-checkmark" 
                  size={20} 
                  color={formulario.tipo_usuario === 'admin' ? '#4a90e2' : '#666'} 
                />
                <Text style={[
                  styles.dropdownItemText,
                  formulario.tipo_usuario === 'admin' && styles.dropdownItemTextSelected
                ]}>
                  Administrador
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  formulario.tipo_usuario === 'superadmin' && styles.dropdownItemSelected
                ]}
                onPress={() => {
                  setFormulario({ ...formulario, tipo_usuario: 'superadmin' });
                  setTipoUsuarioDropdownVisible(false);
                }}
              >
                <Icon 
                  name="star" 
                  size={20} 
                  color={formulario.tipo_usuario === 'superadmin' ? '#4a90e2' : '#666'} 
                />
                <Text style={[
                  styles.dropdownItemText,
                  formulario.tipo_usuario === 'superadmin' && styles.dropdownItemTextSelected
                ]}>
                  Super Administrador
                </Text>
              </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <Text style={styles.label}>Estado *</Text>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => {
            Keyboard.dismiss();
            const newEstado = formulario.estado === 'activo' ? 'inactivo' : 'activo';
            setFormulario({ ...formulario, estado: newEstado });
          }}
        >
          <Text style={styles.selectorText}>
            {formulario.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </Text>
          <Icon 
            name={formulario.estado === 'activo' ? 'checkmark-circle' : 'close-circle'} 
            size={20} 
            color={formulario.estado === 'activo' ? '#4caf50' : '#f44336'} 
          />
        </TouchableOpacity>

        <Text style={styles.label}>Conjuntos</Text>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => {
            Keyboard.dismiss();
            setConjuntoDropdownVisible(!conjuntoDropdownVisible);
          }}
        >
          <Text style={styles.selectorText}>
            {formulario.conjuntos.length > 0
              ? `${formulario.conjuntos.length} conjunto${formulario.conjuntos.length > 1 ? 's' : ''} seleccionado${formulario.conjuntos.length > 1 ? 's' : ''}`
              : 'Sin conjuntos asignados'}
          </Text>
          <Icon 
            name={conjuntoDropdownVisible ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>

        {conjuntoDropdownVisible && (
          <View style={styles.dropdownList}>
            <ScrollView 
              style={{ maxHeight: 200 }}
              nestedScrollEnabled={true}
            >
              {conjuntos.map((conjunto) => {
                const isSelected = formulario.conjuntos.includes(conjunto.id);
                return (
                  <TouchableOpacity
                    key={conjunto.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      const newConjuntos = isSelected
                        ? formulario.conjuntos.filter(id => id !== conjunto.id)
                        : [...formulario.conjuntos, conjunto.id];
                      setFormulario({ ...formulario, conjuntos: newConjuntos });
                    }}
                  >
                    <Icon 
                      name={isSelected ? "checkbox" : "square-outline"} 
                      size={24} 
                      color={isSelected ? '#4a90e2' : '#666'} 
                    />
                    <Icon 
                      name="business" 
                      size={20} 
                      color={isSelected ? '#4a90e2' : '#666'} 
                    />
                    <Text style={[
                      styles.dropdownItemText,
                      isSelected && styles.dropdownItemTextSelected
                    ]}>
                      {conjunto.nombre_conjunto}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Modal de Contraseña Generada */}
      <Modal
        visible={modalPasswordVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalPasswordVisible(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Icon name="checkmark-circle" size={48} color="#4caf50" />
              <Text style={styles.modalTitulo}>Usuario Creado</Text>
            </View>

            <View style={styles.modalAlerta}>
              <Icon name="key" size={20} color="#2563eb" />
              <Text style={styles.modalAlertaTexto}>
                Contraseña generada automáticamente. Guárdala en un lugar seguro.
              </Text>
            </View>

            <View style={styles.credencialesContainer}>
              <View style={styles.credencialItem}>
                <Text style={styles.credencialLabel}>Usuario:</Text>
                <View style={styles.credencialValor}>
                  <Text style={styles.credencialTexto}>{formulario.usuario}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Clipboard.setString(formulario.usuario);
                      Alert.alert('Éxito', 'Usuario copiado al portapapeles');
                    }}
                  >
                    <Icon name="copy-outline" size={20} color="#4a90e2" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.credencialItem}>
                <Text style={styles.credencialLabel}>Contraseña Temporal:</Text>
                <View style={styles.credencialValor}>
                  <Text style={styles.credencialTexto}>{passwordGenerada}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Clipboard.setString(passwordGenerada);
                      Alert.alert('Éxito', 'Contraseña copiada al portapapeles');
                    }}
                  >
                    <Icon name="copy-outline" size={20} color="#4a90e2" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalWarning}>
              <Icon name="warning" size={18} color="#ff9800" />
              <Text style={styles.modalWarningTexto}>
                El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
              </Text>
            </View>

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={[styles.modalBoton, styles.modalBotonSecundario]}
                onPress={() => {
                  compartirWhatsApp(formulario, passwordGenerada);
                }}
              >
                <Icon name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={styles.modalBotonTextoSecundario}>Compartir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBoton, styles.modalBotonPrimario]}
                onPress={() => {
                  setModalPasswordVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalBotonTextoPrimario}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a90e2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
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
    backgroundColor: '#fff',
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    padding: 12,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#4a90e2',
  },
  guardarBtn: {
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  guardarBtnDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  guardarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
  },
  modalAlerta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  modalAlertaTexto: {
    flex: 1,
    color: '#1565c0',
    fontSize: 14,
    lineHeight: 20,
  },
  credencialesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  credencialItem: {
    marginBottom: 16,
  },
  credencialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  credencialValor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  credencialTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  modalWarningTexto: {
    flex: 1,
    color: '#856404',
    fontSize: 13,
    lineHeight: 18,
  },
  modalBotones: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBoton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 6,
  },
  modalBotonPrimario: {
    backgroundColor: '#4a90e2',
  },
  modalBotonSecundario: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#25D366',
  },
  modalBotonTextoPrimario: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBotonTextoSecundario: {
    color: '#25D366',
    fontSize: 16,
    fontWeight: '600',
  },
});
