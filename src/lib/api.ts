import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  refreshToken: (token: string) => api.post('/auth/refresh', { token }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: FormData) => api.put('/users/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data: any) => api.put('/users/change-password', data),
  getStats: () => api.get('/users/stats'),
  getNotifications: (params?: any) => api.get('/users/notifications', { params }),
  markNotificationRead: (id: string) => api.put(`/users/notifications/${id}/read`),
  deleteAccount: (password: string) => api.delete('/users/account', { data: { password } }),
};

// Experts API
export const expertsAPI = {
  getExperts: (params?: any) => api.get('/experts', { params }),
  getFeaturedExperts: () => api.get('/experts/featured'),
  getCategories: () => api.get('/experts/categories'),
  getExpert: (id: string) => api.get(`/experts/${id}`),
  createProfile: (data: FormData) => api.post('/experts/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyProfile: () => api.get('/experts/profile/me'),
  getDashboardStats: () => api.get('/experts/dashboard/stats'),
  updateAvailability: (data: any) => api.put('/experts/availability', data),
};

// Questions API
export const questionsAPI = {
  createQuestion: (data: FormData) => api.post('/questions', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyQuestions: (params?: any) => api.get('/questions/my-questions', { params }),
  getExpertQuestions: (params?: any) => api.get('/questions/expert-questions', { params }),
  getQuestion: (id: string) => api.get(`/questions/${id}`),
  acceptQuestion: (id: string) => api.post(`/questions/${id}/accept`),
  declineQuestion: (id: string, reason: string) => api.post(`/questions/${id}/decline`, { reason }),
  submitAnswer: (id: string, data: FormData) => api.post(`/questions/${id}/answer`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  rateQuestion: (id: string, data: any) => api.post(`/questions/${id}/rate`, data),
  bookmarkQuestion: (id: string) => api.post(`/questions/${id}/bookmark`),
};

// Reviews API
export const reviewsAPI = {
  getExpertReviews: (expertId: string, params?: any) => api.get(`/reviews/expert/${expertId}`, { params }),
  createReview: (data: any) => api.post('/reviews', data),
  updateReview: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
  getMyReviews: (params?: any) => api.get('/reviews/my-reviews', { params }),
  markHelpful: (id: string) => api.post(`/reviews/${id}/helpful`),
  reportReview: (id: string, reason: string) => api.post(`/reviews/${id}/report`, { reason }),
};

// Wallet API
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getTransactions: (params?: any) => api.get('/wallet/transactions', { params }),
  addFunds: (amount: number, description?: string) => api.post('/wallet/add-funds', { amount, description }),
  updateWithdrawalSettings: (data: any) => api.put('/wallet/withdrawal-settings', data),
  requestWithdrawal: (data: any) => api.post('/wallet/withdraw', data),
  getWithdrawals: (params?: any) => api.get('/wallet/withdrawals', { params }),
  cancelWithdrawal: (id: string) => api.post(`/wallet/withdrawals/${id}/cancel`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUserStatus: (id: string, isActive: boolean) => api.put(`/admin/users/${id}/status`, { isActive }),
  getExperts: (params?: any) => api.get('/admin/experts', { params }),
  updateExpertApproval: (id: string, isApproved: boolean, rejectionReason?: string) => 
    api.put(`/admin/experts/${id}/approval`, { isApproved, rejectionReason }),
  featureExpert: (id: string, days: number) => api.put(`/admin/experts/${id}/feature`, { days }),
  getFinances: (params?: any) => api.get('/admin/finances', { params }),
  getTransactions: (params?: any) => api.get('/admin/transactions', { params }),
  getReferrals: (params?: any) => api.get('/admin/referrals', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings: any) => api.put('/admin/settings', { settings }),
  getWithdrawals: (params?: any) => api.get('/wallet/admin/withdrawals', { params }),
  processWithdrawal: (id: string, data: any) => api.post(`/wallet/admin/withdrawals/${id}/process`, data),
};

export default api;