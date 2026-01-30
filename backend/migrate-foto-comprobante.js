const { sequelize } = require('./config/database');

async function runMigration() {
  try {
    console.log('🔄 Iniciando migración de foto_comprobante...');
    
    // Cambiar tipo de columna a LONGTEXT
    await sequelize.query(`
      ALTER TABLE reservas 
      MODIFY COLUMN foto_comprobante LONGTEXT;
    `);
    
    console.log('✅ Migración completada exitosamente!');
    console.log('✅ La columna foto_comprobante ahora es LONGTEXT');
    
    // Verificar el cambio
    const [results] = await sequelize.query(`
      DESCRIBE reservas;
    `);
    
    const fotoComprobanteColumn = results.find(col => col.Field === 'foto_comprobante');
    console.log('\n📋 Información de la columna foto_comprobante:');
    console.log(fotoComprobanteColumn);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar migración
runMigration();
