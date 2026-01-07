# 🚀 Guía Rápida - Deploy en Railway

## Paso 1: Crear Proyecto en Railway

1. Ve a https://railway.app
2. Login con GitHub
3. Click en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Autoriza Railway y selecciona `ReservasApp`

## Paso 2: Configurar Backend

### En Railway Dashboard:

1. Click en el servicio backend
2. Ve a **Settings** → **Service Settings**
3. Configura:
   - **Root Directory**: `backend`
   - **Start Command**: `node server.js`
   - **Builder**: NIXPACKS (automático)

### Variables de Entorno del Backend:

Click en **"Variables"** y agrega:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=tu-secreto-super-seguro-cambiar-ahora
```

## Paso 3: Agregar MySQL Database

1. En el proyecto, click **"New"** → **"Database"** → **"Add MySQL"**
2. Railway crea automáticamente: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`

### Conectar Backend con MySQL:

En las variables del servicio **Backend**, agrega:

```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
```

## Paso 4: Inicializar Base de Datos

### Opción A: Railway CLI
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link proyecto
railway link

# Conectar a MySQL
railway connect mysql

# Ejecutar schema
mysql> source database/schema.sql;
```

### Opción B: MySQL Workbench
1. En Railway Dashboard → MySQL Service → **"Connect"**
2. Copia las credenciales
3. Conecta con MySQL Workbench
4. Ejecuta el contenido de `database/schema.sql`

## Paso 5: Deploy Automático

Railway desplegará automáticamente cuando:
- ✅ Hagas `git push` a la rama principal
- ✅ Cambies configuración en el dashboard

Ver logs en tiempo real:
```bash
railway logs
```

## Paso 6: Verificar Deployment

Tu backend estará en: `https://tu-proyecto.up.railway.app`

Prueba estos endpoints:
```bash
# Health check
curl https://tu-proyecto.up.railway.app/health

# Info API
curl https://tu-proyecto.up.railway.app/

# Login (debe dar error sin credenciales)
curl -X POST https://tu-proyecto.up.railway.app/api/auth/login
```

## Paso 7: Actualizar Frontend

Edita `web/src/services/api.js`:
```javascript
const API_URL = 'https://tu-proyecto.up.railway.app/api';
```

## Checklist ✅

- [ ] Proyecto creado en Railway
- [ ] Backend configurado (root: `/backend`)
- [ ] MySQL agregado
- [ ] Variables de entorno configuradas
- [ ] Schema SQL ejecutado
- [ ] Backend desplegado exitosamente
- [ ] Health check funcionando
- [ ] Frontend actualizado con nueva URL

## Troubleshooting

**Error: Cannot connect to database**
- Verifica que las variables `DB_*` estén configuradas
- Confirma que el servicio MySQL esté activo
- Revisa los logs: `railway logs`

**Error: Module not found**
- Asegúrate que `Root Directory` sea `backend`
- Verifica que `package.json` esté en la carpeta backend

**Error 502/503**
- Confirma el `Start Command`: `node server.js`
- Verifica que el puerto use la variable `PORT`
- Espera 2-3 minutos para el primer deploy

## Costos 💰

- **Railway Hobby Plan**: $5/mes
- **500 horas gratis/mes** en el plan starter
- MySQL incluido en el plan

## Siguiente: Desplegar Frontend

El frontend se puede desplegar en:
- **Vercel** (recomendado)
- **Netlify** 
- **Railway** (servicio adicional)

Ver `VERCEL_DEPLOY.md` para instrucciones del frontend.

---

¿Necesitas ayuda? 
- 📚 [Railway Docs](https://docs.railway.app)
- 💬 [Railway Discord](https://discord.gg/railway)
