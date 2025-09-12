# Claude Code CLI - Complaint Management System Implementation Prompts

## 🚀 Pre-Setup Instructions

### Initialize Claude Code Session
```bash
# Install Claude Code CLI if not already installed
npm install -g @anthropic-ai/claude-cli

# Initialize project
mkdir complaint-management-system
cd complaint-management-system
claude-code init
```

### Setup Checklist Before Starting
- [ ] Supabase project created with database URL and keys ready
- [ ] Production environment variables list prepared
- [ ] Node.js 18+ installed
- [ ] Git repository initialized
- [ ] .env.example file planned

## 📝 Systematic Implementation Prompts

### Phase 1: Project Foundation & Backend Setup

#### Prompt 1.1: Initial Project Structure
```
Create a production-ready complaint management system with the following exact structure:

PROJECT STRUCTURE:
```
complaint-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── config/
│   │   ├── types/
│   │   └── utils/
│   ├── uploads/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── api/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env.example
├── README.md
└── .gitignore
```

REQUIREMENTS:
1. Set up backend with TypeScript, Express, and all security middleware
2. Configure Supabase integration
3. Set up frontend with React 18, TypeScript, Vite, Tailwind CSS
4. Include all package.json dependencies for production deployment
5. Create proper TypeScript configurations
6. Set up environment variable examples
7. Configure proper .gitignore files

SECURITY REQUIREMENTS:
- Include helmet, cors, compression, morgan, express-rate-limit
- Set up bcrypt for password hashing and JWT for authentication
- Configure input validation with express-validator
- Include DOMPurify for HTML sanitization
- Set up multer with security restrictions for file uploads

Create all files with proper configurations. Do not leave any placeholders.
```

#### Prompt 1.2: Database Schema & Supabase Configuration
```
Create the complete database schema and Supabase configuration for a complaint management system:

DATABASE REQUIREMENTS:
1. complaints table with: id (UUID), name, email, complaint (text), complaint_html (rendered markdown), status (Pending/Resolved), attachments (JSONB), timestamps, client_ip, user_agent
2. admin_users table with: id (UUID), email (unique), password_hash, name, role (admin/agent), is_active, timestamps
3. complaint_comments table with: id (UUID), complaint_id (FK), author_id (FK), author_name, comment_text, comment_html, is_internal (boolean), timestamps
4. complaint_attachments table with: id (UUID), complaint_id (FK), filename, original_name, mime_type, file_size, file_path, uploaded_by, created_at
5. All necessary indexes for performance

SUPABASE CONFIGURATION:
1. Row Level Security (RLS) policies for all tables
2. Supabase client configuration with proper error handling
3. Real-time subscription setup for admin dashboard
4. Storage bucket configuration for file uploads
5. Environment variable configuration

SECURITY REQUIREMENTS:
- RLS policies that prevent unauthorized access
- Admin authentication required for sensitive operations  
- Input validation at database level with CHECK constraints
- Proper foreign key constraints with CASCADE delete
- Audit trail capabilities

Create the complete SQL schema file and Supabase configuration with all security measures implemented.
```

#### Prompt 1.3: Authentication & Security Middleware
```
Implement production-ready authentication and security middleware with the following specifications:

AUTHENTICATION REQUIREMENTS:
1. JWT-based authentication with refresh tokens
2. Bcrypt password hashing with minimum 12 rounds
3. Role-based access control (admin, agent roles)
4. Session management with active session tracking
5. Login attempt rate limiting (5 attempts per 15 minutes)

SECURITY MIDDLEWARE:
1. Input validation middleware using express-validator
2. HTML sanitization with DOMPurify for markdown content
3. File upload security with multer (type validation, size limits, virus scanning simulation)
4. Rate limiting: 100 requests per 15 minutes general, 5 submissions per hour for complaints
5. Security headers with helmet.js
6. CORS configuration for production domains
7. Request size limiting (10MB max)
8. IP whitelisting capability for admin endpoints

VALIDATION REQUIREMENTS:
- Complaint form: name (1-255 chars), email validation, complaint (10-10000 chars)
- Admin login: email validation, password strength requirements
- File uploads: max 3 files, 5MB each, allowed types: images, PDF, text
- Comment validation: 1-5000 characters, HTML sanitization

ERROR HANDLING:
- Structured error responses
- Security-aware error messages (no internal details exposed)
- Comprehensive logging without sensitive data
- Graceful failure handling

Implement all middleware with TypeScript interfaces and comprehensive error handling.
```

