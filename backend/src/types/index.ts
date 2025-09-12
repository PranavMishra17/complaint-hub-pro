export type ComplaintType = 'Technical' | 'Billing' | 'Service' | 'General' | 'Product' | 'Account' | 'Other';

export interface Complaint {
  id: string;
  name: string;
  email: string;
  complaint: string;
  complaint_html?: string;
  complaint_type: ComplaintType;
  status: 'Pending' | 'Resolved';
  attachments?: any[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  client_ip?: string;
  user_agent?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'agent';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  author_id: string;
  author_name: string;
  comment_text: string;
  comment_html?: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateComplaintRequest {
  name: string;
  email: string;
  complaint: string;
  complaint_type: ComplaintType;
}

export interface UpdateComplaintRequest {
  status?: 'Pending' | 'Resolved';
  resolved_at?: string;
}

export interface CreateCommentRequest {
  comment_text: string;
  is_internal?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  status?: 'Pending' | 'Resolved';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}