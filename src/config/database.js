const { Sequelize } = require('sequelize');
require('../../env.js'); // Doğrudan ortam değişkenlerini yükle

// Veritabanı bağlantı bilgilerini ortam değişkenlerinden al
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sikayet_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    }
  }
);

module.exports = { sequelize }; 