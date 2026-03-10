import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from '../screens/LoginScreen.tsx';
import AreasScreen from '../screens/AreasScreen';
import HistorialReservasScreen from '../screens/HistorialReservasScreen';
import PerfilScreen from '../screens/PerfilScreen.tsx';
import NuevaReservaScreen from '../screens/NuevaReservaScreen';
import InicioAdminScreen from '../screens/InicioAdminScreen';
import UsuarioFormScreen from '../screens/UsuarioFormScreen';
import ConjuntoFormScreen from '../screens/ConjuntoFormScreen';
import AreaFormScreen from '../screens/AreaFormScreen';

// Components
import ChatFlotante from '../components/ChatFlotante.tsx';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }) {
  const [esAdmin, setEsAdmin] = useState(false);
  
  useEffect(() => {
    const obtenerRolAdmin = async () => {
      // Primero intentar obtenerlo de route.params
      if (route?.params?.esAdmin !== undefined) {
        setEsAdmin(route.params.esAdmin);
        return;
      }
      
      // Si no viene en params, intentar obtenerlo de AsyncStorage
      try {
        const esAdminGuardado = await AsyncStorage.getItem('esAdmin');
        setEsAdmin(esAdminGuardado === 'true');
      } catch (error) {
        console.error('Error obteniendo rol admin:', error);
        setEsAdmin(false);
      }
    };
    
    obtenerRolAdmin();
  }, [route?.params?.esAdmin]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4a90e2',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {esAdmin ? (
        <Tab.Screen
          name="Admin"
          component={InicioAdminScreen}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color, size }) => (
              <Icon name="shield-checkmark-outline" size={size} color={color} />
            ),
          }}
        />
      ) : (
        <>
          <Tab.Screen
            name="Inicio"
            component={AreasScreen}
            options={{
              tabBarLabel: 'Inicio',
              tabBarIcon: ({ color, size }) => (
                <Icon name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Historial"
            component={HistorialReservasScreen}
            options={{
              tabBarLabel: 'Reservas',
              tabBarIcon: ({ color, size }) => (
                <Icon name="calendar-outline" size={size} color={color} />
              ),
            }}
          />
        </>
      )}
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    // Verificar sesión al iniciar
    const verificarSesionInicial = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const usuarioData = await AsyncStorage.getItem('usuario');
        
        if (token && usuarioData) {
          const usuario = JSON.parse(usuarioData);
          const tipoUsuario = usuario?.tipo_usuario?.toLowerCase();
          const esAdmin = tipoUsuario === 'admin' || tipoUsuario === 'superadmin';
          
          setIsLoggedIn(true);
          setInitialRoute('MainTabs');
          // Guardamos el parámetro esAdmin para pasarlo a MainTabs
          await AsyncStorage.setItem('esAdmin', esAdmin.toString());
        } else {
          setIsLoggedIn(false);
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        setIsLoggedIn(false);
        setInitialRoute('Login');
      } finally {
        setIsLoading(false);
      }
    };

    verificarSesionInicial();

    // Escuchar cambios en el almacenamiento cada 500ms
    const interval = setInterval(async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return null; // O un splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            animationTypeForReplace: !isLoggedIn ? 'pop' : 'push',
          }}
        />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="NuevaReserva"
          component={NuevaReservaScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="UsuarioForm" 
          component={UsuarioFormScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="ConjuntoForm" 
          component={ConjuntoFormScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="AreaForm" 
          component={AreaFormScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
      
      {/* Chat flotante global - solo visible cuando usuario está autenticado */}
      {isLoggedIn && <ChatFlotante />}
    </NavigationContainer>
  );
}
