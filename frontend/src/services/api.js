import axios from 'axios';

<<<<<<< HEAD
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
=======
// Backend API'nin tam URL'i
const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // CORS sorunlarını aşmak için credentials
  withCredentials: false
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
});

// Request interceptor - token eklemek için
api.interceptors.request.use(
  (config) => {
<<<<<<< HEAD
=======
    // Hata ayıklama için istekleri konsola yazdır
    console.log(`${config.method.toUpperCase()} istek: ${config.baseURL}${config.url}`, config.data || '');
    
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
<<<<<<< HEAD
  (error) => Promise.reject(error)
=======
  (error) => {
    console.error('İstek gönderme hatası:', error);
    return Promise.reject(error);
  }
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
);

// Response interceptor - hata kontrolü için
api.interceptors.response.use(
<<<<<<< HEAD
  (response) => response,
  (error) => {
=======
  (response) => {
    // Hata ayıklama için yanıtları konsola yazdır
    console.log('API yanıtı:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API hatası:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
>>>>>>> ab6467a48539b77204fa4739d9e286e73a9f9738
    if (error.response && error.response.status === 401) {
      // Token süresi dolmuş veya geçersiz - çıkış yap ve login sayfasına yönlendir
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication servisleri
export const authService = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data)
};

// Şikayet servisleri
export const complaintService = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  cancel: (id) => api.post(`/complaints/${id}/cancel`),
  addComment: (id, data) => api.post(`/complaints/${id}/comments`, data),
  getCategories: () => api.get('/complaints/categories')
};

// Admin servisleri
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getDashboardStats: () => api.get('/admin/dashboard')
};

// Bildirim servisleri
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`)
};

export default api; 