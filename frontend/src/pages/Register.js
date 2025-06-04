import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/login.css';
import firatLogo from '../assets/images/firat-logo.svg';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Tüm alanları doldurunuz');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Parolalar eşleşmiyor');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Hata ayıklama için verileri konsola yazdır
      console.log('Gönderilen kayıt verileri:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: '********' // Güvenlik için şifreyi gizle
      });
      
      // API'ye kayıt isteği gönder
      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Kayıt başarılı, API yanıtı:', response.data);
      
      setSuccess('Kaydınız başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...');
      
      // 2 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      console.error('Kayıt hatası:', err);
      console.error('Hata detayları:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      setError(
        err.response?.data?.message || 'Kayıt olurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="header">
        <div className="logo-container">
          <img src={firatLogo} alt="Fırat Üniversitesi Logo" className="logo" />
          <h1 className="university-name">Fırat Üniversitesi</h1>
        </div>
        <div className="shortcuts">
          <div className="dropdown">
            <button className="dropdown-btn">Kısayollar ▼</button>
          </div>
        </div>
      </div>

      <div className="login-form-container">
        <div className="login-box register-box">
          <h2 className="login-title">Kullanıcı Kaydı</h2>
          
          <div className="form-content">
            <p className="form-description">Yeni hesap oluşturmak için bilgilerinizi giriniz</p>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Adınız"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
                <span className="input-icon">👤</span>
              </div>
              
              <div className="input-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Soyadınız"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
                <span className="input-icon">👤</span>
              </div>
              
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="E-posta Adresi"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
                <span className="input-icon">✉️</span>
              </div>
              
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Parola"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
                <span className="input-icon">🔒</span>
              </div>
              
              <div className="input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Parola Tekrar"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
                <span className="input-icon">🔒</span>
              </div>
              
              <button 
                type="submit" 
                className="login-btn" 
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'KAYIT OL'}
              </button>
            </form>
            
            <div className="links">
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                Giriş Sayfasına Dön
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 