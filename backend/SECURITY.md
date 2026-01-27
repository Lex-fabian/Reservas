# Implementacion de Seguridad - OWASP Top 10

Este documento detalla las medidas de seguridad implementadas en ReservasApp, alineadas con las vulnerabilidades criticas del OWASP Top 10.

## 1. Control de Acceso Roto (Broken Access Control)
Se implemento un sistema robusto de Control de Acceso Basado en Roles (RBAC) para prevenir que usuarios sin privilegios accedan a funciones administrativas.

- **Middleware de Autorizacion**: Se crearon middlewares especificos (`esSuperAdmin`, `esAdminOSuper`) que verifican el rol del usuario antes de permitir el acceso a las rutas.
- **Acceso por Alcance (Scope)**: Los administradores (Admin) tienen permisos restringidos unicamente a los conjuntos residenciales que tienen asignados. No pueden ver ni modificar datos de otros conjuntos.
- **Restriccion de Metodos**: Operaciones criticas como la eliminacion de registros (`DELETE`) estan reservadas exclusivamente para el rol SuperAdmin.

## 2. Fallos Criptograficos (Cryptographic Failures)
Se protege la informacion sensible en transito y en reposo para evitar la exposicion de datos.

- **Hashing de Contraseñas**: Se utiliza `bcryptjs` para encriptar las contraseñas antes de almacenarlas en la base de datos. Nunca se guardan en texto plano.
- **Gestion de Secretos**: Todas las credenciales criticas (claves de base de datos, secretos JWT, credenciales de correo) se almacenan en variables de entorno (`.env`), fuera del codigo fuente.

## 3. Inyeccion (Injection)
Se mitigan los riesgos de inyeccion SQL y NoSQL mediante la validacion y el uso de herramientas modernas de base de datos.

- **Uso de ORM (Sequelize)**: El uso de Sequelize abstrae las consultas a la base de datos y utiliza consultas parametrizadas por defecto, neutralizando intentos de inyeccion SQL.
- **Validacion de Entradas**: Se utiliza `express-validator` para sanear y verificar exahustivamente todos los datos recibidos por la API (correo, tipos de datos, longitudes maximas) antes de procesarlos.

## 4. Diseño Inseguro (Insecure Design)
Se establecieron controles preventivos para limitar el abuso del sistema.

- **Limitacion de Tasa (Rate Limiting)**: Se configuro `express-rate-limit` para restringir el numero de peticiones que una IP puede realizar en un periodo de tiempo.
    - Limite general para la API: Previene ataques de Denegacion de Servicio (DoS).
    - Limite estricto para Autenticacion: Protege las rutas de inicio de sesion contra ataques de fuerza bruta.

## 5. Configuracion de Seguridad Incorrecta (Security Misconfiguration)
Se endurecio la configuracion del servidor para reducir la superficie de ataque.

- **Cabeceras HTTP Seguras**: Se implemento la libreria `helmet`. Esto configura automaticamente cabeceras de respuesta HTTP para proteger contra vulnerabilidades comunes como Cross-Site Scripting (XSS), Clickjacking y Sniffing.
- **Ocultacion de Tecnologias**: Se eliminan cabeceras como `X-Powered-By` que podrian revelar informacion sobre la infraestructura del servidor (Express).

## 6. Fallos de Identificacion y Autenticacion
Se asegura la identidad del usuario y la integridad de la sesion.

- **Autenticacion sin Estado (JWT)**: Se utiliza JSON Web Tokens (JWT) para manejar las sesiones. El servidor valida la firma digital del token en cada peticion protegida.
- **Politicas de Contraseña**: Se valida la complejidad minima requerida para las contraseñas durante el registro.

## 7. Fallos de Integridad de Software y Datos
Se asegura que el codigo y las dependencias sean confiables.

- **Validacion de Paquetes**: Se mantiene el control sobre las dependencias instaladas mediante `npm` y se revisan periodicamente.
- **Manejo de Errores**: Los mensajes de error del sistema se han estandarizado para no revelar detalles tecnicos sensibles (traza de pila, estructura interna) al usuario final en produccion.
