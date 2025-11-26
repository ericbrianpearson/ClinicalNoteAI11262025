import { Moon, Sun, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';

/**
 * Theme toggle component with smooth animations and accessibility support
 * Supports light, dark, and system theme preferences
 */
export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  // Icon animation variants
  const iconVariants = {
    initial: { scale: 0.8, rotate: -90, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    exit: { scale: 0.8, rotate: 90, opacity: 0 }
  };

  // Current theme icon based on actual theme
  const ThemeIcon = actualTheme === 'dark' ? Moon : Sun;

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, themeValue: 'light' | 'dark' | 'system') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setTheme(themeValue);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 px-0 hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label={`Current theme: ${theme}. Click to change theme`}
        >
          <motion.div
            key={actualTheme}
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ThemeIcon className="h-4 w-4" />
          </motion.div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="cursor-pointer flex items-center gap-2"
          aria-label="Switch to light theme"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <Sun className="h-4 w-4" />
          </motion.div>
          <span>Light</span>
          {theme === 'light' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto h-2 w-2 rounded-full bg-primary"
            />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="cursor-pointer flex items-center gap-2"
          aria-label="Switch to dark theme"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <Moon className="h-4 w-4" />
          </motion.div>
          <span>Dark</span>
          {theme === 'dark' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto h-2 w-2 rounded-full bg-primary"
            />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="cursor-pointer flex items-center gap-2"
          aria-label="Use system theme preference"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <Monitor className="h-4 w-4" />
          </motion.div>
          <span>System</span>
          {theme === 'system' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto h-2 w-2 rounded-full bg-primary"
            />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}