import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Frontend API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      timestamp: new Date().toISOString()
    });

    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding auth token to request');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Frontend API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('❌ Frontend API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      responseData: error.response?.data,
      timestamp: new Date().toISOString()
    });

    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - removing token and redirecting');
      localStorage.removeItem('auth_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const complaintsApi = {
  // Public API
  createComplaint: (data: { name: string; email: string; complaint: string }) =>
    api.post('/complaints', data),

  // Admin API
  getAllComplaints: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/complaints', { params }),
  
  getComplaint: (id: string) =>
    api.get(`/complaints/${id}`),
  
  updateComplaint: (id: string, data: { status: string }) =>
    api.patch(`/complaints/${id}`, data),
  
  deleteComplaint: (id: string) =>
    api.delete(`/complaints/${id}`),
  
  // Comments
  getComments: (complaintId: string) =>
    api.get(`/complaints/${complaintId}/comments`),
  
  createComment: (complaintId: string, data: { comment_text: string; is_internal?: boolean }) =>
    api.post(`/complaints/${complaintId}/comments`, data),
};

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  me: () =>
    api.get('/auth/me'),
};