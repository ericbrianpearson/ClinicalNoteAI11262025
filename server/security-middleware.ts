import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize DOMPurify with jsdom for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }

  next();
}

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        obj[key] = purify.sanitize(obj[key], { 
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [] 
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
}

// Enhanced error handling middleware
export function secureErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log full error for debugging (ensure this doesn't contain PHI)
  console.error('Security Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Send generic error response to client
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Invalid input data provided'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed'
    });
  }

  if (err.status === 401 || err.message.includes('Unauthorized')) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  if (err.status === 403 || err.message.includes('Forbidden')) {
    return res.status(403).json({
      error: 'Access denied'
    });
  }

  // Generic server error
  res.status(500).json({
    error: 'Internal server error'
  });
}

// Account lockout tracking
const loginAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>();

export function accountLockoutMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path !== '/api/auth/login' || req.method !== 'POST') {
    return next();
  }

  const email = req.body?.email;
  if (!email) {
    return next();
  }

  const attempts = loginAttempts.get(email);
  const now = new Date();

  // Check if account is locked
  if (attempts?.lockedUntil && now < attempts.lockedUntil) {
    const remainingTime = Math.ceil((attempts.lockedUntil.getTime() - now.getTime()) / 1000);
    return res.status(429).json({
      error: `Account temporarily locked. Try again in ${remainingTime} seconds.`
    });
  }

  // Store original end function to intercept response
  const originalSend = res.send;
  res.send = function(data: any) {
    const response = typeof data === 'string' ? JSON.parse(data) : data;
    
    if (res.statusCode === 401 || response?.error?.includes('Invalid credentials')) {
      // Failed login attempt
      const currentAttempts = attempts || { count: 0, lastAttempt: now };
      currentAttempts.count++;
      currentAttempts.lastAttempt = now;

      // Progressive lockout: 5 attempts = 5 minutes, 10 attempts = 30 minutes
      if (currentAttempts.count >= 10) {
        currentAttempts.lockedUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
      } else if (currentAttempts.count >= 5) {
        currentAttempts.lockedUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
      }

      loginAttempts.set(email, currentAttempts);
    } else if (res.statusCode === 200) {
      // Successful login - clear attempts
      loginAttempts.delete(email);
    }

    return originalSend.call(this, data);
  };

  next();
}

// CORS configuration for specific origins
export function configureCORS(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    'http://localhost:5000',
    'https://localhost:5000',
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.REPLIT_DOMAINS?.split(',').map(domain => `https://${domain}`) || []
  ].flat();

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}