import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { reservaService } from '../../services/api';

export default function NuevaReservaScreen() {
  const router = useRouter();
  const [servicio, setServicio] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [duracion, setDuracion] = useState('60');
  const [notas, setNotas] = useState('');
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);

  const serviciosDisponibles = [
    'Consulta General',
    'Servicio Premium',
    'Mantenimiento',
    'Asesoría',
    'Otro',
  ];

  const handleCrearReserva = async () => {
    if (!servicio || !fecha || !hora) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const reservaData = {
        servicio,
        fecha,
        hora,
        duracion: parseInt(duracion) || 60,
        notas: notas || null,
        precio: precio ? parseFloat(precio) : null,
      };

      await reservaService.crear(reservaData);
      
      Alert.alert('Éxito', 'Reserva creada exitosamente', [
        {
          text: 'OK',
          onPress: () => {
            // Limpiar formulario
            setServicio('');
            setFecha('');
            setHora('');
            setDuracion('60');
            setNotas('');
            setPrecio('');
            // Navegar a reservas
            router.push('/(tabs)/reservas');
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'No se pudo crear la reserva'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Servicio *</Text>
        <View style={styles.serviciosContainer}>
          {serviciosDisponibles.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.servicioChip,
                servicio === s && styles.servicioChipActive,
              ]}
              onPress={() => setServicio(s)}
            >
              <Text
                style={[
                  styles.servicioText,
                  servicio === s && styles.servicioTextActive,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Fecha * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-01-15"
          value={fecha}
          onChangeText={setFecha}
        />

        <Text style={styles.label}>Hora * (HH:MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="10:00"
          value={hora}
          onChangeText={setHora}
        />

        <Text style={styles.label}>Duración (minutos)</Text>
        <TextInput
          style={styles.input}
          placeholder="60"
          value={duracion}
          onChangeText={setDuracion}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Precio (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="50.00"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Información adicional..."
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCrearReserva}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creando...' : 'Crear Reserva'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  serviciosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  servicioChip: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  servicioChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  servicioText: {
    color: '#666',
    fontSize: 14,
  },
  servicioTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
