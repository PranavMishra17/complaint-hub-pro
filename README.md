# Complaint Hub Pro

A professional complaint management system with secure admin dashboard and public complaint tracking.

## 🚀 Features

### Public Features
- **Complaint Submission**: Rich text form with markdown support
- **Complaint Tracking**: Track complaints using 8-character tracking ID
- **Status Updates**: View complaint status (Pending/Resolved/Withdrawn)
- **Public Comments**: View public updates from admin team

### Admin Features
- **Secure Dashboard**: JWT-based authentication system
- **Complaint Management**: View, filter, and update complaint status
- **Comments System**: Add internal/public comments with markdown support

## 📁 Project Structure

```
complaint-hub-pro/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   │   ├── authController.ts
│   │   │   ├── complaintsController.ts
│   │   │   └── commentsController.ts
│   │   ├── middleware/         # Authentication & validation
│   │   │   ├── authMiddleware.ts
│   │   │   ├── validationMiddleware.ts
│   │   │   └── errorMiddleware.ts
│   │   ├── routes/             # API routes
│   │   │   ├── auth.ts
│   │   │   └── complaints.ts
│   │   ├── config/             # Database configuration
│   │   │   └── database.ts
│   │   ├── utils/              # Utilities
│   │   │   └── markdown.ts
│   │   ├── types/              # TypeScript definitions
│   │   │   └── index.ts
│   │   └── app.ts              # Express server setup
│   └── database/
│       └── schema.sql          # Database schema
├── frontend/                   # React + TypeScript SPA
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/           # React context providers
│   │   │   └── AuthContext.tsx
│   │   ├── pages/              # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── ComplaintForm.tsx
│   │   │   ├── ComplaintTracker.tsx
│   │   │   ├── ComplaintDetails.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── utils/              # API client & utilities
│   │   │   ├── api.ts
│   │   │   └── fileUtils.ts
│   │   ├── types/              # TypeScript definitions
│   │   │   └── index.ts
│   │   └── App.tsx
│   └── public/
├── create-admin-user.js        # Admin user creation script
└── README.md
```

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git

### 1. Clone Repository
```bash
git clone https://github.com/PranavMishra17/complaint-hub-pro
cd complaint-hub-pro
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env` file:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-256-bit-secret-key-here
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

### 3. Database Setup
Create tables in your Supabase SQL editor using the schema from: [`backend/database/schema.sql`](backend/database/schema.sql)

### 4. Create Admin Users
```bash
node create-admin-user.js
```
Creates 3 demo users:
- `admin@demo.com` (Admin)
- `agent@demo.com` (Agent) 
- `manager@demo.com` (Admin)
- Password: `admin123`

### 5. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

### 6. Start Development Servers
```bash

# Run in one command
npm run dev

# Or run seperately
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

Access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Admin Login**: Use demo credentials above

## 🌐 Deployment

### Quick Deploy to Vercel
1. Push code to GitHub
2. Connect repo to Vercel (frontend & backend as separate projects)
3. Set environment variables
4. Deploy with one click

Detailed guide: [`DEPLOYMENT.md`](DEPLOYMENT.md)

### GitHub Actions
Automatic deployment on every push to main branch. Configure secrets in GitHub repository settings.

### Production URLs
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-api.vercel.app/api`

## 🔌 Backend API Endpoints

### Public Endpoints
- `POST /api/complaints` - Submit new complaint ([controller](backend/src/controllers/complaintsController.ts))
- `GET /api/complaints/public/:trackingId` - Get complaint by tracking ID
- `PATCH /api/complaints/public/:trackingId/withdraw` - Withdraw complaint

### Protected Admin Endpoints  
- `POST /api/auth/login` - Admin authentication ([controller](backend/src/controllers/authController.ts))
- `GET /api/auth/me` - Get current user info
- `GET /api/complaints` - List all complaints (paginated)
- `GET /api/complaints/:id` - Get specific complaint
- `PATCH /api/complaints/:id` - Update complaint status
- `DELETE /api/complaints/:id` - Delete complaint (admin only)
- `POST /api/complaints/:id/comments` - Add comment ([controller](backend/src/controllers/commentsController.ts))
- `GET /api/complaints/:id/comments` - Get complaint comments

Full route definitions: [`backend/src/routes/`](backend/src/routes/)

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure stateless authentication ([middleware](backend/src/middleware/authMiddleware.ts))
- **Password Hashing**: bcrypt with salt rounds of 12 ([auth controller](backend/src/controllers/authController.ts))
- **Token Validation**: Server-side token verification and user status checks

