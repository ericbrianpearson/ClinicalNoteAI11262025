import winston from 'winston';

// Production-ready logging configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nexxusbridge-healthcare-ai' },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
});

// Console logging for development
if (isDevelopment) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        const formattedTime = new Date(timestamp as string).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        return `${formattedTime} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
      })
    )
  }));
}

// HIPAA-compliant logging functions (no PHI exposure)
export const secureLog = {
  info: (message: string, meta?: any) => {
    logger.info(message, sanitizeMeta(meta));
  },
  error: (message: string, error?: Error, meta?: any) => {
    logger.error(message, { 
      error: error?.message, 
      stack: isProduction ? undefined : error?.stack,
      ...sanitizeMeta(meta) 
    });
  },
  warn: (message: string, meta?: any) => {
    logger.warn(message, sanitizeMeta(meta));
  },
  debug: (message: string, meta?: any) => {
    if (isDevelopment) {
      logger.debug(message, sanitizeMeta(meta));
    }
  }
};

// Sanitize metadata to prevent PHI exposure
function sanitizeMeta(meta: any): any {
  if (!meta) return {};
  
  const sanitized = { ...meta };
  
  // Remove sensitive fields that might contain PHI
  const sensitiveFields = [
    'email', 'phone', 'address', 'dateOfBirth', 'ssn', 
    'medicalHistory', 'diagnosis', 'transcription', 'notes',
    'patientName', 'practitionerName', 'password', 'token'
  ];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

export default logger;