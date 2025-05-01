const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Çevre değişkenlerini yükle
require('dotenv').config();

// Express uygulamasını başlat
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware'leri yapılandır
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API rotalarını ayarla
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Ana sayfa
app.get('/', (req, res) => {
  res.json({ message: 'Şikayet ve Öneri Yönetim Sistemi API' });
});

// 404 hata yakalama
app.use((req, res, next) => {
  res.status(404).json({ message: 'İstenilen kaynak bulunamadı' });
});

// Genel hata yakalama
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Sunucu hatası oluştu',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Veritabanı bağlantısını test et ve sunucuyu başlat
sequelize.authenticate()
  .then(() => {
    console.log('Veritabanı bağlantısı başarılı.');
    
    // Veritabanı tablolarını senkronize et (geliştirme aşamasında)
    return sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor.`);
    });
  })
  .catch(err => {
    console.error('Veritabanı bağlantısı başarısız:', err);
  });

module.exports = app; 