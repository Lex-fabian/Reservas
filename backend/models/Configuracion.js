const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  banco: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo_cuenta: {
    type: DataTypes.ENUM('Ahorro', 'Corriente'),
    allowNull: false
  },
  numero_cuenta: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre_titular: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cedula_titular: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'configuracion',
  timestamps: true
});

module.exports = Configuracion;
