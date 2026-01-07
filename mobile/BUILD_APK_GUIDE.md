# 📱 Guía para Generar APK de la App Móvil

## Método 1: EAS Build (Recomendado) ⭐

EAS Build es el servicio oficial de Expo para construir aplicaciones. Es **GRATIS** para hasta 30 builds al mes.

### Paso 1: Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Paso 2: Iniciar sesión en Expo

```bash
eas login
```

Si no tienes cuenta, créala en: https://expo.dev/signup

### Paso 3: Configurar el proyecto

Desde la carpeta `mobile`:

```bash
cd c:\private\ReservasApp\mobile
eas build:configure
```

Esto creará un archivo `eas.json` con la configuración de build.

### Paso 4: Construir el APK

Para generar un APK que puedas compartir directamente:

```bash
eas build -p android --profile preview
```

**Opciones:**
- `--profile preview` = Genera APK (fácil de compartir)
- `--profile production` = Genera AAB (para Google Play Store)

### Paso 5: Descargar el APK

Una vez completado el build (toma ~5-10 minutos):

1. EAS te dará un link para descargar el APK
2. También puedes verlo en: https://expo.dev/accounts/[tu-usuario]/projects/reservasapp-mobile/builds
3. Descarga el APK y compártelo por WhatsApp, email, etc.

---

## Método 2: Build Local (Requiere Android Studio)

Si prefieres construir localmente sin usar la nube:

### Requisitos previos:
1. **Android Studio** instalado
2. **JDK 17** instalado
3. Variables de entorno configuradas:
   - `ANDROID_HOME`
   - `JAVA_HOME`

### Pasos:

1. **Instalar dependencias:**
```bash
cd c:\private\ReservasApp\mobile
npm install
```

2. **Pre-construir el proyecto:**
```bash
npx expo prebuild --platform android
```

3. **Construir el APK:**
```bash
cd android
.\gradlew assembleRelease
```

4. **Ubicación del APK:**
```
mobile\android\app\build\outputs\apk\release\app-release.apk
```

---

## Configuración Adicional para APK de Producción

### Actualizar app.json

Antes de construir, actualiza estos campos en `app.json`:

```json
{
  "expo": {
    "name": "ReservasApp",
    "slug": "reservasapp-mobile",
    "version": "1.0.0",
    "android": {
      "package": "com.tuempresa.reservasapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4a90e2"
      },
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### Configurar la URL de la API

⚠️ **IMPORTANTE**: Antes de construir el APK, actualiza la URL de la API en `services/api.js`:

```javascript
// Cambia de localhost a tu IP real o dominio
const API_URL = 'http://TU_IP_O_DOMINIO:10000/api';
```

---

## Notas Importantes

### ⚠️ Limitaciones del APK sin firmar
- **No se puede publicar en Google Play Store** (usa AAB con `--profile production`)
- Aparece advertencia "App no verificada" al instalar
- Los usuarios deben permitir "Instalar apps de fuentes desconocidas"

### 🔐 Para producción real
Si vas a publicar en Google Play Store:

1. Genera un keystore:
```bash
eas credentials
```

2. Configura el perfil de producción en `eas.json`

3. Construye con:
```bash
eas build -p android --profile production
```

### 📦 Compartir el APK

Una vez descargado el APK:
1. Súbelo a Google Drive / Dropbox
2. Comparte el link
3. Los usuarios lo descargan e instalan directamente

### 🔄 Actualizaciones OTA (Over-The-Air)

Con Expo, puedes hacer actualizaciones sin rebuild usando:

```bash
eas update --branch production
```

Esto actualiza JS/assets sin necesidad de reinstalar el APK.

---

## Comandos Rápidos

```bash
# Build APK de prueba
eas build -p android --profile preview

# Build AAB para Play Store
eas build -p android --profile production

# Ver builds anteriores
eas build:list

# Cancelar un build en progreso
eas build:cancel

# Ver logs de un build
eas build:view [BUILD_ID]
```

---

## Solución de Problemas Comunes

### Error: "Expo account not found"
```bash
eas login
```

### Error: "Project not configured"
```bash
eas build:configure
```

### El APK no se instala
- Verifica que Android sea versión 6.0 o superior
- Habilita "Instalar apps de fuentes desconocidas"
- Desinstala versiones anteriores primero

### La app no se conecta al backend
- Verifica la URL de API en `services/api.js`
- Asegúrate de usar la IP pública o dominio, NO `localhost`
- El servidor backend debe estar accesible desde internet

---

## Recursos Adicionales

- [Documentación EAS Build](https://docs.expo.dev/build/introduction/)
- [Configurar Android builds](https://docs.expo.dev/build-reference/android-builds/)
- [Distribución interna](https://docs.expo.dev/build/internal-distribution/)

