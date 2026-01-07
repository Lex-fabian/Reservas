# Guía de Deploy en Railway - ReservasApp

Esta guía te ayudará a desplegar tu aplicación completa en Railway: Backend + MySQL + Web.

## 📋 Requisitos Previos

1. Cuenta en [Railway.app](https://railway.app)
2. Código en GitHub (recomendado)
3. Cuenta en GitHub

## 🚀 Paso 1: Subir Código a GitHub

```bash
cd ReservasApp

# Inicializar Git (si no lo has hecho)
git init
git add .
git commit -m "Initial commit"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/reservasapp.git
git branch -M main
git push -u origin main
```

## 🗄️ Paso 2: Crear Base de Datos MySQL

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Click en **"New Project"**
3. Selecciona **"Provision MySQL"**
4. Railway creará la base de datos automáticamente
5. Ve a la pestaña **"Variables"** y copia las credenciales:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

## 🔧 Paso 3: Deploy del Backend

### Desde GitHub (Recomendado)

1. En el mismo proyecto de Railway, click en **"New"** → **"GitHub Repo"**
2. Conecta tu cuenta de GitHub si no lo has hecho
3. Selecciona el repositorio `reservasapp`
4. Railway te preguntará qué carpeta desplegar
5. Selecciona la carpeta **`backend`**

### Configurar Variables de Entorno

En la pestaña **"Variables"** del servicio backend, agrega:

```env
# Puerto (Railway lo asigna automáticamente)
PORT=${{PORT}}

# Base de Datos (Railway las conecta automáticamente si están en el mismo proyecto)
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_NAME=${{MYSQLDATABASE}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}

# JWT Secret
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_esto

# Node Environment
NODE_ENV=production
```

**Importante:** Railway vincula automáticamente las variables de MySQL si están en el mismo proyecto, así que puedes usar las referencias `${{MYSQLHOST}}` etc.

### Verificar Deploy

1. Railway hará el build y deploy automáticamente
2. En la pestaña **"Deployments"** verás el progreso
3. Una vez completado, ve a **"Settings"** → **"Domains"**
4. Click en **"Generate Domain"**
5. Obtendrás una URL como: `https://reservasapp-backend-production.up.railway.app`

**Prueba tu API:**
```bash
curl https://tu-backend.up.railway.app
```

Deberías ver el mensaje de bienvenida.

## 🌐 Paso 4: Deploy del Frontend Web

### Desde GitHub

1. En el mismo proyecto, click en **"New"** → **"GitHub Repo"**
2. Selecciona el mismo repositorio
3. Esta vez selecciona la carpeta **`web`**

### Configurar Variables de Entorno

En la pestaña **"Variables"** del servicio web:

```env
VITE_API_URL=https://tu-backend.up.railway.app/api
```

Reemplaza `tu-backend.up.railway.app` con tu URL real del backend.

### Generar Dominio

1. Ve a **"Settings"** → **"Domains"**
2. Click en **"Generate Domain"**
3. Obtendrás una URL como: `https://reservasapp-web-production.up.railway.app`

## ✅ Paso 5: Verificar Todo

Tu proyecto en Railway ahora tiene 3 servicios:

```
📦 ReservasApp (Proyecto)
  ├── 🗄️ MySQL
  ├── 🔧 Backend API
  └── 🌐 Web Frontend
```

### Probar la App Web

1. Ve a `https://tu-app-web.up.railway.app`
2. Regístrate con un nuevo usuario
3. Crea una reserva
4. ¡Listo! 🎉

## 📱 Paso 6: Configurar App Móvil

Actualiza tu app móvil para usar el backend en Railway:

**Edita `mobile/services/api.js`:**

```javascript
const API_URL = 'https://tu-backend.up.railway.app/api';
```

Luego reinicia Expo:
```bash
cd mobile
npm start
```

## 💰 Costos Estimados

### Plan Hobby (Gratis $5/mes)
- MySQL: ~$2/mes
- Backend: ~$2/mes  
- Web: ~$1/mes
- **Total: ~$5/mes** (cubierto con crédito gratis) ✅

### Plan Developer ($5/mes)
- $5 de suscripción + $5 de crédito = $10/mes de recursos

## 🔄 Actualizaciones Automáticas

Railway detecta cambios en tu repo de GitHub:

```bash
# Hacer cambios
git add .
git commit -m "Actualización"
git push

# Railway detecta el push y redespliega automáticamente
```

## 🐛 Troubleshooting

### Backend no conecta a MySQL

1. Verifica que las variables `${{MYSQLHOST}}` etc. estén configuradas
2. Revisa los logs en **"Deployments"** → Click en el deploy → **"View Logs"**

### Web no se conecta al Backend

1. Verifica que `VITE_API_URL` esté correctamente configurada
2. Asegúrate de que el backend esté funcionando
3. Verifica CORS en el backend

### Error 502/503

1. El servicio está iniciándose, espera 1-2 minutos
2. Revisa los logs para errores
3. Verifica que el puerto sea `${{PORT}}`

## 📊 Monitoreo

Railway provee:
- ✅ Logs en tiempo real
- ✅ Métricas de uso
- ✅ Historial de deploys
- ✅ Rollback a versiones anteriores

## 🔒 Seguridad

- ✅ HTTPS automático
- ✅ Variables de entorno encriptadas
- ✅ Conexiones privadas entre servicios
- ✅ Regenerar JWT_SECRET en producción

## 🎯 Comandos Útiles

### Ver logs en tiempo real
```bash
railway logs
```

### Ejecutar comando en el servicio
```bash
railway run node server.js
```

### Ver variables de entorno
```bash
railway variables
```

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

## ✨ ¡Felicidades!

Tu aplicación está completamente desplegada en Railway:

- 🌐 **Web:** https://tu-app.up.railway.app
- 🔧 **API:** https://tu-backend.up.railway.app
- 📱 **Mobile:** Conectada al API en Railway
- 🗄️ **MySQL:** Funcionando en Railway

¡Todo en un solo lugar! 🚀
