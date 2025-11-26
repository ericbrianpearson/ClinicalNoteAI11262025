import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
}

/**
 * Professional brand logo component featuring microphone icon
 * Supports multiple sizes and variants (full logo with text or icon only)
 */
export function BrandLogo({ size = 'md', variant = 'full', className = '' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Microphone Icon */}
      <motion.div
        className={`relative ${sizeClasses[size]} flex-shrink-0`}
        whileHover={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.4 }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Microphone Body */}
          <motion.rect
            x="12"
            y="4"
            width="8"
            height="12"
            rx="4"
            fill="currentColor"
            className="text-primary"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          />
          
          {/* Microphone Grid Pattern */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <line x1="14" y1="7" x2="18" y2="7" stroke="white" strokeWidth="0.5" />
            <line x1="14" y1="9" x2="18" y2="9" stroke="white" strokeWidth="0.5" />
            <line x1="14" y1="11" x2="18" y2="11" stroke="white" strokeWidth="0.5" />
            <line x1="14" y1="13" x2="18" y2="13" stroke="white" strokeWidth="0.5" />
          </motion.g>
          
          {/* Microphone Stand */}
          <motion.path
            d="M16 16V24M12 24H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          />
          
          {/* Sound Waves */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <path
              d="M24 10C24 12 22 14 22 16C22 18 24 20 24 22"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              className="text-primary/60"
            />
            <path
              d="M26 8C26 11 24 13 24 16C24 19 26 21 26 24"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              className="text-primary/40"
            />
          </motion.g>
        </svg>
      </motion.div>

      {/* Brand Text */}
      {variant === 'full' && (
        <motion.div
          className="flex flex-col leading-none"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className={`font-bold text-foreground ${textSizeClasses[size]}`}>
            Health Scribe AI
          </span>
          <span className="text-muted-foreground text-xs font-medium tracking-wide">
            Clinical Documentation
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}