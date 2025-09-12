# Complaint Management System

A production-ready complaint management system built with React, TypeScript, Node.js, Express, and Supabase. Features include client complaint submissions with markdown support, file uploads, admin dashboard, real-time updates, and comprehensive security measures.

## 🚀 Features

### Client Features
- **Complaint Submission**: Rich form with markdown editor support
- **File Uploads**: Support for images, PDFs, and text files (max 3 files, 5MB each)
- **Real-time Updates**: Live status updates via Supabase Realtime
- **Responsive Design**: Mobile-first responsive interface
- **Tracking System**: Unique tracking IDs for complaint follow-up

### Admin Features
- **Dashboard**: Comprehensive complaint management interface
- **Status Management**: Toggle complaints between Pending/Resolved
- **Comments System**: Internal and external comments with markdown support
- **File Management**: View and manage uploaded attachments
- **Real-time Updates**: Live dashboard updates
- **Pagination**: Efficient data loading with pagination

### Security Features
- **Authentication**: JWT-based admin authentication with role management
- **Input Validation**: Comprehensive server-side validation and sanitization
- **Rate Limiting**: Prevents spam and abuse
- **File Security**: Type validation, size limits, and secure storage
- **CORS Protection**: Configured for production domains
- **SQL Injection Prevention**: Parameterized queries with Supabase
- **XSS Prevention**: HTML sanitization with DOMPurify

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcrypt
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Project Structure
```
complaint-hub-pro/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Authentication, validation, security
│   │   ├── routes/          # API routes
│   │   ├── config/          # Database and app configuration
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper functions
│   └── uploads/             # File upload directory
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Helper functions
│   │   ├── types/           # TypeScript types
│   │   └── api/             # API client functions
│   └── public/              # Static assets
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js (>=16.0.0)
- npm or yarn
- Supabase account

### 1. Clone the repository
```bash
git clone <repository-url>
cd complaint-hub-pro
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Install frontend dependencies
```bash
cd frontend
npm install
```

### 4. Set up environment variables

#### Backend (.env)
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your configuration:
```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
JWT_SECRET=your-super-secret-jwt-key-min-256-bits-long
ALLOWED_ORIGINS=http://localhost:3000
```

#### Frontend (.env)
```bash
cp frontend/.env.example frontend/.env
```
Edit `frontend/.env` with your configuration:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Set up Supabase database

The database schema is already created in your Supabase instance with the following tables:
- `complaints`: Main complaint data
- `admin_users`: Admin user accounts
- `complaint_comments`: Comments and responses

## 🚀 Running the Application

### Development Mode

1. **Start the backend server:**
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:3001

2. **Start the frontend development server:**
```bash
cd frontend
npm run dev
```
The frontend will run on http://localhost:3000

### Production Mode

1. **Build the backend:**
```bash
cd backend
npm run build
```

2. **Build the frontend:**
```bash
cd frontend
npm run build
```

3. **Start the production server:**
```bash
cd backend
npm start
```

## 📝 API Endpoints

### Public Endpoints
- `POST /api/complaints` - Submit a new complaint
- `GET /api/complaints/:id` - Get complaint by ID (public view)

### Admin Endpoints (Authentication Required)
- `POST /api/auth/login` - Admin login
- `GET /api/complaints` - Get all complaints (paginated)
- `PATCH /api/complaints/:id` - Update complaint status
- `DELETE /api/complaints/:id` - Delete complaint
- `POST /api/complaints/:id/comments` - Add comment to complaint
- `GET /api/complaints/:id/comments` - Get complaint comments

## 🔒 Security

This application implements comprehensive security measures:

- **Rate Limiting**: 100 requests per 15 minutes, 5 complaint submissions per hour
- **Input Validation**: All inputs validated and sanitized
- **Authentication**: JWT tokens with expiration
- **File Upload Security**: Type validation, size limits, secure storage
- **CORS**: Configured for specific origins
- **Security Headers**: Implemented via Helmet.js
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: HTML sanitization

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Environment Configuration
Update environment variables for production:

#### Backend
- Set `NODE_ENV=production`
- Configure production Supabase credentials
- Set strong `JWT_SECRET`
- Configure production `ALLOWED_ORIGINS`

#### Frontend
- Update `VITE_API_BASE_URL` to production API URL
- Configure production Supabase credentials

### Production Checklist
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Database backups automated
- [ ] Error logging configured
- [ ] Performance monitoring setup
- [ ] Security headers validated
- [ ] File upload security tested
- [ ] Rate limiting configured
- [ ] Admin accounts created with strong passwords

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, please create an issue in the repository or contact the development team.
