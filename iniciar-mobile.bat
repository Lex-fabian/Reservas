@echo off
echo ========================================
echo   INICIANDO RESERVASAPP - MOBILE
echo ========================================
echo.

cd mobile

if not exist node_modules (
    echo [INFO] Instalando dependencias de la app movil...
    call npm install
)

echo.
echo [IMPORTANTE] Recuerda editar mobile\services\api.js
echo              con la IP de tu computadora si vas a probar
echo              en un dispositivo fisico.
echo.
echo Para saber tu IP ejecuta: ipconfig
echo.
pause

echo [INFO] Iniciando Expo Dev Server...
echo [INFO] Escanea el QR con Expo Go desde tu celular
echo.
call npm start
