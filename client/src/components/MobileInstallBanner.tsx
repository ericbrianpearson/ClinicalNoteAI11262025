import { useState, useEffect } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { detectDevice, getInstallInstructions } from '@/lib/device-detection';

export function MobileInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const deviceInfo = detectDevice();

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('install-banner-dismissed');
    
    if (!dismissed && deviceInfo.canInstall && !deviceInfo.isPWA) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 3000);
    }

    // Listen for the beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deviceInfo]);

  const handleInstall = async () => {
    if (deferredPrompt && deviceInfo.isAndroid) {
      // Android: Show native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      }
      setDeferredPrompt(null);
      setShowBanner(false);
    } else {
      // iOS: Can't programmatically trigger, just show banner stays open
      // User will see the instructions
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('install-banner-dismissed', 'true');
  };

  if (!showBanner || deviceInfo.isPWA) {
    return null;
  }

  const instructions = getInstallInstructions(deviceInfo);
  const icon = deviceInfo.isIOS ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up" data-testid="banner-mobile-install">
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl border-0">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <h3 className="font-semibold text-lg" data-testid="text-install-title">
                  Install Health Scribe AI
                </h3>
                <p className="text-sm text-blue-100" data-testid="text-install-subtitle">
                  Get the app experience on your {deviceInfo.type === 'ios' ? 'iPhone' : 'Android device'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-blue-800/50 -mt-1 -mr-1"
              data-testid="button-dismiss-install"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {deviceInfo.isAndroid && deferredPrompt ? (
            <Button
              onClick={handleInstall}
              className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
              data-testid="button-install-android"
            >
              <Download className="h-4 w-4 mr-2" />
              Install Now
            </Button>
          ) : (
            <div className="space-y-2" data-testid="container-install-instructions">
              <p className="text-sm font-medium text-blue-100">To install:</p>
              <ol className="text-sm space-y-1.5 ml-1">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2" data-testid={`text-instruction-${index + 1}`}>
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-blue-50 pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
