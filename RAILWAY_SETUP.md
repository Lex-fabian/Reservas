# ReservasApp - Deployment en Railway

Este proyecto está configurado para desplegarse en Railway con dos servicios:
1. Backend API (Node.js + Express)
2. Base de Datos (MySQL)

## Configuración de Railway

### 1. Backend Service

#### Variables de Entorno Requeridas:
```
NODE_ENV=production
PORT=3000
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
```

#### Configuración del Servicio:
- **Root Directory**: `/backend`
- **Start Command**: `node server.js`
- **Builder**: NIXPACKS (automático)

### 2. MySQL Database Service

#### Crear servicio MySQL:
1. En Railway Dashboard, click en "New" → "Database" → "Add MySQL"
2. Railway creará automáticamente las variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

#### Inicializar la Base de Datos:
Después de crear el servicio MySQL, conectarse y ejecutar el script:
```bash
railway run mysql -u root -p < database/schema.sql

```

### 3. Pasos de Despliegue

#### Método 1: Desde GitHub (Recomendado)
```bash
railway login
railway init

# 2. Conectar con GitHub
# En Railway Dashboard → Connect Repo → Seleccionar tu repositorio

# 3. Configurar servicios:
# - Crear servicio para Backend (root: /backend)
# - Crear servicio MySQL Database
# - Configurar variables de entorno en Backend

# 4. Deploy automático
# Railway desplegará automáticamente cuando hagas push a main
```

#### Método 2: Deploy Manual
```bash
# 1. Login en Railway
railway login

# 2. Link al proyecto
railway link

# 3. Agregar MySQL
railway add

# 4. Configurar variables de entorno
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=tu-secreto-seguro-aqui

# 5. Deploy del backend
cd backend
railway up
```

### 4. Configuración Post-Despliegue

#### Crear Usuario Admin:
Conectarse a la base de datos y ejecutar:
```sql
-- Password hash para 'lex' (cambiar en producción)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Lex', 'lex@reservasapp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
```

#### Verificar la Conexión:
```bash
# Verificar que el backend esté corriendo
curl https://tu-backend-url.railway.app/api/auth/login

# Debería responder con un error 400 (esperando credenciales)
```

### 5. Estructura del Proyecto

```
ReservasApp/
├── backend/              # Servicio Backend (Node.js)
│   ├── server.js
│   ├── package.json
│   ├── railway.json     # Configuración de Railway
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
├── database/            # Scripts SQL
│   └── schema.sql      # Schema inicial
├── web/                # Frontend (desplegar por separado)
└── mobile/             # App móvil (React Native)
```

### 6. URLs y Endpoints

Después del despliegue:
- **Backend API**: `https://tu-proyecto.up.railway.app`
- **Endpoints disponibles**:
  - `POST /api/auth/register` - Registrar usuario
  - `POST /api/auth/login` - Iniciar sesión
  - `GET /api/reservas` - Obtener reservas (requiere auth)
  - `POST /api/reservas` - Crear reserva (requiere auth)

### 7. Frontend (Despliegue Separado)

El frontend se puede desplegar en:
- **Vercel** (recomendado para React)
- **Netlify**
- **Railway** (servicio separado)

Actualizar la URL del backend en `web/src/services/api.js`:
```javascript
const API_URL = 'https://tu-backend.up.railway.app/api';
```

### 8. Monitoreo y Logs

```bash
# Ver logs del backend
railway logs

# Ver logs de la base de datos
railway logs --service mysql

# Abrir dashboard
railway open
```

### 9. Troubleshooting

#### Error de conexión a BD:
- Verificar que las variables de entorno estén configuradas
- Confirmar que el servicio MySQL esté activo
- Revisar logs: `railway logs`

#### Error 502/503:
- Verificar que el comando start sea correcto: `node server.js`
- Confirmar que el puerto sea el correcto (Railway usa PORT variable)
- Revisar que todas las dependencias estén en `dependencies`, no en `devDependencies`

#### CORS Issues:
- Asegurarse de agregar el dominio del frontend en la configuración CORS del backend
- Actualizar `backend/server.js` con los orígenes permitidos

### 10. Seguridad

**Importante antes de ir a producción:**
- ✅ Cambiar `JWT_SECRET` a un valor seguro y único
- ✅ Actualizar contraseñas por defecto en la base de datos
- ✅ Configurar CORS solo para dominios específicos
- ✅ Habilitar HTTPS (Railway lo hace por defecto)
- ✅ Revisar variables de entorno sensibles
- ✅ Configurar rate limiting
- ✅ Agregar validación de inputs

### 11. Costos

Railway ofrece:
- **Plan Hobby**: $5/mes + uso
- **500 horas de ejecución gratis/mes**
- Cobra por tiempo de ejecución y recursos

Para desarrollo, el plan gratuito suele ser suficiente.

---

## Comandos Rápidos

```bash
# Setup inicial
railway login
railway init
railway add # agregar MySQL

# Deploy
cd backend
railway up

# Configurar variables
railway variables set JWT_SECRET=tu-secreto

# Ver logs
railway logs

# Abrir dashboard
railway open
```

## Soporte

Para más información, consulta la documentación oficial:
- [Railway Docs](https://docs.railway.app/)
- [Railway MySQL Guide](https://docs.railway.app/databases/mysql)
