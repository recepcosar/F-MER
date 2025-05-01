const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validateUserRegistration, validateLogin } = require('../middleware/validation');

// Açık rotalar (kimlik doğrulama gerektirmeyen)
router.post('/register', validateUserRegistration, userController.register);
router.post('/login', validateLogin, userController.login);

// Kimlik doğrulama gerektiren rotalar
router.use(authenticate);

// Profil işlemleri
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

module.exports = router; 