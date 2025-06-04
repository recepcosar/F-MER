import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/login.css';
import firatLogo from '../assets/images/firat-logo.svg';

const Login = () => {
<<<<<<< HEAD
  const [username, setUsername] = useState('');
=======
  const [email, setEmail] = useState('');
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('tr');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
<<<<<<< HEAD
    if (!username || !password) {
      setError('Kullanıcı adı ve parola gereklidir');
=======
    if (!email || !password) {
      setError('E-posta ve parola gereklidir');
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
<<<<<<< HEAD
      const response = await authService.login({ username, password });
=======
      const response = await authService.login({ email, password });
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
      
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

<<<<<<< HEAD
=======
  // Kayıt sayfasına yönlendirme
  const handleRegister = () => {
    navigate('/register');
  };

>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
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
<<<<<<< HEAD
            <p className="form-description">Kullanıcı Adı ve Parolanızı giriniz</p>
=======
            <p className="form-description">E-posta ve Parolanızı giriniz</p>
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
            
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
<<<<<<< HEAD
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
                <span className="input-icon user-icon">👤</span>
=======
                  type="email"
                  placeholder="E-posta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
                <span className="input-icon user-icon">✉️</span>
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
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
<<<<<<< HEAD
=======
              <span>|</span>
              <a href="/register" onClick={(e) => { e.preventDefault(); handleRegister(); }}>Kayıt Ol</a>
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 