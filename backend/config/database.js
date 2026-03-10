const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log(' Verificando configuración de BD:');
console.log('DB_HOST:', process.env.DB_HOST || 'NO CONFIGURADO');
console.log('DB_PORT:', process.env.DB_PORT || 'NO CONFIGURADO');
console.log('DB_USER:', process.env.DB_USER || 'NO CONFIGURADO');
console.log('DB_NAME:', process.env.DB_NAME || 'NO CONFIGURADO');
console.log('DB_SSL:', process.env.DB_SSL || 'NO CONFIGURADO');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'defaultdb',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 30000, // 30 segundos
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    retry: {
      max: 3 
    }
  }
);
// FUNCION PARA CONECTAR A LA BASE DE DATOS CON REINTENTOS Y LOGGING DETALLADO

const connectDB = async (intentos = 3, delay = 5000) => {
  for (let i = 1; i <= intentos; i++) {
    try {
      console.log(`Intento ${i} de ${intentos}: Conectando a la base de datos...`);
      await sequelize.authenticate();
      console.log(' Conexión a MySQL establecida correctamente');
      await sequelize.sync({ alter: false });
      console.log(' Modelos sincronizados con la base de datos');
      return; 
    } catch (error) {
      console.error(` Error en intento ${i}/${intentos}:`);
      console.error('Mensaje:', error.message);
      console.error('Código:', error.code);
      
      if (i === intentos) {
        console.error(' Error conectando a la base de datos después de', intentos, 'intentos');
        console.error('Error completo:', error);
        process.exit(1);
      }
      
      console.log(` Esperando ${delay / 1000} segundos antes del próximo intento...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = { sequelize, connectDB };
