const Usuario = require('./Usuario');
const Conjunto = require('./Conjunto');
const Area = require('./Area');
const Reserva = require('./Reserva');

// Relación many-to-many entre Usuario y Conjunto
Usuario.belongsToMany(Conjunto, { 
  through: 'usuario_conjunto', 
  foreignKey: 'usuarioId',
  otherKey: 'conjuntoId',
  as: 'conjuntos'
});
Conjunto.belongsToMany(Usuario, { 
  through: 'usuario_conjunto', 
  foreignKey: 'conjuntoId',
  otherKey: 'usuarioId',
  as: 'usuarios'
});

Conjunto.hasMany(Area, { foreignKey: 'conjuntoId' });
Area.belongsTo(Conjunto, { foreignKey: 'conjuntoId' });

Usuario.hasMany(Reserva, { foreignKey: 'usuarioId' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Conjunto.hasMany(Reserva, { foreignKey: 'conjuntoId' });
Reserva.belongsTo(Conjunto, { foreignKey: 'conjuntoId' });

Area.hasMany(Reserva, { foreignKey: 'areaId' });
Reserva.belongsTo(Area, { foreignKey: 'areaId' });

module.exports = {
  Usuario,
  Conjunto,
  Area,
  Reserva
};
