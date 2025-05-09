const { Notification } = require('../models/Notification');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');

// Kullanıcının bildirimlerini getir
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, unread } = req.query;
    const offset = (page - 1) * limit;
    
    // Input validasyonu
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Filtre koşullarını oluştur
    const whereConditions = { userId };
    
    if (unread === 'true') {
      whereConditions.isRead = false;
    }
    
    // Bildirimleri getir
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Sayfalama bilgisi
    const totalPages = Math.ceil(count / limit);
    
    // Okunmamış bildirim sayısı
    const unreadCount = await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    
    logger.info(`Kullanıcı ${userId} için ${notifications.length} bildirim getirildi`);
    
    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
    
  } catch (error) {
    logger.error('Bildirimler alınırken hata:', error);
    res.status(500).json({ 
      message: 'Bildirimler alınırken bir hata oluştu'
    });
  }
};

// Bildirimi okundu olarak işaretle
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Input validasyonu
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Bildirimi bul
    const notification = await Notification.findOne({
      where: {
        id,
        userId
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }
    
    // Bildirimi okundu olarak işaretle
    notification.isRead = true;
    await notification.save();
    
    logger.info(`Bildirim ${id} okundu olarak işaretlendi`);
    
    res.status(200).json({
      message: 'Bildirim okundu olarak işaretlendi',
      notification
    });
    
  } catch (error) {
    logger.error('Bildirim güncellenirken hata:', error);
    res.status(500).json({ 
      message: 'Bildirim güncellenirken bir hata oluştu'
    });
  }
};

// Tüm bildirimleri okundu olarak işaretle
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Tüm okunmamış bildirimleri güncelle
    const result = await Notification.update(
      { isRead: true },
      {
        where: {
          userId,
          isRead: false
        }
      }
    );
    
    logger.info(`Kullanıcı ${userId} için ${result[0]} bildirim okundu olarak işaretlendi`);
    
    res.status(200).json({
      message: 'Tüm bildirimler okundu olarak işaretlendi',
      updatedCount: result[0]
    });
    
  } catch (error) {
    logger.error('Bildirimler güncellenirken hata:', error);
    res.status(500).json({ 
      message: 'Bildirimler güncellenirken bir hata oluştu'
    });
  }
};

// Bildirimi sil
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Input validasyonu
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Bildirimi bul
    const notification = await Notification.findOne({
      where: {
        id,
        userId
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }
    
    // Bildirimi sil
    await notification.destroy();
    
    logger.info(`Bildirim ${id} silindi`);
    
    res.status(200).json({
      message: 'Bildirim başarıyla silindi'
    });
    
  } catch (error) {
    logger.error('Bildirim silinirken hata:', error);
    res.status(500).json({ 
      message: 'Bildirim silinirken bir hata oluştu'
    });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
}; 