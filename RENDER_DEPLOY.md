# 🚀 Desplegar Backend en Render

## ✨ Ventajas de Render
- ✅ Plan gratuito permanente (750 horas/mes)
- ✅ SSL automático
- ✅ Deploy automático desde GitHub
- ✅ Suspende después de 15 min inactividad (plan gratuito)

## 📋 Requisitos Previos
- Cuenta en Render (https://render.com)
- Repositorio en GitHub
- Base de datos MySQL en Aiven (ya configurada)

---

## 🎯 Paso 1: Crear Web Service en Render

### 1.1 Acceder a Render
1. Ve a https://render.com
2. Login con GitHub
3. Click en **"New +"** → **"Web Service"**

### 1.2 Conectar Repositorio
1. Selecciona tu repositorio: **ReservasApp**
2. Click en **"Connect"**

### 1.3 Configuración del Servicio

**Name**: `reservasapp-backend` (o el que prefieras)

**Region**: `Oregon (US West)` (o el más cercano)

**Branch**: `main` (o `master`)

**Root Directory**: `backend`

**Runtime**: `Node`

**Build Command**: 
```bash
npm install
```

**Start Command**: 
```bash
node server.js
```

**Instance Type**: `Free`

---

## 🔐 Paso 2: Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```
NODE_ENV=production

PORT=10000

JWT_SECRET=tu-secreto-super-seguro-cambiar-ahora

DB_HOST=mysql-47ad2f9-angello-ac0b.f.aivencloud.com
DB_PORT=24419
DB_USER=avnadmin
DB_PASSWORD=AVNS_OAGdf8g5gIRuCB4YeBQ
DB_NAME=defaultdb
DB_SSL=true
```

⚠️ **Importante**: En Render Free, el puerto DEBE ser `10000` (ya configurado en PORT)

---

## 🗄️ Paso 3: Inicializar Base de Datos

### Opción A: MySQL Workbench (Recomendado)

1. Abre **MySQL Workbench**
2. Nueva conexión:
   - **Connection Name**: Aiven ReservasApp
   - **Hostname**: `mysql-47ad2f9-angello-ac0b.f.aivencloud.com`
   - **Port**: `24419`
   - **Username**: `avnadmin`
   - **Password**: `AVNS_OAGdf8g5gIRuCB4YeBQ`
   - **Default Schema**: `defaultdb`
3. En **SSL**, pestaña "Use SSL": **Require**
4. **Test Connection** → debería conectar
5. Abrir archivo: `database/schema.sql`
6. Ejecutar script completo (⚡ icon o Ctrl+Shift+Enter)

### Opción B: Desde Terminal

```bash
mysql -h mysql-47ad2f9-angello-ac0b.f.aivencloud.com \
  -P 24419 \
  -u avnadmin \
  -p'AVNS_OAGdf8g5gIRuCB4YeBQ' \
  --ssl-mode=REQUIRED \
  defaultdb < database/schema.sql
```

---

## 🚀 Paso 4: Deploy

1. Click en **"Create Web Service"**
2. Render comenzará a hacer el build y deploy
3. Espera 2-3 minutos
4. Verás logs en tiempo real

**Tu URL será**: `https://reservasapp-backend.onrender.com`

---

## ✅ Paso 5: Verificar Deploy

### 5.1 Verificar Health Check

Abre en el navegador o usa curl:
```bash
curl https://reservasapp-backend.onrender.com/health
```

Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "2026-01-07T...",
  "environment": "production"
}
```

### 5.2 Verificar API Info

```bash
curl https://reservasapp-backend.onrender.com/
```

Deberías ver:
```json
{
  "message": "ReservasApp API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "reservas": "/api/reservas",
    "health": "/health"
  }
}
```

---

## 🔄 Paso 6: Deploy Automático

Render hace deploy automático cuando:
- ✅ Haces `git push` a la rama `main`
- ✅ Se detectan cambios en el directorio `backend/`

Ver logs:
- En Render Dashboard → Tu servicio → pestaña **"Logs"**
- Logs en tiempo real durante el deploy

---

## ⚙️ Configuraciones Adicionales (Opcional)

### Auto-Deploy desde GitHub

Ya está configurado por defecto. Cada push a `main` despliega automáticamente.

### Suspensión del Servicio (Plan Free)

- El servicio se suspende después de 15 minutos de inactividad
- La primera petición después de suspenderse tarda ~30 segundos (cold start)
- Para evitarlo, puedes usar un plan de pago ($7/mes)

### Dominios Personalizados

1. En tu servicio → pestaña **"Settings"**
2. Sección **"Custom Domain"**
3. Agregar tu dominio
4. Configurar DNS según instrucciones

---

## 🛠️ Troubleshooting

### Error: Cannot connect to database
- Verifica las variables de entorno en Render
- Confirma que `DB_SSL=true` esté configurada
- Revisa logs: Render Dashboard → Logs

### Error: Port already in use
- Asegúrate que `PORT=10000` esté en las variables
- Render usa el puerto 10000 para el plan free

### Error 503: Service Unavailable
- El servicio está iniciando (espera 30 seg)
- O se suspendió por inactividad (primera petición tarda más)

### Build Failure
- Verifica que `Root Directory` sea `backend`
- Confirma que `package.json` tenga todas las dependencias
- Revisa logs de build en Render

---

## 💰 Costos

**Plan Free**:
- ✅ 750 horas/mes gratis
- ✅ SSL automático
- ✅ Deploy automático
- ⚠️ Se suspende después de 15 min inactividad
- ⚠️ 750 horas ~ 31 días completos

**Plan Starter** ($7/mes):
- Sin suspensión automática
- Más recursos
- Mejor rendimiento

---

## 📱 Paso 7: Actualizar Frontend

Una vez desplegado el backend, actualiza el frontend:

Edita `web/src/services/api.js`:
```javascript
const API_URL = 'https://reservasapp-backend.onrender.com/api';
```

---

## 🎉 ¡Listo!

Tu backend está desplegado en Render con:
- ✅ Backend Node.js/Express
- ✅ Base de datos MySQL en Aiven
- ✅ SSL configurado
- ✅ Deploy automático desde GitHub

**Siguiente paso**: Desplegar el frontend en Vercel o Netlify

---

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Aiven MySQL Docs](https://docs.aiven.io/docs/products/mysql)

---

## 🆘 Comandos Útiles

```bash
# Ver logs en tiempo real (desde Render CLI)
render logs -f

# Restart manual del servicio
# Desde Render Dashboard → Manual Deploy → Deploy latest commit
```
