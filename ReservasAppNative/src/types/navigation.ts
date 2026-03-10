// Tipos para React Navigation

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ============================================
// ROOT STACK (Auth Flow)
// ============================================
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: { esAdmin: boolean };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

// ============================================
// MAIN TABS (Bottom Navigation)
// ============================================
export type MainTabsParamList = {
  Inicio: undefined;
  Reservas: undefined;
  NuevaReserva: undefined;
  Historial: undefined;
  Perfil: undefined;
};

export type MainTabsScreenProps<T extends keyof MainTabsParamList> = 
  BottomTabScreenProps<MainTabsParamList, T>;

// ============================================
// ADMIN STACK (Gestión Admin)
// ============================================
export type AdminStackParamList = {
  InicioAdmin: undefined;
  UsuarioForm: { usuarioId?: number };
  ConjuntoForm: { conjuntoId?: number };
  AreaForm: { areaId?: number; conjuntoId?: number };
};

export type AdminStackScreenProps<T extends keyof AdminStackParamList> = 
  NativeStackScreenProps<AdminStackParamList, T>;

// ============================================
// Tipos combinados
// ============================================
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
