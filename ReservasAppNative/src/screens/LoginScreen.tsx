import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  Keyboard,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PasswordValidator from '../components/PasswordValidator';
import type { RootStackScreenProps } from '../types/navigation';
import { authService, usuarioService } from '../services/api';
import logo from '../assets/icono.jpeg';

type Props = RootStackScreenProps<'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [modalCambioPasswordVisible, setModalCambioPasswordVisible] = useState(false);
  
  const animacionOpacidad = useRef(new Animated.Value(0)).current;
  const animacionDeslizamiento = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    iniciarAnimacionesEntrada();
  }, []);

  const iniciarAnimacionesEntrada = () => {
    Animated.parallel([
      Animated.timing(animacionOpacidad, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(animacionDeslizamiento, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const manejarInicioSesion = async () => {
    Keyboard.dismiss();
    
    if (!usuario || !contrasena) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }

    setCargando(true);
    
    try {
      const response = await authService.login(usuario, contrasena);
      
      // NUEVO: Verificar si debe cambiar contraseña
      if (response.debe_cambiar_password) {
        setModalCambioPasswordVisible(true);
        setCargando(false);
        return;
      }
      
      const tipoUsuario = response.usuario?.tipo_usuario?.toLowerCase();
      const esAdmin = tipoUsuario === 'admin' || tipoUsuario === 'superadmin';
      
      navigation.replace('MainTabs', { esAdmin });
    } catch (error: any) {
      console.error('Error en login:', error);
      const mensaje = error.response?.data?.mensaje || 'Error al iniciar sesión';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  const handleCambioPasswordExitoso = async () => {
    setModalCambioPasswordVisible(false);
    
    // Obtener usuario actualizado y navegar
    try {
      const usuarioData = await authService.getUsuario();
      const tipoUsuario = usuarioData?.tipo_usuario?.toLowerCase();
      const esAdmin = tipoUsuario === 'admin' || tipoUsuario === 'superadmin';
      
      navigation.replace('MainTabs', { esAdmin });
    } catch (error) {
      navigation.replace('MainTabs', { esAdmin: false });
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#4a90e2" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contenedor}
      >
        <ScrollView 
          contentContainerStyle={styles.contenidoScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.encabezado,
              {
                opacity: animacionOpacidad,
                transform: [{ translateY: animacionDeslizamiento }]
              }
            ]}
          >
            <View style={styles.contenedorIcono}>
              <Image source={logo} style={styles.logoImagen} />
            </View>
            <Text style={styles.titulo}>ReservasApp</Text>
            <Text style={styles.subtitulo}>Bienvenido de nuevo</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.contenedorFormulario,
              {
                opacity: animacionOpacidad,
                transform: [{ translateY: animacionDeslizamiento }]
              }
            ]}
          >
            <CampoUsuario 
              valor={usuario}
              alCambiar={setUsuario}
              deshabilitado={cargando}
            />

            <CampoContrasena 
              valor={contrasena}
              alCambiar={setContrasena}
              deshabilitado={cargando}
              mostrar={mostrarContrasena}
              alAlternarVisibilidad={() => setMostrarContrasena(!mostrarContrasena)}
              alEnviar={manejarInicioSesion}
            />

            <BotonInicioSesion 
              alPresionar={manejarInicioSesion}
              deshabilitado={cargando}
              cargando={cargando}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* NUEVO: Modal de cambio de contraseña obligatorio */}
      <ModalCambioPasswordObligatorio
        visible={modalCambioPasswordVisible}
        contrasenaActual={contrasena}
        onExito={handleCambioPasswordExitoso}
        onCancelar={() => {
          setModalCambioPasswordVisible(false);
          authService.logout();
        }}
      />
    </>
  );
}

// ============================================
// COMPONENTES
// ============================================

interface CampoUsuarioProps {
  valor: string;
  alCambiar: (texto: string) => void;
  deshabilitado?: boolean;
}

const CampoUsuario: React.FC<CampoUsuarioProps> = ({ valor, alCambiar, deshabilitado }) => {
  return (
    <View style={styles.contenedorInput}>
      <View style={styles.inputContenedor}>
        <Icon name="person-outline" size={20} color="#666" style={styles.iconoInput} />
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#999"
          value={valor}
          onChangeText={alCambiar}
          autoCapitalize="none"
          editable={!deshabilitado}
          autoComplete="username"
          returnKeyType="next"
        />
      </View>
    </View>
  );
};

interface CampoContrasenaProps {
  valor: string;
  alCambiar: (texto: string) => void;
  deshabilitado?: boolean;
  mostrar: boolean;
  alAlternarVisibilidad: () => void;
  alEnviar: () => void;
}

const CampoContrasena: React.FC<CampoContrasenaProps> = ({ 
  valor, 
  alCambiar, 
  deshabilitado, 
  mostrar, 
  alAlternarVisibilidad,
  alEnviar 
}) => {
  const iconoOjo = mostrar ? "eye-off-outline" : "eye-outline";
  
  return (
    <View style={styles.contenedorInput}>
      <View style={styles.inputContenedor}>
        <Icon name="lock-closed-outline" size={20} color="#666" style={styles.iconoInput} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={valor}
          onChangeText={alCambiar}
          secureTextEntry={!mostrar}
          editable={!deshabilitado}
          autoCapitalize="none"
          autoComplete="password"
          returnKeyType="go"
          onSubmitEditing={alEnviar}
        />
        <TouchableOpacity 
          onPress={alAlternarVisibilidad}
          style={styles.iconoOjo}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name={iconoOjo} size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface BotonInicioSesionProps {
  alPresionar: () => void;
  deshabilitado: boolean;
  cargando: boolean;
}

const BotonInicioSesion: React.FC<BotonInicioSesionProps> = ({ alPresionar, deshabilitado, cargando }) => {
  return (
    <TouchableOpacity
      style={[
        styles.boton,
        deshabilitado && styles.botonDeshabilitado
      ]}
      onPress={alPresionar}
      disabled={deshabilitado}
      activeOpacity={0.8}
    >
      {cargando ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Text style={styles.textoBoton}>Iniciar Sesión</Text>
          <Icon name="arrow-forward" size={20} color="#fff" style={styles.iconoBoton} />
        </>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// MODAL CAMBIO PASSWORD OBLIGATORIO
// ============================================

interface ModalCambioPasswordObligatorioProps {
  visible: boolean;
  contrasenaActual: string;
  onExito: () => void;
  onCancelar: () => void;
}

const ModalCambioPasswordObligatorio: React.FC<ModalCambioPasswordObligatorioProps> = ({
  visible,
  contrasenaActual,
  onExito,
  onCancelar,
}) => {
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [passwordValido, setPasswordValido] = useState(false);

  const handleCambiar = async () => {
    if (!contrasenaNueva || !confirmarContrasena) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (!passwordValido) {
      Alert.alert('Error', 'La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    if (contrasenaNueva !== confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await usuarioService.cambiarPasswordObligatoria({
        contraseñaActual,
        contraseñaNueva,
      });

      Alert.alert('Éxito', 'Contraseña cambiada exitosamente', [
        { text: 'OK', onPress: onExito }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancelar}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Icon name="lock-closed" size={32} color="#f44336" />
            <Text style={styles.modalTitulo}>Cambio de Contraseña Obligatorio</Text>
          </View>

          <View style={styles.modalAlerta}>
            <Icon name="warning" size={20} color="#ff9800" />
            <Text style={styles.modalAlertaTexto}>
              Por seguridad, debes cambiar tu contraseña temporal
            </Text>
          </View>

          <View style={styles.modalForm}>
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Nueva Contraseña *</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#999"
                  value={contrasenaNueva}
                  onChangeText={setContrasenaNueva}
                  secureTextEntry={!mostrarNueva}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setMostrarNueva(!mostrarNueva)}>
                  <Icon name={mostrarNueva ? "eye-off" : "eye"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Confirmar Nueva Contraseña *</Text>
              <View style={styles.modalInputWrapper}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Repite la nueva contraseña"
                  placeholderTextColor="#999"
                  value={confirmarContrasena}
                  onChangeText={setConfirmarContrasena}
                  secureTextEntry={!mostrarConfirmar}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
                  <Icon name={mostrarConfirmar ? "eye-off" : "eye"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <PasswordValidator 
            password={contrasenaNueva} 
            onValidChange={setPasswordValido}
          />

          <TouchableOpacity
            style={[styles.modalBoton, (cargando || !passwordValido) && styles.modalBotonDeshabilitado]}
            onPress={handleCambiar}
            disabled={cargando || !passwordValido}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.modalBotonTexto}>Cambiar Contraseña</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#4a90e2',
  },
  contenidoScroll: {
    flexGrow: 1,
  },
  encabezado: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#4a90e2',
  },
  contenedorIcono: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoImagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  contenedorFormulario: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  contenedorInput: {
    marginBottom: 16,
  },
  inputContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconoInput: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  iconoOjo: {
    padding: 4,
  },
  boton: {
    backgroundColor: '#4a90e2',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  iconoBoton: {
    marginLeft: 8,
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
    marginBottom: 16,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  modalAlerta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalAlertaTexto: {
    flex: 1,
    marginLeft: 10,
    color: '#856404',
    fontSize: 14,
  },
  modalForm: {
    marginBottom: 20,
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  modalInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  modalBoton: {
    backgroundColor: '#4a90e2',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBotonDeshabilitado: {
    backgroundColor: '#ccc',
  },
  modalBotonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
