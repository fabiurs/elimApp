const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Room = sequelize.define('Room', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  image_url: { type: DataTypes.STRING, field: 'image_url' },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  amenities: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] }
}, {
  tableName: 'rooms',
  timestamps: false
});

module.exports = Room;
