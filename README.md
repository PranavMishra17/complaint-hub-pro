# Complaint Management System

A complete, production-ready complaint management system built with React, TypeScript, Node.js, Express, and Supabase. Features client complaint submissions with markdown support, admin dashboard with commenting system, and comprehensive security measures.

## 🚀 Features

### Public Features
- **Complaint Submission**: Rich form with markdown editor support
- **Form Validation**: Client-side and server-side validation with Zod schemas
- **Responsive Design**: Mobile-first responsive interface built with Tailwind CSS
- **Tracking System**: Unique tracking IDs generated for each complaint
- **Success Confirmation**: Clear confirmation with tracking ID display

### Admin Features
- **Authentication**: Secure JWT-based login system
- **Dashboard**: Comprehensive complaint management interface with pagination
- **Status Management**: Toggle complaints between Pending/Resolved states
- **Comments System**: Add internal and public comments with markdown support
- **Complaint Details**: Full complaint view with threaded comments
- **Real-time Updates**: Live dashboard updates using React Query
- **Role-based Access**: Admin and agent role management

### Security Features
- **JWT Authentication**: Secure token-based authentication with role verification
- **Input Validation**: Comprehensive server-side validation using express-validator
- **Rate Limiting**: API endpoint protection against abuse
- **HTML Sanitization**: XSS prevention with DOMPurify
- **CORS Protection**: Configured for specific origins
- **Security Headers**: Comprehensive security headers via Helmet.js
- **Environment Variables**: Secure configuration management

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcrypt
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS + Custom components

### Project Structure
```
complaint-hub-pro/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers (auth, complaints, comments)
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── routes/           # Express routes with middleware chains
│   │   ├── config/           # Database configuration
│   │   ├── types/            # TypeScript interfaces and types
│   │   └── utils/            # Helper functions (markdown processing)
│   ├── uploads/              # File upload directory
│   ├── .env                  # Environment variables
│   ├── package.json          # Dependencies and scripts
│   └── tsconfig.json         # TypeScript configuration
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components (ComplaintForm, AdminLogin, etc.)
│   │   ├── contexts/         # React contexts (AuthContext)
│   │   ├── utils/            # API client and utilities
│   │   ├── types/            # TypeScript interfaces
│   │   └── hooks/            # Custom React hooks
│   ├── .env                  # Frontend environment variables
│   └── package.json          # Dependencies and scripts
├── test-database.js          # Database testing script
├── create-admin-user.js      # Admin user creation script
└── README.md
```

## 🗄️ Database Schema

### Tables Overview
```sql
-- Main complaints table
complaints (id, name, email, complaint, complaint_html, status, created_at, updated_at, resolved_at, client_ip, user_agent, attachments)

-- Admin users table
admin_users (id, email, password_hash, name, role, is_active, created_at, last_login)

-- Comments system
complaint_comments (id, complaint_id, author_id, author_name, comment_text, comment_html, is_internal, created_at, updated_at)
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (>=16.0.0)
- npm or yarn
- Supabase account with database setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd complaint-hub-pro

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Configuration

#### Backend Environment (.env)
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-min-256-bits-long
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Frontend Environment (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Database Setup

The system uses your existing Supabase database with the following tables:
- `complaints` - Main complaint storage
- `admin_users` - Admin authentication
- `complaint_comments` - Comment system

### 4. Create Admin User
```bash
node create-admin-user.js
```
This creates a demo admin user:
- **Email**: admin@demo.com
- **Password**: admin123

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server:**
```bash
cd backend
npm run build  # Build TypeScript
npm run dev     # Start with nodemon (or npm start for production)
```
Backend runs on: http://localhost:3001

2. **Start Frontend Server:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

### Health Check
Visit http://localhost:3001/health to verify backend is running.

## 📝 API Documentation

### Public Endpoints

#### Submit Complaint
```http
POST /api/complaints
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "complaint": "Detailed complaint text with **markdown** support"
}

Response: {
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "id": "uuid-string",
    "trackingId": "A3703311"
  }
}
```

#### Health Check
```http
GET /health

Response: {
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-09-12T16:47:23.468Z"
}
```

### Admin Endpoints (Authentication Required)

#### Admin Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@demo.com",
  "password": "admin123"
}

Response: {
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-string",
    "user": {
      "id": "user-id",
      "email": "admin@demo.com",
      "name": "Demo Admin",
      "role": "admin"
    }
  }
}
```

#### Get User Profile
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>

Response: {
  "success": true,
  "data": {
    "id": "user-id",
    "email": "admin@demo.com", 
    "name": "Demo Admin",
    "role": "admin",
    "created_at": "timestamp",
    "last_login": "timestamp"
  }
}
```

#### List All Complaints
```http
GET /api/complaints?page=1&limit=10&status=Pending
Authorization: Bearer <jwt-token>

