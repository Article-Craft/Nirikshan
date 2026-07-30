import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Automatically inject token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nirikshan_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data).then(res => res.data),
  login: (data) => api.post('/auth/login', data).then(res => res.data),
  anonymousSession: () => api.post('/auth/anonymous-session').then(res => res.data),
};

export const promisesAPI = {
  getAll: (params) => api.get('/promises', { params }).then(res => res.data),
  getById: (id) => api.get(`/promises/${id}`).then(res => res.data),
  create: (data) => api.post('/promises', data).then(res => res.data),
  submitStatusUpdate: (id, data) => api.post(`/promises/${id}/status-update`, data).then(res => res.data),
  getTimeline: (id) => api.get(`/promises/${id}/timeline`).then(res => res.data),
};

export const moderationAPI = {
  getQueue: () => api.get('/moderation/queue').then(res => res.data),
  approve: (id) => api.post(`/moderation/${id}/approve`).then(res => res.data),
  reject: (id) => api.post(`/moderation/${id}/reject`).then(res => res.data),
};

export const constituenciesAPI = {
  getAll: (params) => api.get('/constituencies', { params }).then(res => res.data),
  getById: (id) => api.get(`/constituencies/${id}`).then(res => res.data),
};

export const districtsAPI = {
  getAll: (params) => api.get('/districts', { params }).then(res => res.data),
  getById: (id) => api.get(`/districts/${id}`).then(res => res.data),
};

export const representativesAPI = {
  getAll: (params) => api.get('/representatives', { params }).then(res => res.data),
  getById: (id) => api.get(`/representatives/${id}`).then(res => res.data),
  submitRating: (id, data) => api.post(`/representatives/${id}/rating`, data).then(res => res.data),
};
};

export default api;
