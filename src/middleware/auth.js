const { verifyToken } = require('../config/jwt');
const { User, ROLES } = require('../models/User');

// Token doğrulama middleware'i
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Giriş yapmanız gerekiyor' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı veya hesap devre dışı' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Kimlik doğrulama başarısız', error: error.message });
  }
};

// Rol kontrolü middleware factory'si
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Giriş yapmanız gerekiyor' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Bu işlem için gerekli yetkiye sahip değilsiniz' 
      });
    }
    
    next();
  };
};

// Yalnızca admin ve sysadmin'ler için
const isAdmin = authorize(ROLES.ADMIN, ROLES.SYSADMIN);

// Yalnızca sysadmin için
const isSysAdmin = authorize(ROLES.SYSADMIN);

module.exports = {
  authenticate,
  authorize,
  isAdmin,
  isSysAdmin
}; 