import apiClient from './apiClient';

// Auth API
export const authAPI = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    apiClient.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
};

// Reports API
export const reportsAPI = {
  getAll: (params) => apiClient.get('/reports', { params }),
  getById: (id) => apiClient.get(`/reports/${id}`),
  create: (formData) =>
    apiClient.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => apiClient.put(`/reports/${id}`, data),
  delete: (id) => apiClient.delete(`/reports/${id}`),
  addPhotos: (id, formData) =>
    apiClient.post(`/reports/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyReports: (params) => apiClient.get('/reports/my-reports', { params }),
  getStats: () => apiClient.get('/reports/stats'),
};

// Claims API
export const claimsAPI = {
  submit: (reportId, formData) =>
    apiClient.post(`/claims/${reportId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params) => apiClient.get('/claims/admin', { params }),
  getMyClaims: (params) => apiClient.get('/claims/my-claims', { params }),
  getById: (id) => apiClient.get(`/claims/${id}`),
  review: (id, data) => apiClient.put(`/claims/${id}/review`, data),
  withdraw: (id) => apiClient.put(`/claims/${id}/withdraw`),
  flag: (id, flagReason) => apiClient.put(`/claims/${id}/flag`, { flagReason }),
};

// Users API
export const usersAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  uploadProfilePhoto: (formData) =>
    apiClient.post('/users/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDashboard: () => apiClient.get('/users/dashboard'),
  getAll: (params) => apiClient.get('/users', { params }),
  toggleStatus: (id) => apiClient.put(`/users/${id}/status`),
  verify: (id) => apiClient.put(`/users/${id}/verify`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => apiClient.get('/notifications', { params }),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
};
