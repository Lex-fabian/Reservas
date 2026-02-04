# Guia de Despliegue a Produccion

Esta guia te ayuda a subir el backend a un servidor en internet.

## Hosting

### 1. Render
- Plan gratuito disponible
- Deploy desde GitHub
- Requiere base de datos externa

---

## DEPLOY EN RENDER

### Paso 1: Crear Cuenta en Render

1. Ve a https://render.com
2. Registrate con GitHub

### Paso 2: Crear Web Service

1. Click en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: backend-reservas
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### Paso 3: Agregar Variables de Entorno

En Render → Environment:

```
PORT=3000
NODE_ENV=production
DB_HOST=tu_db_host
DB_USER=tu_db_user
DB_PASSWORD=tu_db_password
DB_NAME=tu_db_name
JWT_SECRET=tu_clave_secreta
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email
EMAIL_PASS=tu_password
```
