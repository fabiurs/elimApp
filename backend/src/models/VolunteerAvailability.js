const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const VolunteerAvailability = sequelize.define('VolunteerAvailability', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'day_of_week',
    validate: { min: 0, max: 6 },
  },
  startTime: { type: DataTypes.TIME, allowNull: false, field: 'start_time' },
  endTime: { type: DataTypes.TIME, allowNull: false, field: 'end_time' },
}, {
  tableName: 'volunteer_availabilities',
  timestamps: false,
  indexes: [
    { fields: ['user_id', 'day_of_week'] },
  ],
});

User.hasMany(VolunteerAvailability, { foreignKey: 'userId', as: 'Availabilities' });
VolunteerAvailability.belongsTo(User, { foreignKey: 'userId', as: 'User' });

module.exports = VolunteerAvailability;