### Phase 2: Core API Implementation

#### Prompt 2.1: Complaints API Endpoints
```
Create the complete complaints API with the following exact endpoints and functionality:

REQUIRED ENDPOINTS:
1. POST /api/complaints - Submit new complaint (public endpoint)
2. GET /api/complaints - List all complaints (admin only) with pagination, filtering, sorting
3. GET /api/complaints/:id - Get single complaint with comments (admin only)
4. PATCH /api/complaints/:id - Update complaint status (admin only)
5. DELETE /api/complaints/:id - Delete complaint (admin only)
6. POST /api/complaints/:id/comments - Add comment to complaint (admin only)
7. GET /api/complaints/:id/comments - Get all comments for complaint (admin only)

FUNCTIONALITY REQUIREMENTS:
1. Markdown support: Convert markdown to HTML using 'marked' library, sanitize with DOMPurify
2. File upload handling: Save files securely, create attachment records, return file URLs
3. Real-time updates: Emit events for status changes using Supabase realtime
4. Search functionality: Full-text search across complaint content and comments
5. Audit logging: Log all admin actions with timestamps and user details
6. Email notifications: Send confirmation emails to users (simulate with console.log for now)

SECURITY IMPLEMENTATION:
- All inputs validated and sanitized
- SQL injection prevention with parameterized queries
- XSS prevention with HTML sanitization  
- File upload validation (MIME type, file signature verification, size limits)
- Admin authentication required for protected endpoints
- Rate limiting per endpoint type

RESPONSE FORMATS:
- Consistent JSON response structure
- Proper HTTP status codes
- Error responses with validation details
- Success responses with relevant data
- Pagination metadata for list endpoints

PERFORMANCE OPTIMIZATIONS:
- Database indexes for common queries
- Efficient pagination with LIMIT/OFFSET
- Lazy loading for comments and attachments
- Caching headers for static content

Create complete controller functions with comprehensive error handling, validation, and security measures.
```

#### Prompt 2.2: Admin Authentication System
```
Implement a complete admin authentication system with the following requirements:

AUTHENTICATION FEATURES:
1. Admin registration (restricted endpoint for initial setup)
2. Admin login with email/password
3. JWT token generation with proper claims
4. Token refresh mechanism
5. Password reset functionality (email-based)
6. Account activation/deactivation
7. Role management (admin, agent)
8. Session management with concurrent session limits

ENDPOINTS TO CREATE:
- POST /api/auth/register - Register new admin (super-admin only)
- POST /api/auth/login - Admin login
- POST /api/auth/refresh - Refresh JWT token
- POST /api/auth/logout - Logout and invalidate token
- GET /api/auth/me - Get current admin profile
- PATCH /api/auth/profile - Update admin profile
- POST /api/auth/forgot-password - Password reset request
- POST /api/auth/reset-password - Reset password with token

SECURITY MEASURES:
1. Password requirements: minimum 8 characters, mixed case, numbers, symbols
2. Account lockout after 5 failed attempts for 30 minutes
3. Password history (prevent reuse of last 5 passwords)
4. Secure token generation with crypto.randomBytes
5. Token blacklisting for logout
6. Audit trail for all authentication events
7. IP-based restrictions for admin access
8. Two-factor authentication preparation (structure only)

DATABASE REQUIREMENTS:
- admin_users table with all security fields
- login_attempts table for rate limiting
- password_resets table for reset tokens
- active_sessions table for session management
- audit_logs table for security events

VALIDATION & ERROR HANDLING:
- Comprehensive input validation
- Secure error messages (no information disclosure)
- Rate limiting on authentication endpoints
- CSRF protection for state-changing operations

Create complete authentication system with TypeScript interfaces and comprehensive security measures.
```

### Phase 3: Frontend Implementation

