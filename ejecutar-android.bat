@echo off
echo =====================================
echo   ReservasApp - React Native CLI
echo =====================================
echo.
echo Compilando y ejecutando en Android...
echo.
cd /d "%~dp0ReservasAppNative"
call npm run android
pause
