const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Room = require('./Room');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id', references: { model: User, key: 'id' } },
  roomId: { type: DataTypes.INTEGER, allowNull: false, field: 'room_id', references: { model: Room, key: 'id' } },
  date: { type: DataTypes.DATEONLY, allowNull: false, field: 'booking_date' },
  startTime: { type: DataTypes.TIME, allowNull: false, field: 'start_time' },
  endTime: { type: DataTypes.TIME, allowNull: false, field: 'end_time' },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT }
}, {
  tableName: 'bookings',
  timestamps: false
});

Booking.belongsTo(User, { foreignKey: 'user_id' });
Booking.belongsTo(Room, { foreignKey: 'room_id' });

module.exports = Booking;
