const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conjunto = sequelize.define('Conjunto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_conjunto: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'conjuntos',
  timestamps: true
});

module.exports = Conjunto;
