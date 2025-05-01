const { User, ROLES } = require('../models/User');
const { generateToken } = require('../config/jwt');

// Kullanıcı kaydı
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, department, phone } = req.body;
    
    // E-posta adresi daha önce kullanılmış mı kontrol et
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }
    
    // Yeni kullanıcı oluştur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      department,
      phone,
      role: ROLES.USER, // Varsayılan olarak normal kullanıcı
      active: true
    });
    
    // JWT token oluştur
    const token = generateToken(user);
    
    // Kullanıcı bilgilerini döndür (şifre hariç)
    res.status(201).json({
      message: 'Kullanıcı kaydı başarılı',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Kullanıcı kaydı sırasında bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kullanıcı girişi
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }
    
    // Kullanıcı aktif mi kontrol et
    if (!user.active) {
      return res.status(401).json({ message: 'Hesabınız devre dışı bırakılmış' });
    }
    
    // Şifreyi kontrol et
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }
    
    // Son giriş zamanını güncelle
    user.lastLogin = new Date();
    await user.save();
    
    // JWT token oluştur
    const token = generateToken(user);
    
    // Kullanıcı bilgilerini döndür
    res.status(200).json({
      message: 'Giriş başarılı',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Giriş sırasında bir hata oluştu', 
      error: error.message 
    });
  }
};

// Kullanıcı profili
const getProfile = async (req, res) => {
  try {
    // req.user middleware'den gelir
    res.status(200).json({ user: req.user.toJSON() });
  } catch (error) {
    res.status(500).json({ 
      message: 'Profil bilgileri alınırken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Profil güncelleme
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, department, phone } = req.body;
    const user = req.user;
    
    // Güvenli güncellenebilir alanları kontrol et
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (department) user.department = department;
    if (phone) user.phone = phone;
    
    await user.save();
    
    res.status(200).json({
      message: 'Profil başarıyla güncellendi',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Profil güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Şifre değiştirme
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    // Mevcut şifreyi kontrol et
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mevcut şifre hatalı' });
    }
    
    // Yeni şifre mevcut şifre ile aynı olmamalı
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Yeni şifre eski şifre ile aynı olamaz' });
    }
    
    // Şifreyi güncelle
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Şifre değiştirilirken bir hata oluştu', 
      error: error.message 
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
}; 