#### Prompt 3.1: Client Complaint Submission Form
```
Create a production-ready complaint submission form for clients with the following exact specifications:

FORM REQUIREMENTS:
1. Name field (required, 1-255 characters, text input)
2. Email field (required, valid email format, email input)  
3. Complaint field (required, 10-10000 characters, rich markdown editor)
4. File attachments (optional, max 3 files, 5MB each, drag-and-drop)
5. Real-time character counters for all text fields
6. Form validation with immediate feedback
7. Success confirmation with tracking ID

MARKDOWN EDITOR SPECIFICATIONS:
- Use @uiw/react-md-editor package
- Live preview mode
- Support for: headers, bold, italic, lists, links, code blocks, quotes
- Image insertion capability (upload and embed)
- Toolbar with common formatting options
- Syntax highlighting for code blocks
- Mobile-responsive design

FILE UPLOAD FEATURES:
- Drag and drop interface with react-dropzone
- File type validation (images: jpg/png/gif, documents: pdf/txt)
- File size validation (5MB max per file)
- Upload progress indicators
- File preview thumbnails
- Remove file functionality
- Multiple file support (max 3)

FORM VALIDATION:
- Client-side validation with react-hook-form and zod
- Real-time validation feedback
- Proper error message display
- Form submission prevention until valid
- Loading states during submission
- Network error handling

UI/UX REQUIREMENTS:
- Responsive design with Tailwind CSS
- Accessible form controls with proper labels
- Loading spinners and disabled states
- Success confirmation page with tracking ID
- Error handling with user-friendly messages
- Clean, professional design
- Mobile-first approach

INTEGRATION:
- API integration with axios for form submission
- Error boundary for error handling
- Form data serialization including files
- Progress tracking for file uploads
- Automatic form reset after successful submission

Create complete React component with TypeScript, proper error handling, and all specified features.
```

#### Prompt 3.2: Admin Dashboard with Complaint Management
```
Create a comprehensive admin dashboard for complaint management with the following exact features:

DASHBOARD LAYOUT:
1. Header with admin user info, logout button, notification bell
2. Sidebar navigation with: Dashboard, Complaints, Settings
3. Main content area with complaint list and details view
4. Footer with system status and version info

COMPLAINT LIST FEATURES:
1. Data table with columns: ID, Name, Email, Subject, Status, Priority, Date, Actions
2. Sorting by any column (ascending/descending)
3. Filtering by: status (Pending/Resolved), date range, priority, assigned agent
4. Search functionality across all complaint content
5. Pagination with configurable page sizes (10, 25, 50, 100)
6. Bulk operations: status updates, assignments, delete
7. Export functionality (CSV, PDF)
8. Real-time updates via Supabase subscriptions

COMPLAINT DETAILS VIEW:
1. Full complaint content with rendered markdown
2. File attachments with download links and previews
3. Status change controls with confirmation dialogs
4. Assignment controls (assign to admin/agent)
5. Comment thread with add comment functionality
6. Activity timeline showing all changes
7. Print-friendly view option

COMMENTS SYSTEM:
1. Threaded comments display
2. Rich text comment editor with markdown support
3. Internal vs public comment distinction
4. Comment timestamp and author display
5. Edit/delete own comments capability
6. Real-time comment updates
7. Mention system for other admins

AUTHENTICATION INTEGRATION:
1. Protected routes with React Router
2. JWT token management with automatic refresh
3. Role-based UI elements (admin vs agent views)
4. Session timeout handling
5. Redirect to login when unauthorized

UI/UX REQUIREMENTS:
- Modern, clean interface with Tailwind CSS
- Dark mode support with theme toggle
- Responsive design for tablet and mobile
- Loading states and skeleton screens
- Toast notifications for user feedback
- Confirmation dialogs for destructive actions
- Keyboard shortcuts for common actions
- Accessibility compliance (WCAG 2.1)

PERFORMANCE OPTIMIZATIONS:
- React Query for efficient data fetching and caching
- Virtual scrolling for large complaint lists
- Lazy loading of complaint details
- Optimistic updates for instant feedback
- Debounced search input
- Memoized components to prevent unnecessary re-renders

Create complete admin dashboard with all components, proper state management, and TypeScript interfaces.
```

### Phase 4: Security & Testing

