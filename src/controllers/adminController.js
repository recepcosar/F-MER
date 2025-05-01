const { User, ROLES } = require('../models/User');
const { Category } = require('../models/Category');
const { Complaint, STATUSES, PRIORITIES } = require('../models/Complaint');
const { Notification, NOTIFICATION_TYPES } = require('../models/Notification');
const { Op, fn, col, literal } = require('sequelize');

// Tüm şikayetleri listele (yöneticiler için)
const getAllComplaints = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      categoryId, 
      userId, 
      search,
      sort = 'newest', 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Filtre koşullarını oluştur
    const whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (priority) {
      whereConditions.priority = priority;
    }
    
    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }
    
    if (userId) {
      whereConditions.userId = userId;
    }
    
    // Arama sorgusu
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { complaintId: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Sıralama seçenekleri
    const order = [];
    if (sort === 'oldest') {
      order.push(['createdAt', 'ASC']);
    } else if (sort === 'priority-high') {
      order.push(['priority', 'DESC']);
    } else if (sort === 'priority-low') {
      order.push(['priority', 'ASC']);
    } else if (sort === 'status') {
      order.push(['status', 'ASC']);
    } else {
      // Varsayılan: En yeni önce
      order.push(['createdAt', 'DESC']);
    }
    
    // Şikayetleri getir
    const { count, rows: complaints } = await Complaint.findAndCountAll({
      where: whereConditions,
      include: [
        { 
          model: User, 
          attributes: ['id', 'firstName', 'lastName', 'email', 'department'] 
        },
        { 
          model: Category, 
          attributes: ['id', 'name'] 
        },
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

// Şikayet durumunu güncelleme
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNotes, resolution } = req.body;
    
    // Şikayeti bul
    const complaint = await Complaint.findByPk(id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Şikayet bulunamadı' });
    }
    
    // Şikayeti güncelle
    const updates = {};
    let statusChanged = false;
    let priorityChanged = false;
    
    if (status && Object.values(STATUSES).includes(status) && status !== complaint.status) {
      updates.status = status;
      statusChanged = true;
      
      // Çözüldü durumuna geçerken, çözüm tarihi ve çözen admin bilgisini ekle
      if (status === STATUSES.RESOLVED) {
        updates.resolvedAt = new Date();
        updates.resolvedBy = req.user.id;
        
        if (resolution) {
          updates.resolution = resolution;
        } else {
          return res.status(400).json({ 
            message: 'Çözüm açıklaması zorunludur' 
          });
        }
      }
    }
    
    if (priority && Object.values(PRIORITIES).includes(priority) && priority !== complaint.priority) {
      updates.priority = priority;
      priorityChanged = true;
    }
    
    if (adminNotes) {
      updates.adminNotes = complaint.adminNotes 
        ? `${complaint.adminNotes}\n\n${new Date().toLocaleString()}: ${adminNotes}` 
        : `${new Date().toLocaleString()}: ${adminNotes}`;
    }
    
    // Değişiklik varsa güncelle
    if (Object.keys(updates).length > 0) {
      await complaint.update(updates);
      
      // Şikayet sahibine bildirim gönder
      if (statusChanged || priorityChanged) {
        let message = '';
        
        if (statusChanged) {
          message = `Şikayetinizin durumu güncellendi: ${complaint.title} - Yeni durum: ${status}`;
        } else if (priorityChanged) {
          message = `Şikayetinizin önceliği güncellendi: ${complaint.title} - Yeni öncelik: ${priority}`;
        }
        
        await Notification.create({
          type: NOTIFICATION_TYPES.STATUS_CHANGE,
          message,
          userId: complaint.userId,
          complaintId: complaint.id,
          data: { complaintId: complaint.complaintId }
        });
      }
      
      // Güncellenmiş şikayeti getir
      const updatedComplaint = await Complaint.findByPk(id, {
        include: [
          { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Category, attributes: ['id', 'name'] },
          { 
            model: User, 
            as: 'Resolver',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ]
      });
      
      res.status(200).json({
        message: 'Şikayet durumu başarıyla güncellendi',
        complaint: updatedComplaint
      });
    } else {
      res.status(400).json({ message: 'Güncellenecek bir değişiklik belirtilmedi' });
    }
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Şikayet durumu güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kullanıcı listesini getir
const getUsers = async (req, res) => {
  try {
    const { role, search, active, sort = 'name', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Filtre koşullarını oluştur
    const whereConditions = {};
    
    if (role) {
      whereConditions.role = role;
    }
    
    if (active !== undefined) {
      whereConditions.active = active === 'true';
    }
    
    // Arama sorgusu
    if (search) {
      whereConditions[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { department: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Sıralama seçenekleri
    const order = [];
    if (sort === 'name') {
      order.push(['firstName', 'ASC'], ['lastName', 'ASC']);
    } else if (sort === 'email') {
      order.push(['email', 'ASC']);
    } else if (sort === 'role') {
      order.push(['role', 'ASC']);
    } else if (sort === 'lastLogin') {
      order.push(['lastLogin', 'DESC']);
    } else {
      // Varsayılan: İsme göre
      order.push(['firstName', 'ASC'], ['lastName', 'ASC']);
    }
    
    // SysAdmin hariç tüm kullanıcıları getir
    const { count, rows: users } = await User.findAndCountAll({
      where: {
        ...whereConditions,
        role: { [Op.ne]: ROLES.SYSADMIN } // SysAdmin görünmesin
      },
      attributes: { exclude: ['password'] },
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Sayfalama bilgisi
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Kullanıcılar listelenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kullanıcı durumunu güncelle (aktif/pasif)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    // SysAdmin rolünde olmayan kullanıcıyı bul
    const user = await User.findOne({
      where: {
        id,
        role: { [Op.ne]: ROLES.SYSADMIN }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Kullanıcı durumunu güncelle
    user.active = active;
    await user.save();
    
    res.status(200).json({
      message: `Kullanıcı ${active ? 'aktif' : 'pasif'} duruma getirildi`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        active: user.active
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Kullanıcı durumu güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kullanıcı rolünü güncelle
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Geçerli bir rol mü kontrol et
    if (!Object.values(ROLES).includes(role) || role === ROLES.SYSADMIN) {
      return res.status(400).json({ message: 'Geçersiz rol' });
    }
    
    // SysAdmin rolünde olmayan kullanıcıyı bul
    const user = await User.findOne({
      where: {
        id,
        role: { [Op.ne]: ROLES.SYSADMIN }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Kullanıcı rolünü güncelle
    user.role = role;
    await user.save();
    
    res.status(200).json({
      message: 'Kullanıcı rolü güncellendi',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Kullanıcı rolü güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kategori ekle
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Kategori adı daha önce kullanılmış mı kontrol et
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Bu kategori adı zaten kullanılıyor' });
    }
    
    // Kategori oluştur
    const category = await Category.create({
      name,
      description,
      active: true
    });
    
    res.status(201).json({
      message: 'Kategori başarıyla oluşturuldu',
      category
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Kategori oluşturulurken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kategori güncelle
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;
    
    // Kategoriyi bul
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }
    
    // İsim değişiyorsa, bu isimde başka kategori var mı kontrol et
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({ message: 'Bu kategori adı zaten kullanılıyor' });
      }
      category.name = name;
    }
    
    // Diğer alanları güncelle
    if (description !== undefined) category.description = description;
    if (active !== undefined) category.active = active;
    
    await category.save();
    
    res.status(200).json({
      message: 'Kategori başarıyla güncellendi',
      category
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Kategori güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// İstatistikleri getir
const getStatistics = async (req, res) => {
  try {
    // Toplam şikayet sayısı
    const totalComplaints = await Complaint.count();
    
    // Durumlara göre şikayet sayıları
    const statusCounts = await Complaint.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status']
    });
    
    // Önceliğe göre şikayet sayıları
    const priorityCounts = await Complaint.findAll({
      attributes: [
        'priority',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['priority']
    });
    
    // Kategorilere göre şikayet sayıları
    const categoryCounts = await Complaint.findAll({
      attributes: [
        'categoryId',
        [fn('COUNT', col('id')), 'count']
      ],
      include: [
        { 
          model: Category, 
          attributes: ['name'],
          required: true
        }
      ],
      group: ['categoryId']
    });
    
    // Aylık şikayet sayıları (son 6 ay)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyCounts = await Complaint.findAll({
      attributes: [
        [fn('YEAR', col('createdAt')), 'year'],
        [fn('MONTH', col('createdAt')), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      group: [fn('YEAR', col('createdAt')), fn('MONTH', col('createdAt'))],
      order: [
        [fn('YEAR', col('createdAt')), 'ASC'],
        [fn('MONTH', col('createdAt')), 'ASC']
      ]
    });
    
    // Toplam aktif kullanıcı sayısı
    const totalUsers = await User.count({
      where: { active: true }
    });
    
    // Ortalama çözüm süresi (gün olarak)
    const avgResolutionTime = await Complaint.findAll({
      attributes: [
        [fn('AVG', literal('TIMESTAMPDIFF(DAY, createdAt, resolvedAt)')), 'avgDays']
      ],
      where: {
        status: STATUSES.RESOLVED,
        resolvedAt: { [Op.ne]: null }
      }
    });
    
    res.status(200).json({
      totalComplaints,
      statusCounts,
      priorityCounts,
      categoryCounts,
      monthlyCounts,
      totalUsers,
      avgResolutionTime: avgResolutionTime[0]?.dataValues?.avgDays || 0
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'İstatistikler alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllComplaints,
  updateComplaintStatus,
  getUsers,
  updateUserStatus,
  updateUserRole,
  createCategory,
  updateCategory,
  getStatistics
}; 