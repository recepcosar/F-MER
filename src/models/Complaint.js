const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./User');
const { Category } = require('./Category');

// Şikayet öncelik seviyeleri
const PRIORITIES = {
  LOW: 'düşük',
  MEDIUM: 'orta',
  HIGH: 'yüksek'
};

// Şikayet durumları
const STATUSES = {
  NEW: 'yeni',
  IN_PROGRESS: 'inceleniyor',
  RESOLVED: 'çözüldü',
  CLOSED: 'kapatıldı',
  REJECTED: 'reddedildi'
};

// Şikayet modeli
const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  complaintId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(Object.values(STATUSES)),
    allowNull: false,
    defaultValue: STATUSES.NEW
  },
  priority: {
    type: DataTypes.ENUM(Object.values(PRIORITIES)),
    allowNull: false,
    defaultValue: PRIORITIES.MEDIUM
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: (complaint) => {
      // Benzersiz şikayet ID'si oluştur (ŞK-YILAYGUN-000X formatında)
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      complaint.complaintId = `ŞK-${year}${month}${day}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }
});

// İlişkiler
User.hasMany(Complaint, { foreignKey: 'userId' });
Complaint.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Complaint, { foreignKey: 'categoryId' });
Complaint.belongsTo(Category, { foreignKey: 'categoryId' });

// Admin/Yönetici ilişkisi (şikayeti çözen kişi)
User.hasMany(Complaint, { foreignKey: 'resolvedBy', as: 'ResolvedComplaints' });
Complaint.belongsTo(User, { foreignKey: 'resolvedBy', as: 'Resolver' });

module.exports = { Complaint, PRIORITIES, STATUSES }; 