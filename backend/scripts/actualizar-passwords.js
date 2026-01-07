const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function actualizarPasswords() {
  console.log('Actualizando contraseñas de usuarios...');
  
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : undefined
    });

    console.log('Conectado a MySQL');

    console.log('Generando contraseñas hasheadas...');

    const adminHash = await bcrypt.hash('admin123', 10);
    const lexHash = await bcrypt.hash('lex123', 10);
    const clienteHash = await bcrypt.hash('cliente123', 10);

    await connection.query(
      "UPDATE usuarios SET contraseña = ?, tipo_usuario = 'admin' WHERE usuario = 'admin'",
      [adminHash]
    );
    console.log('Actualizado: admin / admin123 (admin)');

    await connection.query(
      "UPDATE usuarios SET contraseña = ?, tipo_usuario = 'superadmin' WHERE usuario = 'lex'",
      [lexHash]
    );
    console.log('Actualizado: lex / lex123 (superadmin)');

    await connection.query(
      "UPDATE usuarios SET contraseña = ?, tipo_usuario = 'usuario' WHERE usuario = 'cliente'",
      [clienteHash]
    );
    console.log('Actualizado: cliente / cliente123 (usuario)');

    console.log('');
    console.log('Contraseñas actualizadas correctamente');
    console.log('Ahora puedes hacer login con:');
    console.log('  • lex / lex123 (superadmin)');
    console.log('  • admin / admin123 (admin)');
    console.log('  • cliente / cliente123 (usuario)');
    
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

actualizarPasswords();
