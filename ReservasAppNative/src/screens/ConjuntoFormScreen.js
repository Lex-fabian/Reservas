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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { conjuntoService } from '../services/api';

export default function ConjuntoFormScreen({ route, navigation }) {
  const { conjuntoEditar } = route.params || {};
  const [estadoDropdownVisible, setEstadoDropdownVisible] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre_conjunto: '',
    direccion: '',
    estado: 'activo',
  });

  useEffect(() => {
    if (conjuntoEditar) {
      setFormulario({
        nombre_conjunto: conjuntoEditar.nombre_conjunto || '',
        direccion: conjuntoEditar.direccion || '',
        estado: conjuntoEditar.estado || 'activo',
      });
    }
  }, [conjuntoEditar]);

  const guardarConjunto = async () => {
    if (!formulario.nombre_conjunto.trim()) {
      Alert.alert('Error', 'El nombre del conjunto es requerido');
      return;
    }

    try {
      const data = {
        nombre_conjunto: formulario.nombre_conjunto,
        direccion: formulario.direccion || null,
        estado: formulario.estado,
      };

      if (conjuntoEditar) {
        await conjuntoService.actualizar(conjuntoEditar.id, data);
        Alert.alert('Éxito', 'Conjunto actualizado correctamente');
      } else {
        await conjuntoService.crear(data);
        Alert.alert('Éxito', 'Conjunto creado correctamente');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error guardando conjunto:', error);
      Alert.alert('Error', 'No se pudo guardar el conjunto');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a90e2" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {conjuntoEditar ? 'Editar Conjunto' : 'Nuevo Conjunto'}
        </Text>
        <TouchableOpacity onPress={guardarConjunto} style={styles.saveButton}>
          <Text style={styles.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <ScrollView 
          style={styles.form}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps='handled'
        >
          <Text style={styles.label}>Nombre del Conjunto *</Text>
          <TextInput
            style={styles.input}
            value={formulario.nombre_conjunto}
            onChangeText={(text) => setFormulario({ ...formulario, nombre_conjunto: text })}
            placeholder="Ej: Conjunto Residencial Los Pinos"
          />

          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formulario.direccion}
            onChangeText={(text) => setFormulario({ ...formulario, direccion: text })}
            placeholder="Dirección completa"
            multiline
            numberOfLines={3}
          />

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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
});
