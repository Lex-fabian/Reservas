@echo off
echo ========================================
echo   INICIANDO RESERVASAPP - WEB
echo ========================================
echo.

cd web

if not exist node_modules (
    echo [INFO] Instalando dependencias de la web...
    call npm install
)

if not exist .env (
    echo [ADVERTENCIA] No se encontro archivo .env
    echo [INFO] Copiando .env.example a .env
    copy .env.example .env
    echo.
    echo [IMPORTANTE] Edita web\.env con la URL de tu API
    echo              Por defecto apunta a http://localhost:3000/api
    echo.
    pause
)

echo [INFO] Iniciando servidor de desarrollo web...
echo [INFO] La aplicacion estara disponible en http://localhost:5173
echo.
call npm run dev