#### Prompt 4.1: Comprehensive Security Implementation
```
Implement production-grade security measures across the entire complaint management system:

BACKEND SECURITY:
1. Input Validation & Sanitization:
   - Server-side validation for all endpoints using express-validator
   - HTML sanitization with DOMPurify for all user content
   - SQL injection prevention with parameterized queries only
   - NoSQL injection prevention for JSON fields
   - Path traversal prevention for file operations
   - Command injection prevention in file processing

2. Authentication & Authorization:
   - JWT implementation with RS256 algorithm
   - Token expiration and refresh mechanism
   - Role-based access control with middleware
   - Session management with Redis (simulate with memory)
   - Password policies with complexity requirements
   - Account lockout mechanisms

3. File Security:
   - File type validation using file signatures (magic bytes)
   - Virus scanning simulation with file content checks
   - Secure file storage outside web root
   - File size and quantity limits
   - Image resizing and metadata stripping
   - Quarantine system for suspicious files

4. Rate Limiting & DDoS Protection:
   - Different rate limits per endpoint type
   - IP-based and user-based limiting
   - Sliding window rate limiting
   - Request size limits
   - Slowloris protection with timeouts

FRONTEND SECURITY:
1. XSS Prevention:
   - Content Security Policy implementation
   - Output encoding for user content
   - Sanitization of markdown before display
   - Safe DOM manipulation practices
   - Input validation on client side

2. CSRF Protection:
   - CSRF tokens for state-changing operations
   - SameSite cookie configuration
   - Origin header validation
   - Custom headers for API requests

3. Data Protection:
   - Sensitive data masking in UI
   - Secure localStorage usage
   - Session timeout handling
   - Secure cookie configuration
   - HTTPS-only cookie settings

INFRASTRUCTURE SECURITY:
1. Environment Configuration:
   - Secure environment variable handling
   - Secrets management
   - Database connection security
   - HTTPS enforcement
   - Security headers configuration

2. Monitoring & Logging:
   - Comprehensive audit logging
   - Error logging without sensitive data
   - Security event monitoring
   - Performance monitoring
   - Health check endpoints

Create complete security implementation with all measures properly configured and tested.
```

#### Prompt 4.2: Testing Suite Implementation
```
Create a comprehensive testing suite for the complaint management system:

BACKEND TESTING:
1. Unit Tests for:
   - All controller functions with mocked dependencies
   - Authentication middleware with various scenarios
   - Validation functions with edge cases
   - Utility functions for sanitization and formatting
   - Database query functions with mock data
   - File upload handling with various file types

2. Integration Tests for:
   - Complete API endpoints with real database
   - Authentication flow from login to protected routes
   - File upload and processing pipeline
   - Database operations with Supabase
   - Real-time updates and subscriptions
   - Email notification system

3. Security Tests for:
   - SQL injection attempts on all endpoints
   - XSS payload testing in form inputs
   - File upload security (malicious files, oversized files)
   - Authentication bypass attempts
   - Rate limiting effectiveness
   - Input validation boundary testing

FRONTEND TESTING:
1. Component Tests with:
   - Form validation behavior
   - User interaction simulation
   - Error state handling
   - Loading state management
   - File upload functionality
   - Markdown editor behavior

2. Integration Tests for:
   - Complete user flows (submit complaint, admin review)
   - Authentication flows
   - Real-time updates in admin dashboard
   - Error boundary functionality
   - Responsive design testing

3. E2E Tests with:
   - Full complaint submission process
   - Admin login and complaint management
   - File upload and download workflows
   - Cross-browser compatibility
   - Mobile responsiveness testing

PERFORMANCE TESTING:
1. Load Testing:
   - Concurrent user simulation
   - Database performance under load
   - File upload performance testing
   - API response time benchmarking
   - Memory usage monitoring

2. Stress Testing:
   - Rate limiting behavior under attack
   - Database connection pooling limits
   - File storage capacity testing
   - Error handling under extreme load

TEST CONFIGURATION:
- Jest for unit and integration testing
- Supertest for API endpoint testing
- React Testing Library for component testing
- Cypress for E2E testing
- Artillery.js for load testing

Create complete test suite with proper setup, teardown, and comprehensive coverage of all functionality.
```

### Phase 5: Production Deployment

