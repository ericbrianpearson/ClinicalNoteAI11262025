import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <Alert className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-blue-50 border-blue-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <AlertDescription>
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Install Health Scribe AI</span>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Install our mobile app for quick access and offline capabilities
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleInstall} 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-install-app"
              >
                Install App
              </Button>
              <Button 
                onClick={handleDismiss} 
                size="sm" 
                variant="outline"
                data-testid="button-dismiss-install"
              >
                Not Now
              </Button>
            </div>
          </AlertDescription>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
}