Response: {
  "success": true,
  "data": {
    "complaints": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Get Complaint Details
```http
GET /api/complaints/:id
Authorization: Bearer <jwt-token>

Response: {
  "success": true,
  "data": {
    "id": "complaint-id",
    "name": "John Doe",
    "email": "john@example.com",
    "complaint": "Original complaint text",
    "complaint_html": "<p>Rendered HTML</p>",
    "status": "Pending",
    "created_at": "timestamp",
    "complaint_comments": [...]
  }
}
```

#### Update Complaint Status
```http
PATCH /api/complaints/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "Resolved"
}

Response: {
  "success": true,
  "message": "Complaint updated successfully",
  "data": { ...updated complaint }
}
```

#### Add Comment
```http
POST /api/complaints/:id/comments
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "comment_text": "This is a **markdown** comment",
  "is_internal": false
}

Response: {
  "success": true,
  "message": "Comment created successfully", 
  "data": { ...comment with author info }
}
```

#### Get Comments
```http
GET /api/complaints/:id/comments
Authorization: Bearer <jwt-token>

Response: {
  "success": true,
  "data": [
    {
      "id": "comment-id",
      "comment_text": "Comment text",
      "comment_html": "<p>Rendered HTML</p>",
      "author_name": "Demo Admin",
      "is_internal": false,
      "created_at": "timestamp"
    }
  ]
}
```

#### Delete Complaint (Admin Only)
```http
DELETE /api/complaints/:id
Authorization: Bearer <jwt-token>

Response: {
  "success": true,
  "message": "Complaint deleted successfully"
}
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: 24-hour expiration, secure signing
- **Role-based Access**: Admin and agent roles with different permissions
- **Password Security**: bcrypt hashing with salt rounds = 12
- **Token Validation**: Middleware checks token validity and user status

### Input Validation & Sanitization
- **Server-side Validation**: express-validator for all inputs
- **HTML Sanitization**: DOMPurify prevents XSS attacks
- **Markdown Processing**: Safe markdown rendering with marked.js
- **Request Size Limits**: 10MB limit for JSON requests

### API Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured origins for cross-origin requests
- **Security Headers**: Helmet.js provides comprehensive headers
- **Error Handling**: Secure error responses without sensitive data leaks

## 🎯 Usage Guide

### For End Users
1. Visit the public form at http://localhost:5173
2. Fill out complaint details with name, email, and complaint text
3. Use markdown formatting for rich text (bold, italic, lists, etc.)
4. Submit and receive a tracking ID for follow-up

### For Administrators
1. Access admin panel at http://localhost:5173/admin/login
2. Login with credentials (admin@demo.com / admin123)
3. View dashboard with all complaints and pagination
4. Click "View Details" to see full complaint with comments
5. Toggle status between Pending/Resolved
6. Add comments (public or internal) to complaints
7. Delete complaints (admin role only)

## 🧪 Testing

### Manual Testing
```bash
# Test backend health
curl http://localhost:3001/health

# Test complaint submission  
curl -X POST http://localhost:3001/api/complaints \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","complaint":"Test complaint"}'

# Test admin login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"admin123"}'
```

### Database Testing
```bash
node test-database.js
```
This script tests all database operations including creating complaints, comments, and admin users.

## 🚀 Production Deployment

### Build Process
```bash
# Build backend
cd backend && npm run build

# Build frontend  
cd frontend && npm run build
```

### Environment Variables
- Set `NODE_ENV=production` for backend
- Configure production Supabase credentials
- Set strong `JWT_SECRET` (minimum 256 bits)
- Update `ALLOWED_ORIGINS` for production domains

### Production Checklist
- [ ] Environment variables configured securely
- [ ] HTTPS enabled with valid certificates  
- [ ] Database connection secured
- [ ] Admin users created with strong passwords
- [ ] Rate limiting properly configured
- [ ] Error logging and monitoring setup
- [ ] File upload security validated
- [ ] Security headers tested
- [ ] CORS configuration verified

## 📦 Key Dependencies

### Backend
- **express** - Web framework
- **typescript** - Type safety
- **@supabase/supabase-js** - Database client
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin requests
- **express-rate-limit** - API rate limiting
- **marked** - Markdown processing
- **dompurify** - HTML sanitization

### Frontend
- **react** - UI framework
- **typescript** - Type safety
- **vite** - Build tool
- **tailwindcss** - Styling
- **@tanstack/react-query** - Data fetching/caching
- **react-hook-form** - Form handling
- **@hookform/resolvers** - Form validation
- **zod** - Schema validation
- **react-router-dom** - Routing
- **@uiw/react-md-editor** - Markdown editor
- **axios** - HTTP client
- **react-hot-toast** - Notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the GitHub repository
- Review the API documentation above
- Check the database schema and test files for examples

---

**System Status**: ✅ Production Ready  
**Latest Update**: Complete modular implementation with full frontend/backend integration