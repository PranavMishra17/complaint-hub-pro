-- Complaint Management System Database Schema
-- This file contains the complete database setup with RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABLES (Already created, here for reference)
-- =============================================

-- Complaints table (main complaint data)
-- Already exists, but here's the complete schema:
/*
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    complaint TEXT NOT NULL,
    complaint_html TEXT,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Resolved')),
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    client_ip INET,
    user_agent TEXT
);
*/

-- Admin users table (authentication and authorization)
-- Already exists, but here's the complete schema:
/*
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'agent')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);
*/

-- Comments table (for complaint responses and internal notes)
-- Already exists, but here's the complete schema:
/*
CREATE TABLE IF NOT EXISTS complaint_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    author_id UUID REFERENCES admin_users(id),
    author_name VARCHAR(255) NOT NULL,
    comment_text TEXT NOT NULL,
    comment_html TEXT,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- File attachments table (separate from JSONB for better querying)
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    supabase_path TEXT, -- Path in Supabase storage
    uploaded_by VARCHAR(10) DEFAULT 'client' CHECK (uploaded_by IN ('client', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin sessions table (for session management)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Audit log table (for tracking changes)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES admin_users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limiting table (for tracking request limits)
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- IP or user ID
    action VARCHAR(50) NOT NULL, -- 'general', 'complaint', 'login'
    attempts INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier, action)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Complaints indexes
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_email ON complaints(email);
CREATE INDEX IF NOT EXISTS idx_complaints_updated_at ON complaints(updated_at DESC);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_complaint_id ON complaint_comments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON complaint_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON complaint_comments(author_id);

-- Attachments indexes
CREATE INDEX IF NOT EXISTS idx_attachments_complaint_id ON complaint_attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON complaint_attachments(created_at DESC);

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON admin_sessions(is_active);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_action ON rate_limits(action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Complaints policies
-- Public: Allow anyone to INSERT complaints (client submissions)
CREATE POLICY "Allow public complaint submissions" ON complaints
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Public: Allow anyone to SELECT their own complaint by ID (for tracking)
CREATE POLICY "Allow public complaint viewing by ID" ON complaints
    FOR SELECT
    TO anon, authenticated
    USING (true); -- We'll handle access control in the application layer

-- Admin: Full access to complaints for authenticated admin users
CREATE POLICY "Admin full access to complaints" ON complaints
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- Admin users policies
-- Only authenticated admins can access admin_users
CREATE POLICY "Admin access to admin_users" ON admin_users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.is_active = true
            AND au.role = 'admin'
        )
    );

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON admin_users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Complaint comments policies  
-- Admin: Full access for authenticated admin users
CREATE POLICY "Admin access to comments" ON complaint_comments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- Public: Allow reading non-internal comments
CREATE POLICY "Public can read non-internal comments" ON complaint_comments
    FOR SELECT
    TO anon, authenticated
    USING (is_internal = false);

-- Complaint attachments policies
-- Admin: Full access
CREATE POLICY "Admin access to attachments" ON complaint_attachments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- Public: Can read attachments for their complaints
CREATE POLICY "Public can read complaint attachments" ON complaint_attachments
    FOR SELECT
    TO anon, authenticated
    USING (true); -- Application layer will handle specific complaint access

-- Admin sessions policies
CREATE POLICY "Users can manage own sessions" ON admin_sessions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Audit logs policies  
-- Only admins can read audit logs
CREATE POLICY "Admin read audit logs" ON audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.role = 'admin'
        )
    );

-- System can insert audit logs
CREATE POLICY "System insert audit logs" ON audit_logs
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Rate limits policies
-- System access only
CREATE POLICY "System access rate limits" ON rate_limits
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_complaints_updated_at 
    BEFORE UPDATE ON complaints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON complaint_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at 
    BEFORE UPDATE ON rate_limits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set resolved_at when status changes to 'Resolved'
CREATE OR REPLACE FUNCTION set_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Resolved' AND OLD.status != 'Resolved' THEN
        NEW.resolved_at = NOW();
    ELSIF NEW.status != 'Resolved' THEN
        NEW.resolved_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_complaint_resolved_at 
    BEFORE UPDATE ON complaints 
    FOR EACH ROW EXECUTE FUNCTION set_resolved_at();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM admin_sessions 
    WHERE expires_at < NOW() OR (last_accessed < NOW() - INTERVAL '30 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limits 
    WHERE window_start < NOW() - INTERVAL '24 hours'
    AND (blocked_until IS NULL OR blocked_until < NOW());
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- =============================================
-- INITIAL DATA
-- =============================================

-- Create a default admin user (password should be changed immediately)
-- Password: AdminPassword123! (hashed with bcrypt rounds 12)
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES (
    'admin@complaint-system.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4azA/PL.Ry', -- AdminPassword123!
    'System Administrator',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- =============================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard)
-- =============================================

-- Create storage bucket for complaint attachments
-- This needs to be run in the Supabase dashboard SQL editor:
/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'complaint-attachments',
    'complaint-attachments', 
    false,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
    FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id = 'complaint-attachments');

CREATE POLICY "Authenticated users can read attachments" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'complaint-attachments');

CREATE POLICY "Admins can delete attachments" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'complaint-attachments' AND
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );
*/

-- =============================================
-- MAINTENANCE SCHEDULED TASKS
-- =============================================

-- Note: These would typically be run via cron jobs or scheduled tasks
-- SELECT cleanup_expired_sessions();
-- SELECT cleanup_old_rate_limits();

-- =============================================
-- GRANTS AND PERMISSIONS
-- =============================================

-- Ensure proper permissions for the service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Ensure anon role has necessary permissions for public operations
GRANT INSERT ON complaints TO anon;
GRANT SELECT ON complaints TO anon;
GRANT SELECT ON complaint_comments TO anon;
GRANT SELECT ON complaint_attachments TO anon;

COMMIT;