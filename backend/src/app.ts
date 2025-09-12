import express from 'express';

import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler, notFound } from './middleware/errorMiddleware';
import complaintsRouter from './routes/complaints';
import authRouter from './routes/auth';

dotenv.config();

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow for development
}));
app.use(compression());

// CORS configuration - TEMPORARILY BYPASSED FOR DEBUGGING
// app.use(cors({
//   origin: (origin, callback) => {
//     console.log('🔍 CORS Check:', {
//       origin,
//       nodeEnv: process.env.NODE_ENV,
//       allowedOrigins: process.env.ALLOWED_ORIGINS?.split(','),
//       timestamp: new Date().toISOString()
//     });

//     // Allow requests with no origin (mobile apps, curl, etc.)
//     if (!origin) {
//       console.log('✅ CORS: Allowing request with no origin');
//       return callback(null, true);
//     }
    
//     // In development, allow all localhost origins (updated)
//     if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
//       console.log('✅ CORS: Allowing localhost origin in development:', origin);
//       return callback(null, true);
//     }
    
//     // In production, check allowed origins
//     const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
//     if (allowedOrigins.includes(origin)) {
//       console.log('✅ CORS: Allowing whitelisted origin:', origin);
//       return callback(null, true);
//     }
    
//     console.log('❌ CORS: Blocking origin:', origin, 'Allowed:', allowedOrigins);
//     callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// CORS COMPLETELY DISABLED FOR DEBUGGING
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
console.log('🚨 CORS COMPLETELY DISABLED - NO RESTRICTIONS');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting to API routes
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Request logging middleware
app.use('/api', (req, _res, next) => {
  console.log('📝 API Request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']?.substring(0, 50),
    timestamp: new Date().toISOString()
  });
  next();
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;