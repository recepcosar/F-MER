const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Tüm rotalar kimlik doğrulama gerektirir
router.use(authenticate);

// Bildirim işlemleri
router.get('/', notificationController.getUserNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router; 