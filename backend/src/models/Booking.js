const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Room = require('./Room');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  roomId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Room, key: 'id' } },
  date: { type: DataTypes.STRING, allowNull: false },
  startTime: { type: DataTypes.STRING, allowNull: false },
  endTime: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  notes: { type: DataTypes.STRING }
}, {
  tableName: 'bookings',
  timestamps: false
});

Booking.belongsTo(User, { foreignKey: 'userId' });
Booking.belongsTo(Room, { foreignKey: 'roomId' });

module.exports = Booking;
