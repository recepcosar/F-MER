const { Notification } = require('../models/Notification');

// Kullanıcının bildirimlerini getir
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, unread } = req.query;
    const offset = (page - 1) * limit;
    
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
    res.status(500).json({ 
      message: 'Bildirimler alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Bildirimi okundu olarak işaretle
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
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
    
    res.status(200).json({
      message: 'Bildirim okundu olarak işaretlendi',
      notification
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Bildirim güncellenirken bir hata oluştu', 
      error: error.message 
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
    
    res.status(200).json({
      message: 'Tüm bildirimler okundu olarak işaretlendi',
      updatedCount: result[0]
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Bildirimler güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Bildirimi sil
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
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
    
    res.status(200).json({
      message: 'Bildirim başarıyla silindi'
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Bildirim silinirken bir hata oluştu', 
      error: error.message 
    });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
}; 