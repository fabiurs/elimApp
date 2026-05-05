const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const VolunteerBlackout = sequelize.define('VolunteerBlackout', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  startDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'start_date' },
  endDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'end_date' },
  reason: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'volunteer_blackouts',
  timestamps: false,
  indexes: [
    { fields: ['user_id', 'start_date', 'end_date'] },
  ],
});

User.hasMany(VolunteerBlackout, { foreignKey: 'userId', as: 'Blackouts' });
VolunteerBlackout.belongsTo(User, { foreignKey: 'userId', as: 'User' });

module.exports = VolunteerBlackout;
