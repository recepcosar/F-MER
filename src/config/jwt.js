const jwt = require('jsonwebtoken');
require('dotenv').config();

// Token oluşturma fonksiyonu
const generateToken = (user) => {
  const secretKey = process.env.JWT_SECRET;
  
  // JWT_SECRET ortam değişkeni tanımlanmamışsa hata fırlat
  if (!secretKey) {
    throw new Error('JWT_SECRET ortam değişkeni tanımlanmamış. Güvenlik nedeniyle varsayılan anahtar kullanılmıyor.');
  }
  
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    secretKey,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    }
  );
};

// Token doğrulama fonksiyonu
const verifyToken = (token) => {
  try {
    const secretKey = process.env.JWT_SECRET;
    
    // JWT_SECRET ortam değişkeni tanımlanmamışsa hata fırlat
    if (!secretKey) {
      throw new Error('JWT_SECRET ortam değişkeni tanımlanmamış. Güvenlik nedeniyle varsayılan anahtar kullanılmıyor.');
    }
    
    return jwt.verify(token, secretKey);
  } catch (error) {
    throw new Error('Geçersiz veya süresi dolmuş token');
  }
};

module.exports = {
  generateToken,
  verifyToken
}; 