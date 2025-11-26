import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { secureLog } from './logger';

// Production security configuration
export const productionSecurityMiddleware = {
  // Enhanced rate limiting for production
  createRateLimit: () => rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Stricter in production
    message: {
      error: 'Too many requests from this IP',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      secureLog.warn('Rate limit exceeded', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        endpoint: req.path 
      });
      res.status(429).json({
        error: 'Too many requests from this IP',
        retryAfter: '15 minutes'
      });
    }
  }),

  // Enhanced Helmet configuration for healthcare compliance
  helmetConfig: () => helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: [
          "'self'", 
          "https://api.stripe.com",
          "https://*.speech.microsoft.com",
          "https://*.cognitiveservices.azure.com"
        ],
        frameSrc: ["https://js.stripe.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }),

  // Request sanitization for HIPAA compliance
  sanitizeRequest: (req: Request, res: Response, next: NextFunction) => {
    // Remove potentially dangerous headers
    delete req.headers['x-forwarded-host'];
    delete req.headers['x-real-ip'];
    
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = (req.query[key] as string)
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        }
      });
    }
    
    next();
  },

  // API version validation
  validateApiVersion: (req: Request, res: Response, next: NextFunction) => {
    const apiVersion = req.headers['api-version'];
    const supportedVersions = ['v1', '1.0'];
    
    if (req.path.startsWith('/api/') && apiVersion && !supportedVersions.includes(apiVersion as string)) {
      return res.status(400).json({
        error: 'Unsupported API version',
        supportedVersions
      });
    }
    
    next();
  },

  // Request logging for audit trail
  auditLogger: (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logData = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('User-Agent')?.substring(0, 200) // Truncate long user agents
      };
      
      if (res.statusCode >= 400) {
        secureLog.warn('HTTP error response', logData);
      } else {
        secureLog.info('HTTP request completed', logData);
      }
    });
    
    next();
  },

  // Healthcare-specific security headers
  healthcareHeaders: (req: Request, res: Response, next: NextFunction) => {
    // HIPAA compliance headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Custom healthcare security headers
    res.setHeader('X-Healthcare-Platform', 'NexxusBridge-AI');
    res.setHeader('X-HIPAA-Compliant', 'true');
    res.setHeader('X-Contact', 'info@nexxusbridge.com');
    
    next();
  }
};

// Error handling for production
export const productionErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log the error securely
  secureLog.error('Production error occurred', err, {
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request',
      contact: 'For assistance, contact support at info@nexxusbridge.com or (706) 618-0236',
      timestamp: new Date().toISOString()
    });
  } else {
    // Development mode - show detailed errors
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }
};