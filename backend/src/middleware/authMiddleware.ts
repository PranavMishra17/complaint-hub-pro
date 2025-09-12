import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AuthenticatedRequest } from '../types';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🔐 AuthMiddleware: Starting token authentication', {
      url: req.url,
      method: req.method,
      hasAuthHeader: !!req.get('authorization'),
      userAgent: req.get('user-agent')?.substring(0, 50),
      timestamp: new Date().toISOString()
    });

    const authHeader = req.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔑 AuthMiddleware: Token extraction', {
      hasAuthHeader: !!authHeader,
      authHeaderFormat: authHeader ? `${authHeader.substring(0, 20)}...` : 'none',
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
      timestamp: new Date().toISOString()
    });

    if (!token) {
      console.log('❌ AuthMiddleware: No token provided');
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    console.log('🔍 AuthMiddleware: Verifying JWT token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    console.log('✅ AuthMiddleware: JWT decoded successfully', {
      userId: decoded.id,
      userEmail: decoded.email,
      userRole: decoded.role,
      exp: decoded.exp,
      isExpired: decoded.exp < Math.floor(Date.now() / 1000),
      timestamp: new Date().toISOString()
    });

    // Verify user still exists and is active
    console.log('👤 AuthMiddleware: Fetching user from database');
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, role, is_active')
      .eq('id', decoded.id)
      .single();

    console.log('📊 AuthMiddleware: Database query result', {
      hasUser: !!user,
      hasError: !!error,
      error: error?.message,
      userActive: user?.is_active,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      timestamp: new Date().toISOString()
    });

    if (error || !user || !user.is_active) {
      console.log('❌ AuthMiddleware: User validation failed', {
        reason: error ? 'Database error' : !user ? 'User not found' : 'User inactive',
        timestamp: new Date().toISOString()
      });
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    console.log('✅ AuthMiddleware: Authentication successful, proceeding to next middleware');
    next();
  } catch (error: any) {
    console.error('❌ AuthMiddleware: Authentication error:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 200),
      isTokenExpired: error.name === 'TokenExpiredError',
      isJWTError: error.name === 'JsonWebTokenError',
      timestamp: new Date().toISOString()
    });
    
    res.status(403).json({
      success: false,
      error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }
    next();
  };
};