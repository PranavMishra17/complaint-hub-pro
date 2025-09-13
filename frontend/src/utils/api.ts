import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
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
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Check if this is an auth-related endpoint or token validation failure
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const errorMessage = error.response?.data?.error || '';
      const isTokenRelatedError = errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('required');
      
      // Only auto-redirect for auth endpoint failures or clear token issues
      if (isAuthEndpoint || isTokenRelatedError) {
        localStorage.removeItem('auth_token');
        
        // Only redirect if we're on an admin page to avoid interfering with public pages
        if (window.location.pathname.startsWith('/admin/') && !window.location.pathname.includes('/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const complaintsApi = {
  // Public API
  createComplaint: (data: { name: string; email: string; complaint: string }) =>
    api.post('/complaints', data),
  
  getComplaintByTrackingId: (trackingId: string) =>
    api.get(`/complaints/public/${trackingId}`),
  
  withdrawComplaint: (trackingId: string) =>
    api.patch(`/complaints/public/${trackingId}/withdraw`),

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