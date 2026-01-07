@echo off
echo ========================================
echo   INICIANDO RESERVASAPP - BACKEND
echo ========================================
echo.

cd backend

if not exist node_modules (
    echo [INFO] Instalando dependencias del backend...
    call npm install
)

if not exist .env (
    echo [ADVERTENCIA] No se encontro archivo .env
    echo [INFO] Copiando .env.example a .env
    copy .env.example .env
    echo.
    echo [IMPORTANTE] Edita backend\.env con tus credenciales de MySQL
    echo.
    pause
)

echo [INFO] Iniciando servidor backend...
echo [INFO] El servidor estara disponible en http://localhost:3000
echo.
call npm start
