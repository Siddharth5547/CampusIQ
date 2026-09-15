import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const complaintService = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/complaints/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  }),
  delete: (id) => api.delete(`/complaints/${id}`),
  analyze: (data) => api.post('/complaints/analyze', data),
  checkDuplicates: (data) => api.post('/complaints/check-duplicates', data),
  upvote: (id) => api.post(`/complaints/${id}/upvote`),
  verifyResolution: (id, data) => api.post(`/complaints/${id}/verify`, data),
  addComment: (id, data) => api.post(`/complaints/${id}/comments`, data),
  submitFeedback: (id, data) => api.post(`/complaints/${id}/feedback`, data),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const adminService = {
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getStaff: () => api.get('/admin/staff'),
};
