export interface DeviceInfo {
  type: 'ios' | 'android' | 'desktop';
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isPWA: boolean;
  canInstall: boolean;
  osVersion: string | null;
  browser: string;
}

export function detectDevice(): DeviceInfo {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Detect iOS (including modern iPadOS 13+ which reports as Macintosh)
  const isIOS = (
    /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
  ) || (
    // Modern iPadOS detection (reports as Macintosh with touch support)
    userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1
  );
  
  // Detect Android
  const isAndroid = /android/i.test(userAgent);
  
  // Detect if running as PWA
  const isPWA = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');
  
  // Detect if can install PWA
  const canInstall = !isPWA && (isIOS || isAndroid);
  
  // Get OS version
  let osVersion: string | null = null;
  if (isIOS) {
    // Try to get iOS version from user agent
    const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (match) {
      osVersion = `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}`;
    } else if (userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1) {
      // iPadOS 13+ reports as Mac, estimate version from Safari version if available
      const safariMatch = userAgent.match(/Version\/(\d+\.\d+)/);
      if (safariMatch) {
        osVersion = `${safariMatch[1]} (iPadOS)`;
      } else {
        osVersion = '13+ (iPadOS)';
      }
    }
  } else if (isAndroid) {
    const match = userAgent.match(/Android\s([0-9.]+)/);
    if (match) {
      osVersion = match[1];
    }
  }
  
  // Detect browser
  let browser = 'unknown';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'safari';
  } else if (userAgent.includes('Chrome')) {
    browser = 'chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'firefox';
  }
  
  const isMobile = isIOS || isAndroid;
  const type = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';
  
  return {
    type,
    isIOS,
    isAndroid,
    isMobile,
    isDesktop: !isMobile,
    isPWA,
    canInstall,
    osVersion,
    browser
  };
}

export function getInstallInstructions(deviceInfo: DeviceInfo): string[] {
  if (deviceInfo.isIOS) {
    return [
      'Tap the Share button (square with arrow)',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" in the top right corner',
      'The app will appear on your home screen'
    ];
  } else if (deviceInfo.isAndroid) {
    if (deviceInfo.browser === 'chrome') {
      return [
        'Tap the menu (three dots) in the top right',
        'Tap "Add to Home screen" or "Install app"',
        'Tap "Install" or "Add"',
        'The app will appear on your home screen'
      ];
    } else {
      return [
        'Tap the menu in your browser',
        'Look for "Add to Home screen" or "Install"',
        'Follow the prompts to install',
        'The app will appear on your home screen'
      ];
    }
  }
  
  return ['This feature is available on mobile devices'];
}

// Hook to use device detection in React components
export function useDeviceDetection(): DeviceInfo {
  return detectDevice();
}

// Viewport detection for responsive design
export function getViewportSize(): { width: number; height: number; isSmall: boolean; isMedium: boolean; isLarge: boolean } {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  return {
    width,
    height,
    isSmall: width < 640,  // Mobile
    isMedium: width >= 640 && width < 1024,  // Tablet
    isLarge: width >= 1024  // Desktop
  };
}
