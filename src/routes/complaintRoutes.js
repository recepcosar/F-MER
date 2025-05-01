const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticate } = require('../middleware/auth');
const { validateComplaint } = require('../middleware/validation');

// Tüm routelar kimlik doğrulama gerektirir
router.use(authenticate);

// Kategoriler (herkese açık)
router.get('/categories', complaintController.getCategories);

// Şikayet işlemleri
router.post('/', validateComplaint, complaintController.createComplaint);
router.get('/', complaintController.getUserComplaints);
router.get('/:id', complaintController.getComplaintDetails);
router.put('/:id', complaintController.updateComplaint);
router.post('/:id/cancel', complaintController.cancelComplaint);

// Yorum işlemleri
router.post('/:id/comments', complaintController.addComment);

module.exports = router; 