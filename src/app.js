// Çevre değişkenlerini yükle
require('dotenv').config();

// Kritik ortam değişkenlerinin varlığını kontrol et
const requiredEnvVars = ['JWT_SECRET', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`HATA: Eksik kritik ortam değişkenleri: ${missingEnvVars.join(', ')}`);
  console.error('Lütfen .env dosyanızı kontrol edin. Güvenlik nedeniyle uygulama başlatılamıyor.');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Express uygulamasını başlat
const app = express();
const PORT = process.env.PORT || 3000;

// Güvenlik middleware'leri
app.use(helmet({
  contentSecurityPolicy: true,
  xssFilter: true,
  hsts: true
}));

// CORS yapılandırması
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : (process.env.NODE_ENV === 'production' ? [] : '*'),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: process.env.NODE_ENV === 'production' ? 60 : 100, // IP başına limit
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parser middleware'leri
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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
  
  const errorResponse = {
    message: 'Sunucu hatası oluştu',
    code: err.status || 500,
    error: process.env.NODE_ENV === 'development' ? err.message : 'İşlem sırasında bir hata oluştu'
  };
  
  // Stack trace'i sadece geliştirme ortamında logluyoruz ama hiçbir zaman istemciye göndermiyor
  res.status(errorResponse.code).json(errorResponse);
});

// Veritabanı bağlantısını test et ve sunucuyu başlat
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');
    
    // Sadece geliştirme ortamında tabloları senkronize et ve asla force kullanma
    if (process.env.NODE_ENV === 'development') {
      // Üretim ortamında manuel migrasyon yapılmalı
      await sequelize.sync({ alter: false });
      console.log('Veritabanı tabloları senkronize edildi.');
    }
    
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor.`);
    });
  } catch (error) {
    console.error('Sunucu başlatılamadı:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 