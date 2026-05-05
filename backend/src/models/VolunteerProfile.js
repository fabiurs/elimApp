const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const VolunteerProfile = sequelize.define('VolunteerProfile', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  phone: { type: DataTypes.STRING, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  autoAssignable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'auto_assignable' },
  preferredRoles: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [], field: 'preferred_roles' },
}, {
  tableName: 'volunteer_profiles',
  timestamps: true,
  underscored: true,
});

User.hasOne(VolunteerProfile, { foreignKey: 'userId', as: 'VolunteerProfile' });
VolunteerProfile.belongsTo(User, { foreignKey: 'userId', as: 'User' });

module.exports = VolunteerProfile;
