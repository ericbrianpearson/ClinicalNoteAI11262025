// Production performance utilities
export const performance = {
  // Debounced API calls for better UX
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  },

  // Image optimization
  optimizeImage: (src: string, quality = 80): string => {
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      return src;
    }
    
    // Add quality parameter for dynamic image optimization
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}quality=${quality}&format=webp`;
  },

  // Browser feature detection
  detectFeatures: () => ({
    webp: (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })(),
    intersectionObserver: 'IntersectionObserver' in window,
    serviceWorker: 'serviceWorker' in navigator,
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })()
  }),

  // Preload critical resources
  preloadResource: (href: string, as: string = 'fetch'): void => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Optimize bundle loading
  loadChunk: async (chunkName: string): Promise<any> => {
    try {
      return await import(/* webpackChunkName: "dynamic-chunk" */ chunkName);
    } catch (error) {
      console.warn(`Failed to load chunk: ${chunkName}`);
      throw error;
    }
  }
};