import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authService.getProfile();
        setUser(response.data);
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı', error);
        // Token geçersiz veya oturum süresi dolmuş olabilir
        localStorage.removeItem('token');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Şikayet ve Öneri Yönetim Sistemi</h1>
        <div className="user-info">
          <span>Hoş Geldiniz, {user.name}</span>
          <button onClick={handleLogout} className="logout-btn">Çıkış Yap</button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <h2>Kontrol Paneli</h2>
        <p>Burası ana kontrol panelidir. Uygulamanın diğer bölümlerine buradan erişebilirsiniz.</p>
      </div>
    </div>
  );
};

export default Dashboard; 