#### Prompt 5.1: Production Configuration & Deployment
```
Create production-ready deployment configuration and documentation:

PRODUCTION ENVIRONMENT SETUP:
1. Environment Variables:
   - All required environment variables with secure defaults
   - Database connection strings with SSL
   - JWT secrets with proper entropy
   - API keys and service credentials
   - CORS origins for production domains
   - File storage configuration

2. Database Configuration:
   - Production Supabase project setup
   - Connection pooling configuration
   - Backup and recovery procedures
   - Performance monitoring setup
   - Index optimization for production queries

3. Security Configuration:
   - HTTPS enforcement with proper certificates
   - Security headers optimization
   - Rate limiting for production traffic
   - CORS policies for production domains
   - Content Security Policy fine-tuning

APPLICATION DEPLOYMENT:
1. Backend Deployment:
   - Docker containerization with multi-stage builds
   - Process management with PM2 or similar
   - Health check endpoints
   - Graceful shutdown handling
   - Log rotation and management
   - Performance monitoring integration

2. Frontend Deployment:
   - Static asset optimization and compression
   - CDN configuration for assets
   - Service worker for offline capabilities
   - PWA manifest configuration
   - Build optimization for production

3. Infrastructure:
   - Load balancer configuration
   - SSL/TLS certificate management
   - Database backup automation
   - File storage backup procedures
   - Monitoring and alerting setup

MONITORING & MAINTENANCE:
1. Application Monitoring:
   - Performance metrics collection
   - Error tracking and alerting
   - User activity monitoring
   - System resource monitoring
   - Database performance monitoring

2. Security Monitoring:
   - Failed login attempt tracking
   - Suspicious activity detection
   - File upload monitoring
   - Rate limiting violation alerts
   - Security audit log analysis

3. Backup & Recovery:
   - Automated database backups
   - File storage synchronization
   - Disaster recovery procedures
   - Data retention policies
   - Recovery testing procedures

DOCUMENTATION:
1. Deployment Guide:
   - Step-by-step deployment instructions
   - Environment setup procedures
   - Database migration scripts
   - Configuration checklists
   - Troubleshooting guide

2. Operations Manual:
   - System administration procedures
   - Monitoring and alerting setup
   - Backup and recovery procedures
   - Security incident response
   - Performance tuning guide

Create complete production deployment package with all configurations, scripts, and documentation.
```

## 🛡️ Production Guardrails & Best Practices

### Security Guardrails
```
CRITICAL SECURITY CHECKLIST:
□ All user inputs validated server-side
□ SQL injection prevention verified
□ XSS prevention implemented and tested
□ File upload security properly configured
□ Authentication system secure and tested
□ Authorization checks on all protected endpoints
□ Rate limiting properly configured
□ Security headers correctly set
□ HTTPS enforced everywhere
□ Sensitive data properly encrypted
□ Error messages don't leak information
□ Audit logging implemented
□ Dependencies scanned for vulnerabilities
□ Environment variables secured
□ Database access properly restricted
```

### Performance Guardrails
```
PERFORMANCE REQUIREMENTS:
□ API response times under 500ms for 95th percentile
□ Database queries optimized with proper indexes
□ File upload progress tracking implemented
□ Caching strategy implemented where appropriate
□ Bundle sizes optimized for fast loading
□ Images optimized and properly sized
□ Database connection pooling configured
□ Memory usage monitoring implemented
□ CPU usage monitoring implemented
□ Load testing completed successfully
```

### Code Quality Guardrails
```
CODE QUALITY STANDARDS:
□ TypeScript strict mode enabled
□ ESLint and Prettier configured
□ Unit test coverage above 80%
□ Integration tests covering all critical paths
□ Error boundaries implemented
□ Proper error handling throughout
□ Code reviewed for security issues
□ Dependencies kept up to date
□ Documentation complete and accurate
□ Git commit messages follow conventions
```

## 🚨 Critical Production Warnings

### NEVER DO IN PRODUCTION:
1. **Don't** expose internal error details to clients
2. **Don't** log sensitive data (passwords, tokens, personal info)
3. **Don't** use default secrets or weak passwords
4. **Don't** skip input validation on any endpoint
5. **Don't** trust file uploads without proper validation
6. **Don't** implement custom crypto - use established libraries
7. **Don't** store passwords in plain text anywhere
8. **Don't** allow unlimited file uploads or request sizes
9. **Don't** skip HTTPS in production
10. **Don't** ignore security updates for dependencies

### ALWAYS DO IN PRODUCTION:
1. **Always** validate and sanitize all inputs
2. **Always** use parameterized queries for database operations
3. **Always** implement proper error handling
4. **Always** use HTTPS with valid certificates
5. **Always** implement rate limiting
6. **Always** log security events for monitoring
7. **Always** backup data regularly
8. **Always** test disaster recovery procedures
9. **Always** monitor application performance and security
10. **Always** keep dependencies updated with security patches

## 🔄 Progressive Implementation Strategy

### Phase Completion Checklist:
After each phase, verify:
- [ ] All code properly typed with TypeScript
- [ ] Security measures implemented and tested
- [ ] Error handling comprehensive
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Code reviewed

### Deployment Readiness Checklist:
Before production deployment:
- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Support procedures established
- [ ] Rollback plan prepared

Use these prompts systematically with Claude Code CLI to build a production-ready complaint management system with enterprise-grade security and performance.