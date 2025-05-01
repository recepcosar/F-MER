const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./User');
const { Complaint } = require('./Complaint');

// Bildirim türleri
const NOTIFICATION_TYPES = {
  STATUS_CHANGE: 'durum_değişikliği',
  NEW_COMMENT: 'yeni_yorum',
  ASSIGNED: 'atandı',
  RESOLVED: 'çözüldü',
  SYSTEM: 'sistem'
};

// Bildirim modeli
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM(Object.values(NOTIFICATION_TYPES)),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

// İlişkiler
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Complaint.hasMany(Notification, { foreignKey: 'complaintId', allowNull: true });
Notification.belongsTo(Complaint, { foreignKey: 'complaintId', allowNull: true });

module.exports = { Notification, NOTIFICATION_TYPES }; 