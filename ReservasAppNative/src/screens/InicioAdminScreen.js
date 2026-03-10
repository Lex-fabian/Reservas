import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import GestionConjuntosTab from '../components/admin/GestionConjuntosTab';
import GestionAreasTab from '../components/admin/GestionAreasTab';
import GestionUsuariosTab from '../components/admin/GestionUsuariosTab';
import GestionReservasTab from '../components/admin/GestionReservasTab';

export default function InicioAdminScreen({ navigation }) {
  const [tabActiva, setTabActiva] = useState('reservas');

  const TabButton = ({ nombre, icono, activa, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, activa && styles.tabButtonActiva]}
      onPress={onPress}
    >
      <Icon
        name={icono}
        size={20}
        color={activa ? '#4a90e2' : '#999'}
      />
      <Text style={[styles.tabText, activa && styles.tabTextActiva]}>
        {nombre}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a90e2" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Panel Admin</Text>
            <Text style={styles.headerSubtitle}>Gestión de Reservas</Text>
          </View>
          <TouchableOpacity
            style={styles.perfilButton}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Icon name="person-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
        >
          <TabButton
            nombre="Reservas"
            icono="calendar"
            activa={tabActiva === 'reservas'}
            onPress={() => setTabActiva('reservas')}
          />
          <TabButton
            nombre="Conjuntos"
            icono="business"
            activa={tabActiva === 'conjuntos'}
            onPress={() => setTabActiva('conjuntos')}
          />
          <TabButton
            nombre="Áreas"
            icono="apps"
            activa={tabActiva === 'areas'}
            onPress={() => setTabActiva('areas')}
          />
          <TabButton
            nombre="Usuarios"
            icono="people"
            activa={tabActiva === 'usuarios'}
            onPress={() => setTabActiva('usuarios')}
          />
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {tabActiva === 'reservas' && <GestionReservasTab key="reservas" />}
        {tabActiva === 'conjuntos' && <GestionConjuntosTab key="conjuntos" />}
        {tabActiva === 'areas' && <GestionAreasTab key="areas" />}
        {tabActiva === 'usuarios' && <GestionUsuariosTab key="usuarios" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a90e2',
    paddingTop: 40,
    paddingBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  perfilButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabButtonActiva: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  tabTextActiva: {
    color: '#4a90e2',
  },
  content: {
    flex: 1,
  },
});
