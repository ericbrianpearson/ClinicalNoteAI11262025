import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import winston from "winston";
import { registerRoutes } from "./routes";
import { registerBillingRoutes } from "./billing";
import { registerDemoRoutes } from "./demo-routes";
import { registerAuthRoutes } from "./auth-routes";
import { registerPatientAuthRoutes } from "./patient-auth-routes";
import { setupVite, serveStatic, log } from "./vite";
import { sanitizeInput, secureErrorHandler, accountLockoutMiddleware, configureCORS } from "./security-middleware";

const app = express();

// Trust proxy for rate limiting (Replit uses reverse proxy)
app.set('trust proxy', 1);

// Enhanced security middleware for HIPAA compliance
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"], // Allow inline scripts for development
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'", 
        "ws://localhost:*", // Allow WebSocket connections for Vite HMR
        "wss://localhost:*",
        "https://api.stripe.com",
        "https://*.speech.microsoft.com",
        "https://*.cognitiveservices.azure.com"
      ],
      frameSrc: ["https://js.stripe.com"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  originAgentCluster: true,
  referrerPolicy: { policy: "no-referrer" },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Audit logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/audit.log' })
  ],
});

// Security middleware
app.use(configureCORS);
app.use(sanitizeInput);
app.use(accountLockoutMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Register authentication routes
  const { registerAuthRoutes } = await import('./auth-routes');
  registerAuthRoutes(app);
  
  // Register patient authentication routes
  const { registerPatientAuthRoutes } = await import('./patient-auth-routes');
  registerPatientAuthRoutes(app);
  
  // Register AI Assistant routes
  const { registerAIAssistantRoutes } = await import('./ai-assistant-routes');
  registerAIAssistantRoutes(app);
  
  // Register billing routes (test mode if no Stripe key)
  if (process.env.STRIPE_SECRET_KEY) {
    registerBillingRoutes(app);
  } else {
    const { registerTestBillingRoutes } = await import('./test-billing');
    registerTestBillingRoutes(app);
    console.log('Running in test mode - using test billing routes');
  }
  
  // Register authentication routes
  registerAuthRoutes(app);
  
  // Register demo routes (public AI preview)
  registerDemoRoutes(app);
  
  const server = await registerRoutes(app);

  // Use secure error handler
  app.use(secureErrorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
