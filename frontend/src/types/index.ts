export interface Complaint {
  id: string;
  name: string;
  email: string;
  complaint: string;
  complaint_html?: string;
  status: 'Pending' | 'Resolved';
  attachments?: any[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  client_ip?: string;
  user_agent?: string;
}

export interface ComplaintWithComments extends Complaint {
  complaint_comments: Comment[];
}

export interface Comment {
  id: string;
  complaint_id: string;
  author_id: string;
  author_name: string;
  comment_text: string;
  comment_html?: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  admin_users?: {
    name: string;
    email: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  created_at?: string;
  last_login?: string;
}

export interface CreateComplaintRequest {
  name: string;
  email: string;
  complaint: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateCommentRequest {
  comment_text: string;
  is_internal?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  complaints: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}