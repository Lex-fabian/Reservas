const { Sequelize } = require('sequelize');
require('dotenv').config();

// Log de debug para verificar variables de entorno
console.log('🔍 Verificando configuración de BD:');
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
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('Error completo:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
