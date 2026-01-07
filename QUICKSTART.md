# Guía de Inicio Rápido - ReservasApp

## ⚡ Inicio Rápido (5 minutos)

### Paso 1: Configurar Backend (2 min)

```bash
# Terminal 1
cd backend
npm install
copy .env.example .env
```

Edita `.env` y configura tu MySQL:
```
DB_PASSWORD=tu_password_mysql
```

```bash
npm start
```

✅ Deberías ver: "Servidor corriendo en http://localhost:3000"

### Paso 2: Configurar Mobile (3 min)

```bash
# Terminal 2
cd mobile
npm install
```

**IMPORTANTE**: Edita `mobile/services/api.js` línea 6:
```javascript
const API_URL = 'http://TU_IP:3000/api';  // Ej: http://192.168.1.5:3000/api
```

Para saber tu IP:
```bash
# Windows
ipconfig
# Busca IPv4 en tu adaptador WiFi

# Mac/Linux
ifconfig
# Busca inet en tu adaptador WiFi
```

Inicia Expo:
```bash
npm start
```

### Paso 3: Abrir en tu celular

1. Instala **Expo Go** desde Play Store o App Store
2. Escanea el código QR que aparece en la terminal
3. ¡Listo! La app se abrirá

## 🎯 Primeros Pasos en la App

1. **Registrarte**: Crea una cuenta nueva
2. **Crear reserva**: Ve a "Nueva Reserva"
3. **Ver reservas**: Ve a "Mis Reservas"

## 🔥 Comandos Útiles

### Backend
```bash
cd backend
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo (auto-reload)
```

### Mobile
```bash
cd mobile
npm start          # Iniciar Expo
npm run android    # Abrir en emulador Android
npm run ios        # Abrir en simulador iOS
```

## ⚠️ Problemas Comunes

### "Cannot connect to server"
- ✅ Verifica que el backend esté corriendo (`localhost:3000`)
- ✅ Usa tu IP local, NO `localhost` en `api.js`
- ✅ Ambos dispositivos en la misma red WiFi

### "MySQL connection error"
- ✅ MySQL está corriendo?
- ✅ Usuario y password correctos en `.env`?
- ✅ Base de datos creada? (Sequelize la crea automáticamente)

### "Expo no inicia"
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

## 📚 Más Información

Ver [README.md](README.md) para documentación completa.
