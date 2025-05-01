const jwt = require('jsonwebtoken');
require('dotenv').config();

// Token oluşturma fonksiyonu
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET || 'gizli_anahtar',
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    }
  );
};

// Token doğrulama fonksiyonu
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar');
  } catch (error) {
    throw new Error('Geçersiz veya süresi dolmuş token');
  }
};

module.exports = {
  generateToken,
  verifyToken
}; 