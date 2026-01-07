# Mobile - ReservasApp

App móvil desarrollada con React Native y Expo.

## Instalación

```bash
npm install
npm start
```

## Configuración

### Cambiar URL del API

Edita `services/api.js` línea 6:

```javascript
// Para dispositivo físico (misma WiFi)
const API_URL = 'http://192.168.1.10:3000/api';  // Tu IP local

// Para Android Emulator
const API_URL = 'http://10.0.2.2:3000/api';

// Para iOS Simulator
const API_URL = 'http://localhost:3000/api';
```

Para encontrar tu IP:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig | grep inet
```

## Estructura

```
mobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.js        # Navegación por tabs
│   │   ├── reservas.js       # Lista de reservas
│   │   ├── nueva-reserva.js  # Crear reserva
│   │   └── perfil.js         # Perfil de usuario
│   ├── _layout.js            # Layout raíz
│   ├── index.js              # Pantalla inicial
│   ├── login.js              # Login
│   └── register.js           # Registro
├── services/
│   └── api.js                # Cliente API con Axios
├── app.json                  # Configuración de Expo
├── package.json
└── babel.config.js
```

## Navegación

Usa Expo Router (File-based routing):

- `/` - Redirect a login o reservas
- `/login` - Pantalla de login
- `/register` - Pantalla de registro
- `/(tabs)/reservas` - Lista de reservas
- `/(tabs)/nueva-reserva` - Crear reserva
- `/(tabs)/perfil` - Perfil y configuración

## Servicios API

### authService

```javascript
import { authService } from '../services/api';

// Login
await authService.login(email, password);

// Registro
await authService.register(nombre, email, password, telefono);

// Logout
await authService.logout();

// Obtener perfil
await authService.getProfile();

// Verificar si está logueado
const loggedIn = await authService.isLoggedIn();

// Obtener usuario actual
const usuario = await authService.getUsuario();
```

### reservaService

```javascript
import { reservaService } from '../services/api';

// Crear reserva
await reservaService.crear({
  servicio: "Consulta",
  fecha: "2026-01-15",
  hora: "10:00",
  duracion: 60,
  precio: 50.00
});

// Obtener todas las reservas
const { reservas } = await reservaService.obtenerTodas();

// Obtener por ID
const { reserva } = await reservaService.obtenerPorId(id);

// Actualizar
await reservaService.actualizar(id, datos);

// Cancelar
await reservaService.cancelar(id);

// Eliminar (solo admin)
await reservaService.eliminar(id);
```

## Almacenamiento Local

Se usa AsyncStorage para:
- Token JWT
- Datos del usuario

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar
await AsyncStorage.setItem('key', 'value');

// Leer
const value = await AsyncStorage.getItem('key');

// Eliminar
await AsyncStorage.removeItem('key');
```

## Ejecutar

```bash
# Iniciar Expo Dev Server
npm start

# Abrir en Android
npm run android

# Abrir en iOS
npm run ios

# Abrir en web
npm run web
```

## Probar en Dispositivo Físico

1. Instala **Expo Go** desde:
   - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Asegúrate de estar en la misma red WiFi que tu computadora

3. Escanea el QR con:
   - Android: App Expo Go
   - iOS: Cámara nativa

## Build para Producción

### Android APK

```bash
# Configurar EAS
npm install -g eas-cli
eas login
eas build:configure

# Build APK
eas build --platform android --profile preview
```

### iOS (requiere cuenta de Apple Developer)

```bash
eas build --platform ios
```

## Pantallas Principales

### Login
- Email y password
- Validación de campos
- Navegación a registro
- Auto-login con token guardado

### Registro
- Nombre, email, password, teléfono
- Validación
- Auto-login después de registro

### Mis Reservas
- Lista de reservas del usuario
- Filtros por estado
- Pull to refresh
- Cancelar reserva

### Nueva Reserva
- Selección de servicio
- Fecha y hora
- Duración
- Notas y precio opcional

### Perfil
- Información del usuario
- Cerrar sesión
- Versión de la app

## Estilos

Los estilos usan StyleSheet de React Native:

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // ...
});
```

## Próximas Mejoras

- [ ] Date/Time Picker nativo
- [ ] Imágenes de servicios
- [ ] Push Notifications
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] Animaciones
- [ ] Búsqueda de reservas
- [ ] Filtros avanzados
- [ ] Modo offline
