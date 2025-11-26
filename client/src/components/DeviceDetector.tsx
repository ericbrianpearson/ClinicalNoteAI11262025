import { useEffect } from 'react';
import { detectDevice } from '@/lib/device-detection';

export function DeviceDetector() {
  useEffect(() => {
    const device = detectDevice();
    
    // Log device info for debugging
    console.log('📱 Device Detection:', {
      type: device.type,
      os: device.isIOS ? `iOS ${device.osVersion}` : device.isAndroid ? `Android ${device.osVersion}` : 'Desktop',
      browser: device.browser,
      isPWA: device.isPWA ? 'Running as PWA ✅' : 'Running in browser',
      canInstall: device.canInstall
    });

    // Add device-specific classes to HTML element for CSS targeting
    const html = document.documentElement;
    html.classList.add(`device-${device.type}`);
    
    if (device.isPWA) {
      html.classList.add('pwa-mode');
    }
    
    if (device.isMobile) {
      html.classList.add('mobile');
    } else {
      html.classList.add('desktop');
    }

    // Set CSS custom properties for safe area insets (iOS notch support)
    if (device.isIOS) {
      html.style.setProperty('--sat', 'env(safe-area-inset-top)');
      html.style.setProperty('--sar', 'env(safe-area-inset-right)');
      html.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
      html.style.setProperty('--sal', 'env(safe-area-inset-left)');
    }

    // Optimize viewport for mobile
    if (device.isMobile) {
      // Prevent zoom on input focus (iOS)
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Prevent pull-to-refresh on mobile (if PWA)
      if (device.isPWA) {
        document.body.style.overscrollBehavior = 'none';
      }
    }

    // Handle iOS standalone mode (PWA)
    if (device.isIOS && device.isPWA) {
      // Adjust for status bar in standalone mode
      document.body.style.paddingTop = 'env(safe-area-inset-top)';
      document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
    }

  }, []);

  return null;
}
