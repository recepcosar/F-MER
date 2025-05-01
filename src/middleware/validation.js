// Kullanıcı kaydı için validasyon
const validateUserRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = [];

  if (!firstName) errors.push('Ad alanı zorunludur');
  if (!lastName) errors.push('Soyad alanı zorunludur');
  
  if (!email) {
    errors.push('E-posta alanı zorunludur');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push('Geçerli bir e-posta adresi giriniz');
  }
  
  if (!password) {
    errors.push('Şifre alanı zorunludur');
  } else if (password.length < 6) {
    errors.push('Şifre en az 6 karakter olmalıdır');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Giriş için validasyon
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  
  if (!email) errors.push('E-posta alanı zorunludur');
  if (!password) errors.push('Şifre alanı zorunludur');
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Şikayet oluşturma için validasyon
const validateComplaint = (req, res, next) => {
  const { title, description, categoryId } = req.body;
  const errors = [];
  
  if (!title) errors.push('Başlık alanı zorunludur');
  if (!description) errors.push('Açıklama alanı zorunludur');
  if (!categoryId) errors.push('Kategori seçimi zorunludur');
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Kategori oluşturma/güncelleme için validasyon
const validateCategory = (req, res, next) => {
  const { name } = req.body;
  const errors = [];
  
  if (!name) errors.push('Kategori adı zorunludur');
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

module.exports = {
  validateUserRegistration,
  validateLogin,
  validateComplaint,
  validateCategory
}; 