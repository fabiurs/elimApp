const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Room = require('./Room');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  eventType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'service', field: 'event_type' },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  startTime: { type: DataTypes.TIME, allowNull: false, field: 'start_time' },
  endTime: { type: DataTypes.TIME, allowNull: false, field: 'end_time' },
  location: { type: DataTypes.STRING, allowNull: true },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'room_id',
    references: { model: Room, key: 'id' },
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by',
    references: { model: User, key: 'id' },
  },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'scheduled' },
  googleEventId: { type: DataTypes.STRING, allowNull: true, field: 'google_event_id' },
}, {
  tableName: 'events',
  timestamps: true,
  underscored: true,
});

Event.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' });
Event.belongsTo(Room, { foreignKey: 'roomId', as: 'Room' });

module.exports = Event;