### Input Validation & Sanitization  
- **Server-side Validation**: express-validator with custom rules ([validation middleware](backend/src/middleware/validationMiddleware.ts))
- **HTML Sanitization**: DOMPurify prevents XSS attacks
- **Client-side Validation**: Zod schema validation with React Hook Form
- **SQL Injection Prevention**: Parameterized queries via Supabase client

### Security Middleware
- **Rate Limiting**: Express rate limiter (100 requests/15min)
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configured allowed origins (Commented out)
- **Request Size Limits**: JSON/form payload restrictions

## 📊 Database Design

### Core Tables
- **complaints**: Main complaint data with metadata
- **admin_users**: Admin authentication and roles  
- **complaint_comments**: Threaded comments system

### Security Features
- **UUID Primary Keys**: Non-sequential, secure identifiers
- **Timestamps**: Automatic created_at/updated_at tracking
- **Soft Deletes**: Data retention for audit trails
- **Indexing**: Optimized queries for status and date filtering

Complete schema: [`backend/database/schema.sql`](backend/database/schema.sql)

## 💾 Form Validation

### Frontend Validation
- **Real-time Validation**: Zod + React Hook Form
- **TypeScript Types**: End-to-end type safety
- **User Experience**: Instant feedback with error messages

### Backend Validation  
- **Double Validation**: Server-side validation with express-validator
- **Sanitization**: HTML content cleaning and escaping
- **Business Logic**: Custom validation rules for complaint content

Validation rules: [`backend/src/middleware/validationMiddleware.ts`](backend/src/middleware/validationMiddleware.ts)

## 📱 Demo Screenshots

### Public Interface
![Landing Page](pics/landing-page.png)
*Main landing page with options to submit complaint, track existing complaints, or access admin panel*

![Complaint Form](pics/complaint-form.png)  
*Rich complaint submission form with markdown support and real-time validation*

![Complaint Tracker](pics/complaint-tracker.png)
*Public complaint tracking interface using 8-character tracking ID*

![Complaint Details](pics/complaint-details.png)
*Public complaint view showing status, details, and public comments*

### Admin Interface
![Admin Login](pics/admin-login.png)
*Secure admin authentication with role-based access control*

![Admin Dashboard](pics/admin-dashboard.png)
*Comprehensive admin dashboard with complaint management, filtering, and pagination*

![Admin Complaint Details](pics/admin-complaint-details.png)
*Full admin complaint view with status management, internal comments, and administrative actions*

## 🔄 Assumptions and Tradeoffs

### Assumptions Made
- **Single Tenant**: System designed for single organization use
- **English Only**: No internationalization implemented
- **Modern Browsers**: ES2020+ JavaScript features used
- **Supabase Database**: PostgreSQL via Supabase for development simplicity

### Tradeoffs
- **No File Attachments**: Focused on core functionality over file handling complexity
- **Basic Email**: No automated email notifications implemented (Just syntax check)
- **Simple Roles**: Two-tier permission system (Admin/Agent) vs granular permissions
- **Client-Side Routing**: SPA approach vs SSR for better interactivity

## 🚀 What Would Be Improved Next Time

### High Priority
- **File Attachment System**: Secure file upload with virus scanning and type validation
- **Email Notifications**: Automated updates to users on complaint status changes
- **Real-time Updates**: WebSocket integration for live dashboard updates
- **Advanced Search**: Full-text search with filters and sorting options
- **Dashboard Features**: Additional features to view analytics of types of complaints, and options to tag collegues in threads.

### Enhanced Security
- **Multi-Factor Authentication**: TOTP/SMS verification for admin accounts
- **Session Management**: Advanced session controls and device tracking  
- **Audit Logging**: Comprehensive activity logs for compliance
- **Content Security Policy**: Enhanced XSS protection

### User Experience  
- **Mobile Optimization**: Responsive design improvements
- **Offline Support**: Progressive Web App capabilities
- **Advanced Analytics**: Complaint trend analysis and reporting
- **Bulk Operations**: Mass status updates and exports

### System Architecture
- **Microservices**: Break down monolithic backend
- **Caching Layer**: Redis for improved performance  
- **CDN Integration**: Static asset optimization
- **Monitoring**: Application performance and error tracking

## 🧪 Usage

1. **Submit Complaint**: Visit homepage → "Submit a Complaint" → Fill form → Get tracking ID
2. **Track Complaint**: Homepage → "Track Your Complaint" → Enter tracking ID → View status
3. **Admin Access**: Homepage → "Admin Access" → Login with demo credentials → Manage complaints
4. **Comment System**: Admins can add internal/public comments with markdown support
5. **Status Management**: Admins can toggle complaint status between Pending/Resolved

---

**Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Node.js + Express + Supabase + PostgreSQL  
**Security**: JWT Authentication + bcrypt + Input Validation + XSS Protection + CORS + Rate Limiting

---
