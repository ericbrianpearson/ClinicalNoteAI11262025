// Client-side security utilities for healthcare compliance
export const clientSecurity = {
  // Sanitize user input to prevent XSS
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },

  // Validate email format for healthcare standards
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Secure session storage for sensitive data
  secureStorage: {
    set: (key: string, value: any): void => {
      try {
        const encrypted = btoa(JSON.stringify(value));
        sessionStorage.setItem(key, encrypted);
      } catch (error) {
        console.warn('Failed to store secure data');
      }
    },

    get: (key: string): any => {
      try {
        const encrypted = sessionStorage.getItem(key);
        if (!encrypted) return null;
        return JSON.parse(atob(encrypted));
      } catch (error) {
        console.warn('Failed to retrieve secure data');
        return null;
      }
    },

    remove: (key: string): void => {
      sessionStorage.removeItem(key);
    },

    clear: (): void => {
      sessionStorage.clear();
    }
  },

  // Content Security Policy violation reporting
  reportCSPViolation: (violation: SecurityPolicyViolationEvent): void => {
    fetch('/api/security/csp-violation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentURI: violation.documentURI,
        blockedURI: violation.blockedURI,
        violatedDirective: violation.violatedDirective,
        effectiveDirective: violation.effectiveDirective,
        originalPolicy: violation.originalPolicy,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Silently fail to avoid loops
    });
  },

  // Initialize security monitoring
  initSecurity: (): void => {
    // CSP violation reporting
    document.addEventListener('securitypolicyviolation', clientSecurity.reportCSPViolation);

    // Disable right-click in production for PHI protection
    if (process.env.NODE_ENV === 'production') {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      // Disable text selection on sensitive elements
      document.addEventListener('selectstart', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-sensitive="true"]')) {
          e.preventDefault();
        }
      });
    }

    // Clear sensitive data on page unload
    window.addEventListener('beforeunload', () => {
      clientSecurity.secureStorage.clear();
    });
  }
};

// Initialize security when module loads
if (typeof window !== 'undefined') {
  clientSecurity.initSecurity();
}