const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Room = sequelize.define('Room', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  image_url: { type: DataTypes.STRING },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  amenities: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] }
}, {
  tableName: 'rooms',
  timestamps: false
});

module.exports = Room;
