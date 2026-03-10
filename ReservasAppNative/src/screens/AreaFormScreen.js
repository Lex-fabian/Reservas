import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
  Image,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { areaService, conjuntoService } from '../services/api';

export default function AreaFormScreen({ route, navigation }) {
  const { areaEditar } = route.params || {};
  const [conjuntos, setConjuntos] = useState([]);
  const [conjuntoDropdownVisible, setConjuntoDropdownVisible] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre_area: '',
    conjuntoId: '',
    descripcion: '',
    costo: '',
    maximo_personas: '',
    tiempo_minimo: '',
    observaciones: '',
    fotos: null,
  });

  useEffect(() => {
    cargarConjuntos();
    if (areaEditar) {
      setFormulario({
        nombre_area: areaEditar.nombre_area || '',
        conjuntoId: areaEditar.conjuntoId?.toString() || '',
        descripcion: areaEditar.descripcion || '',
        costo: areaEditar.costo?.toString() || '',
        maximo_personas: areaEditar.maximo_personas?.toString() || '',
        tiempo_minimo: areaEditar.tiempo_minimo?.toString() || '',
        observaciones: areaEditar.observaciones || '',
        fotos: areaEditar.fotos || null,
      });
    }
  }, [areaEditar]);

  const cargarConjuntos = async () => {
    try {
      const response = await conjuntoService.obtenerTodos();
      setConjuntos(response.conjuntos || response || []);
    } catch (error) {
      console.error('Error cargando conjuntos:', error);
    }
  };

  const guardarArea = async () => {
    if (!formulario.nombre_area.trim()) {
      Alert.alert('Error', 'El nombre del área es requerido');
      return;
    }

    if (!formulario.conjuntoId) {
      Alert.alert('Error', 'Debes seleccionar un conjunto');
      return;
    }

    try {
      const data = {
        ...formulario,
        conjuntoId: parseInt(formulario.conjuntoId),
        costo: formulario.costo ? parseFloat(formulario.costo) : 0,
        maximo_personas: formulario.maximo_personas ? parseInt(formulario.maximo_personas) : 0,
        tiempo_minimo: formulario.tiempo_minimo ? parseInt(formulario.tiempo_minimo) : 0,
      };

      if (areaEditar) {
        await areaService.actualizar(areaEditar.id, data);
        Alert.alert('Éxito', 'Área actualizada correctamente');
      } else {
        await areaService.crear(data);
        Alert.alert('Éxito', 'Área creada correctamente');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error guardando área:', error);
      Alert.alert('Error', 'No se pudo guardar el área');
    }
  };

  const seleccionarImagen = () => {
    Alert.alert(
      'Seleccionar Imagen',
      'Elige una opción',
      [
        {
          text: 'Cámara',
          onPress: () => abrirCamara()
        },
        {
          text: 'Galería',
          onPress: () => abrirGaleria()
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const abrirCamara = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'Se necesita permiso de cámara');
          return;
        }
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1200,
        maxHeight: 1200,
        includeBase64: true,
      });

      if (result.assets && result.assets[0]) {
        const base64 = `data:${result.assets[0].type};base64,${result.assets[0].base64}`;
        setFormulario({ ...formulario, fotos: base64 });
      }
    } catch (error) {
      console.error('Error abriendo cámara:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  const abrirGaleria = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1200,
        maxHeight: 1200,
        includeBase64: true,
      });

      if (result.assets && result.assets[0]) {
        const base64 = `data:${result.assets[0].type};base64,${result.assets[0].base64}`;
        setFormulario({ ...formulario, fotos: base64 });
      }
    } catch (error) {
      console.error('Error abriendo galería:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  const eliminarImagen = () => {
    setFormulario({ ...formulario, fotos: null });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4a90e2" />
      
      {/* Header Flotante/Sticky */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {areaEditar ? 'Editar Área' : 'Nueva Área'}
        </Text>
        <TouchableOpacity onPress={guardarArea} style={styles.saveButton}>
          <Text style={styles.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Nombre del Área *</Text>
        <TextInput
          style={styles.input}
          value={formulario.nombre_area}
          onChangeText={(text) => setFormulario({ ...formulario, nombre_area: text })}
          placeholder="Ej: Piscina"
        />

        <Text style={styles.label}>Conjunto *</Text>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => {
            Keyboard.dismiss();
            setConjuntoDropdownVisible(!conjuntoDropdownVisible);
          }}
        >
          <Text style={styles.selectorText}>
            {formulario.conjuntoId 
              ? conjuntos.find(c => c.id.toString() === formulario.conjuntoId)?.nombre_conjunto || 'Seleccionar...'
              : 'Seleccionar conjunto...'}
          </Text>
          <Icon name={conjuntoDropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="#666" />
        </TouchableOpacity>
        
        {conjuntoDropdownVisible && (
          <View style={styles.dropdownList}>
            <ScrollView 
              style={{ maxHeight: 200 }}
              nestedScrollEnabled={true}
            >
              {conjuntos.map((conjunto) => (
                <TouchableOpacity
                  key={conjunto.id}
                  style={[
                    styles.dropdownItem,
                    formulario.conjuntoId === conjunto.id.toString() && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setFormulario({ ...formulario, conjuntoId: conjunto.id.toString() });
                    setConjuntoDropdownVisible(false);
                  }}
                >
                  <Icon 
                    name="business" 
                    size={20} 
                    color={formulario.conjuntoId === conjunto.id.toString() ? '#4a90e2' : '#666'} 
                  />
                  <Text style={[
                    styles.dropdownItemText,
                    formulario.conjuntoId === conjunto.id.toString() && styles.dropdownItemTextSelected
                  ]}>
                    {conjunto.nombre_conjunto}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.label}>Imagen del Área</Text>
        {formulario.fotos ? (
          <View style={styles.imagenContainer}>
            <Image
              source={{ uri: formulario.fotos }}
              style={styles.imagenPreview}
              resizeMode="cover"
            />
            <View style={styles.imagenBotones}>
              <TouchableOpacity
                style={styles.botonCambiarImagen}
                onPress={seleccionarImagen}
              >
                <Icon name="camera" size={16} color="#fff" />
                <Text style={styles.textoBotonImagen}>Cambiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonEliminarImagen}
                onPress={eliminarImagen}
              >
                <Icon name="trash" size={16} color="#fff" />
                <Text style={styles.textoBotonImagen}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.botonSeleccionarImagen}
            onPress={seleccionarImagen}
          >
            <Icon name="camera" size={24} color="#4a90e2" />
            <Text style={styles.textoSeleccionarImagen}>Seleccionar Imagen</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formulario.descripcion}
          onChangeText={(text) => setFormulario({ ...formulario, descripcion: text })}
          placeholder="Descripción del área"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Costo ($)</Text>
        <TextInput
          style={styles.input}
          value={formulario.costo}
          onChangeText={(text) => setFormulario({ ...formulario, costo: text })}
          placeholder="0.00"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Máximo de Personas</Text>
        <TextInput
          style={styles.input}
          value={formulario.maximo_personas}
          onChangeText={(text) => setFormulario({ ...formulario, maximo_personas: text })}
          placeholder="0"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Tiempo Mínimo (horas)</Text>
        <TextInput
          style={styles.input}
          value={formulario.tiempo_minimo}
          onChangeText={(text) => setFormulario({ ...formulario, tiempo_minimo: text })}
          placeholder="0"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Observaciones</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formulario.observaciones}
          onChangeText={(text) => setFormulario({ ...formulario, observaciones: text })}
          placeholder="Observaciones adicionales"
          multiline
          numberOfLines={2}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    backgroundColor: '#4a90e2',
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
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
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
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
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
  imagenContainer: {
    marginBottom: 16,
  },
  imagenPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  imagenBotones: {
    flexDirection: 'row',
    gap: 8,
  },
  botonCambiarImagen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  botonEliminarImagen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  textoBotonImagen: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  botonSeleccionarImagen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    gap: 12,
  },
  textoSeleccionarImagen: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: '600',
  },
});
