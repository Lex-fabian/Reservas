const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  console.log(' Iniciando base de datos...');
  
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : undefined
    });

    console.log(' Conectado a MySQL');

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    let schema = await fs.readFile(schemaPath, 'utf8');

    console.log('Generando contraseñas hasheadas...');

    const adminHash = await bcrypt.hash('admin123', 10);
    const lexHash = await bcrypt.hash('lex123', 10);
    const clienteHash = await bcrypt.hash('cliente123', 10);

    schema = schema.replace(/\$2a\$10\$YourHashedPasswordHere/g, (match, offset) => {
      const beforeMatch = schema.substring(0, offset);
      const adminCount = (beforeMatch.match(/'admin'/g) || []).length;
      const lexCount = (beforeMatch.match(/'lex'/g) || []).length;
      
      if (adminCount > lexCount) {
        return adminHash;
      } else if (lexCount > 0 && schema.substring(offset - 100, offset).includes('lex')) {
        return lexHash;
      } else {
        return clienteHash;
      }
    });

    console.log(' Ejecutando schema.sql...');

    await connection.query(schema);

    console.log(' Base de datos inicializada correctamente');
    console.log(' Tablas creadas: usuarios, conjuntos, areas, reservas');
    console.log(' Usuarios de ejemplo:');
    console.log('   - admin / admin123 (superadmin)');
    console.log('   - lex / lex123 (usuario)');
    console.log('   - cliente / cliente123 (usuario)');
    
  } catch (error) {
    console.error(' Error al inicializar la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log(' Conexión cerrada');
    }
  }
}

initDatabase();
