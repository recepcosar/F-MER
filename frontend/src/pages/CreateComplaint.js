import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateComplaint.css';

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    attachments: []
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Kullanıcı bilgilerini ve kategorileri yükle
  useEffect(() => {
    const fetchUserAndCategories = async () => {
      try {
        // Backend API'ye token ile istek gönder
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        // Kullanıcı bilgilerini al
        const userResponse = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!userResponse.ok) {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }
        
        const userData = await userResponse.json();
        setUser(userData);

        // Kategorileri al
        const categoriesResponse = await fetch('/api/complaints/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!categoriesResponse.ok) {
          throw new Error('Kategoriler alınamadı');
        }
        
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError('Bilgiler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndCategories();
  }, [navigate]);

  // Form değişikliklerini işle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Dosya yüklemelerini işle
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      attachments: Array.from(e.target.files)
    });
  };

  // Formu gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Zorunlu alanları kontrol et
      if (!formData.title || !formData.category || !formData.description) {
        setError('Lütfen tüm zorunlu alanları doldurun.');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Form verilerini hazırla
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      
      // Ekleri ekle
      if (formData.attachments.length > 0) {
        formData.attachments.forEach(file => {
          formDataToSend.append('attachments', file);
        });
      }

      // Şikayet oluştur API isteği
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şikayet oluşturulurken bir hata meydana geldi');
      }

      setSuccess('Şikayetiniz başarıyla oluşturuldu!');
      // Formu temizle
      setFormData({
        title: '',
        category: '',
        description: '',
        attachments: []
      });
    } catch (error) {
      console.error('Şikayet oluşturma hatası:', error);
      setError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="create-complaint-container">
      <header className="header">
        <h1>Şikayet ve Öneri Yönetim Sistemi</h1>
        <div className="user-info">
          <span>Hoş Geldiniz, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Çıkış Yap</button>
        </div>
      </header>
      
      <main className="main-content">
        <div className="complaint-form-container">
          <h2>Yeni Şikayet / Öneri Oluştur</h2>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit} className="complaint-form">
            <div className="form-group">
              <label htmlFor="title">Başlık *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Şikayetiniz veya öneriniz için başlık yazınız"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Kategori *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Kategori Seçiniz</option>
                {categories && categories.length > 0 ? categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                )) : <option value="" disabled>Kategoriler yüklenemedi</option>}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Açıklama *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Şikayet veya önerinizi detaylı olarak açıklayınız"
                rows="6"
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="attachments">Ekler</label>
              <input
                type="file"
                id="attachments"
                name="attachments"
                onChange={handleFileChange}
                multiple
                className="file-input"
              />
              <small>İsteğe bağlı: Şikayet veya önerinizle ilgili belge, resim vb. ekleyebilirsiniz</small>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-btn">Gönder</button>
              <button type="button" className="cancel-btn" onClick={() => navigate('/dashboard')}>
                İptal
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateComplaint; 