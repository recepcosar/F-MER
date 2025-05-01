const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./User');
const { Complaint } = require('./Complaint');

// Yorum modeli
const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// İlişkiler
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Complaint.hasMany(Comment, { foreignKey: 'complaintId' });
Comment.belongsTo(Complaint, { foreignKey: 'complaintId' });

module.exports = { Comment }; 