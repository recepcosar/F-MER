const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin, isSysAdmin } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validation');

// Tüm rotalar kimlik doğrulama ve admin yetkisi gerektirir
router.use(authenticate);
router.use(isAdmin);

// Şikayet yönetimi (admin ve sysadmin için)
router.get('/complaints', adminController.getAllComplaints);
router.put('/complaints/:id/status', adminController.updateComplaintStatus);

// İstatistikler
router.get('/statistics', adminController.getStatistics);

// Kategori işlemleri
router.post('/categories', validateCategory, adminController.createCategory);
router.put('/categories/:id', validateCategory, adminController.updateCategory);

// Kullanıcı yönetimi (sadece system admin için)
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', isSysAdmin, adminController.updateUserStatus);
router.put('/users/:id/role', isSysAdmin, adminController.updateUserRole);

module.exports = router; 