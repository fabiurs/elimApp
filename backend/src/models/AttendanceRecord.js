const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Event = require('./Event');
const User = require('./User');

const AttendanceRecord = sequelize.define('AttendanceRecord', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'event_id',
    references: { model: Event, key: 'id' },
    onDelete: 'SET NULL',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: { model: User, key: 'id' },
    onDelete: 'SET NULL',
  },
  attendanceDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'attendance_date' },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['event', 'volunteer', 'ministry']],
    },
  },
  ministry: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'present',
    validate: {
      isIn: [['present', 'absent', 'late', 'excused']],
    },
  },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  checkInAt: { type: DataTypes.DATE, allowNull: true, field: 'check_in_at' },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'attendance_records',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['attendance_date'] },
    { fields: ['category', 'attendance_date'] },
    { fields: ['user_id', 'attendance_date'] },
    { fields: ['event_id', 'attendance_date'] },
  ],
});

Event.hasMany(AttendanceRecord, { foreignKey: 'eventId', as: 'AttendanceRecords' });
AttendanceRecord.belongsTo(Event, { foreignKey: 'eventId', as: 'Event' });
AttendanceRecord.belongsTo(User, { foreignKey: 'userId', as: 'User' });

module.exports = AttendanceRecord;
