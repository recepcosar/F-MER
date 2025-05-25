import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/login.css';
import firatLogo from '../assets/images/firat-logo.svg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('tr');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Kullanıcı adı ve parola gereklidir');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.login({ username, password });
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', response.data.token);
      
      // Yönlendirme yap
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Giriş yapılırken bir hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  // Kayıt sayfasına yönlendirme
  const handleRegister = () => {
    navigate('/register');
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
        <div className="login-box">
          <h2 className="login-title">Merkezi Kimlik<br />Doğrulama Servisi</h2>
          
          <div className="form-content">
            <p className="form-description">Kullanıcı Adı ve Parolanızı giriniz</p>
            
            <div className="language-selector">
              <span 
                className={language === 'en' ? 'active' : ''} 
                onClick={() => setLanguage('en')}
              >
                English
              </span>
              <span>|</span>
              <span 
                className={language === 'tr' ? 'active' : ''} 
                onClick={() => setLanguage('tr')}
              >
                Türkçe
              </span>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
                <span className="input-icon user-icon">👤</span>
              </div>
              
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Parola"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
                <span className="input-icon password-icon">🔒</span>
              </div>
              
              <button 
                type="submit" 
                className="login-btn" 
                disabled={loading}
              >
                {loading ? 'Giriş yapılıyor...' : 'GİRİŞ'}
              </button>
            </form>
            
            <div className="links">
              <a href="/reset-password">Şifre Değiştir</a>
              <span>|</span>
              <a href="/forgot-password">Şifremi Unuttum</a>
              <span>|</span>
              <a href="/register" onClick={(e) => { e.preventDefault(); handleRegister(); }}>Kayıt Ol</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 