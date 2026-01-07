const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  console.log('🔄 Iniciando base de datos...');
  
  let connection;
  
  try {
    // Conectar a MySQL (sin seleccionar base de datos específica)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true, // Permitir múltiples queries
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : undefined
    });

    console.log('✅ Conectado a MySQL');

    // Leer el archivo schema.sql
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    console.log('📄 Ejecutando schema.sql...');

    // Ejecutar el schema completo
    await connection.query(schema);

    console.log('✅ Base de datos inicializada correctamente');
    console.log('✅ Tablas creadas: usuarios, conjuntos, areas, reservas');
    console.log('✅ Datos de ejemplo insertados');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar
initDatabase();
