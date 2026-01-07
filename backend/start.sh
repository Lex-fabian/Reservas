#!/bin/bash
# Script de inicialización para Railway

echo " Iniciando ReservasApp Backend..."
echo " Instalando dependencias..."
npm install

echo " Dependencias instaladas"
echo " Configuración de entorno: $NODE_ENV"
echo " Base de datos: $DB_HOST"
echo " Iniciando servidor..."

node server.js
