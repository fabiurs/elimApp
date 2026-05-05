const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Event = require('./Event');
const User = require('./User');

const EventAssignment = sequelize.define('EventAssignment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'event_id',
    references: { model: Event, key: 'id' },
    onDelete: 'CASCADE',
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['audio', 'video', 'lyrics']],
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: { model: User, key: 'id' },
  },
  responseStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    field: 'response_status',
    validate: {
      isIn: [['pending', 'confirmed', 'declined']],
    },
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'responded_at',
  },
}, {
  tableName: 'event_assignments',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['event_id', 'role'],
    },
  ],
});

Event.hasMany(EventAssignment, { foreignKey: 'eventId', as: 'Assignments' });
EventAssignment.belongsTo(Event, { foreignKey: 'eventId', as: 'Event' });
EventAssignment.belongsTo(User, { foreignKey: 'userId', as: 'Assignee' });

module.exports = EventAssignment;
