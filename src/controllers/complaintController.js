const { Complaint, STATUSES, PRIORITIES } = require('../models/Complaint');
const { Category } = require('../models/Category');
const { Comment } = require('../models/Comment');
const { Notification, NOTIFICATION_TYPES } = require('../models/Notification');
const { User, ROLES } = require('../models/User');
const { Op } = require('sequelize');

// Yeni şikayet oluşturma
const createComplaint = async (req, res) => {
  try {
    const { title, description, categoryId, priority } = req.body;
    
    // Kategori kontrolü
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Belirtilen kategori bulunamadı' });
    }
    
    // Yeni şikayet oluştur
    const complaint = await Complaint.create({
      title,
      description,
      priority: priority || PRIORITIES.MEDIUM,
      status: STATUSES.NEW,
      userId: req.user.id,
      categoryId
    });
    
    // İlişkili verileri getir
    const complaintWithDetails = await Complaint.findByPk(complaint.id, {
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Category, attributes: ['id', 'name'] }
      ]
    });
    
    // Yöneticilere bildirim gönder
    const admins = await User.findAll({
      where: {
        role: {
          [Op.or]: [ROLES.ADMIN, ROLES.SYSADMIN]
        },
        active: true
      }
    });
    
    // Her yönetici için bildirim oluştur
    const notifications = admins.map(admin => ({
      type: NOTIFICATION_TYPES.SYSTEM,
      message: `Yeni bir şikayet oluşturuldu: ${complaint.title}`,
      userId: admin.id,
      complaintId: complaint.id,
      data: { complaintId: complaint.complaintId }
    }));
    
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }
    
    res.status(201).json({
      message: 'Şikayet başarıyla oluşturuldu',
      complaint: complaintWithDetails
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Şikayet oluşturulurken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kullanıcının kendi şikayetlerini görüntüleme
const getUserComplaints = async (req, res) => {
  try {
    const { status, priority, sort, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Filtre koşullarını oluştur
    const whereConditions = { userId: req.user.id };
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (priority) {
      whereConditions.priority = priority;
    }
    
    // Sıralama seçenekleri
    const order = [];
    if (sort === 'oldest') {
      order.push(['createdAt', 'ASC']);
    } else if (sort === 'priority-high') {
      order.push(['priority', 'DESC']);
    } else if (sort === 'priority-low') {
      order.push(['priority', 'ASC']);
    } else {
      // Varsayılan: En yeni önce
      order.push(['createdAt', 'DESC']);
    }
    
    // Şikayetleri getir
    const { count, rows: complaints } = await Complaint.findAndCountAll({
      where: whereConditions,
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { 
          model: User, 
          as: 'Resolver',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Sayfalama bilgisi
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      complaints,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Şikayetler listelenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Şikayet detayı görüntüleme
const getComplaintDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Şikayet detaylarını getir
    const complaint = await Complaint.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'department'] },
        { model: Category, attributes: ['id', 'name'] },
        { 
          model: User, 
          as: 'Resolver',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Comment,
          include: [
            { model: User, attributes: ['id', 'firstName', 'lastName', 'role'] }
          ],
          where: { 
            [Op.or]: [
              { isPrivate: false },
              { isPrivate: true, userId: req.user.id },
              sequelize.literal(`(User.role = 'admin' OR User.role = 'sysadmin')`)
            ]
          },
          required: false
        }
      ]
    });
    
    if (!complaint) {
      return res.status(404).json({ message: 'Şikayet bulunamadı' });
    }
    
    // Güvenlik kontrolü: Yalnızca şikayeti oluşturan kullanıcı veya yöneticiler görebilir
    if (complaint.userId !== req.user.id && !['admin', 'sysadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Bu şikayeti görüntüleme yetkiniz yok' });
    }
    
    res.status(200).json({ complaint });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Şikayet detayları alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Şikayet güncelleme (yalnızca başlık, açıklama ve kategori)
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId } = req.body;
    
    // Şikayeti bul
    const complaint = await Complaint.findByPk(id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Şikayet bulunamadı' });
    }
    
    // Güvenlik kontrolü: Yalnızca şikayeti oluşturan kullanıcı güncelleyebilir
    if (complaint.userId !== req.user.id) {
      return res.status(403).json({ message: 'Bu şikayeti güncelleme yetkiniz yok' });
    }
    
    // Şikayet çözülmüş veya kapatılmışsa güncelleme yapamazsın
    if (['çözüldü', 'kapatıldı', 'reddedildi'].includes(complaint.status)) {
      return res.status(400).json({ 
        message: 'Çözülmüş veya kapatılmış şikayetler güncellenemez' 
      });
    }
    
    // Kategori kontrolü
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Belirtilen kategori bulunamadı' });
      }
      complaint.categoryId = categoryId;
    }
    
    // Şikayeti güncelle
    if (title) complaint.title = title;
    if (description) complaint.description = description;
    
    await complaint.save();
    
    // Güncellenmiş şikayeti getir
    const updatedComplaint = await Complaint.findByPk(id, {
      include: [
        { model: Category, attributes: ['id', 'name'] }
      ]
    });
    
    res.status(200).json({
      message: 'Şikayet başarıyla güncellendi',
      complaint: updatedComplaint
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Şikayet güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Şikayet iptal etme
const cancelComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Şikayeti bul
    const complaint = await Complaint.findByPk(id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Şikayet bulunamadı' });
    }
    
    // Güvenlik kontrolü: Yalnızca şikayeti oluşturan kullanıcı iptal edebilir
    if (complaint.userId !== req.user.id) {
      return res.status(403).json({ message: 'Bu şikayeti iptal etme yetkiniz yok' });
    }
    
    // Şikayet çözülmüş veya kapatılmışsa iptal edilemez
    if (['çözüldü', 'kapatıldı', 'reddedildi'].includes(complaint.status)) {
      return res.status(400).json({ 
        message: 'Çözülmüş veya kapatılmış şikayetler iptal edilemez' 
      });
    }
    
    // Şikayeti iptal et (kapatıldı olarak işaretle)
    complaint.status = STATUSES.CLOSED;
    complaint.adminNotes = complaint.adminNotes 
      ? `${complaint.adminNotes}\n\nKullanıcı tarafından iptal edildi.` 
      : 'Kullanıcı tarafından iptal edildi.';
      
    await complaint.save();
    
    res.status(200).json({
      message: 'Şikayet başarıyla iptal edildi',
      complaint
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Şikayet iptal edilirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Yeni yorum ekleme
const addComment = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    const { content, isPrivate } = req.body;
    
    // Şikayeti bul
    const complaint = await Complaint.findByPk(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Şikayet bulunamadı' });
    }
    
    // Güvenlik kontrolü: Yalnızca şikayeti oluşturan kullanıcı veya yöneticiler yorum yapabilir
    if (complaint.userId !== req.user.id && !['admin', 'sysadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Bu şikayete yorum yapma yetkiniz yok' });
    }
    
    // Yeni yorum ekle
    const comment = await Comment.create({
      content,
      isPrivate: isPrivate || false,
      userId: req.user.id,
      complaintId
    });
    
    // Yorumu kullanıcı bilgisiyle birlikte al
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'role'] }
      ]
    });
    
    // Şikayet sahibine veya yöneticiye bildirim gönder
    let notificationTargetId;
    
    if (req.user.id === complaint.userId) {
      // Kullanıcı kendi şikayetine yorum yapmış, yöneticileri bilgilendir
      const admins = await User.findAll({
        where: {
          role: {
            [Op.or]: [ROLES.ADMIN, ROLES.SYSADMIN]
          },
          active: true
        }
      });
      
      // Her yönetici için bildirim oluştur
      const notifications = admins.map(admin => ({
        type: NOTIFICATION_TYPES.NEW_COMMENT,
        message: `${req.user.firstName} ${req.user.lastName} şikayetine yeni bir yorum ekledi: ${complaint.title}`,
        userId: admin.id,
        complaintId,
        data: { commentId: comment.id }
      }));
      
      if (notifications.length > 0) {
        await Notification.bulkCreate(notifications);
      }
    } else {
      // Yönetici yorum yapmış, kullanıcıyı bilgilendir
      await Notification.create({
        type: NOTIFICATION_TYPES.NEW_COMMENT,
        message: `Şikayetinize yeni bir yorum eklendi: ${complaint.title}`,
        userId: complaint.userId,
        complaintId,
        data: { commentId: comment.id }
      });
    }
    
    res.status(201).json({
      message: 'Yorum başarıyla eklendi',
      comment: commentWithUser
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Yorum eklenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Tüm kategorileri listele
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { active: true },
      attributes: ['id', 'name', 'description']
    });
    
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ 
      message: 'Kategoriler listelenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  getComplaintDetails,
  updateComplaint,
  cancelComplaint,
  addComment,
  getCategories
}; 