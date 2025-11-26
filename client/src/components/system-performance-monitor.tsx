import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Monitor, Cpu, HardDrive, Mic, Video, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PerformanceMetrics {
  cpu: {
    usage: number;
    cores: number;
    speed: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
  };
  audio: {
    status: 'healthy' | 'warning' | 'error';
    sampleRate: number;
    bufferSize: number;
    latency: number;
  };
  video: {
    status: 'healthy' | 'warning' | 'error';
    fps: number;
    resolution: string;
    bitrate: number;
  };
  browser: {
    vendor: string;
    version: string;
    engine: string;
  };
}

interface SystemPerformanceMonitorProps {
  isRecording?: boolean;
  isVideoRecording?: boolean;
  className?: string;
}

export default function SystemPerformanceMonitor({ 
  isRecording = false, 
  isVideoRecording = false,
  className = "" 
}: SystemPerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: { usage: 0, cores: 1, speed: 0 },
    memory: { used: 0, total: 0, percentage: 0 },
    network: { downloadSpeed: 0, uploadSpeed: 0, latency: 0 },
    audio: { status: 'healthy', sampleRate: 0, bufferSize: 0, latency: 0 },
    video: { status: 'healthy', fps: 0, resolution: '0x0', bitrate: 0 },
    browser: { vendor: '', version: '', engine: '' }
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const performanceObserverRef = useRef<PerformanceObserver>();

  // Initialize performance monitoring
  useEffect(() => {
    initializeMonitoring();
    startMonitoring();

    return () => {
      stopMonitoring();
    };
  }, []);

  const initializeMonitoring = () => {
    // Get browser information
    const navigator = window.navigator;
    const browserInfo = {
      vendor: navigator.vendor || 'Unknown',
      version: navigator.appVersion || 'Unknown',
      engine: navigator.userAgent.includes('WebKit') ? 'WebKit' : 
              navigator.userAgent.includes('Gecko') ? 'Gecko' : 'Unknown'
    };

    setMetrics(prev => ({
      ...prev,
      browser: browserInfo,
      cpu: {
        ...prev.cpu,
        cores: navigator.hardwareConcurrency || 1
      }
    }));

    // Set up Performance Observer for frame timing
    if ('PerformanceObserver' in window) {
      try {
        performanceObserverRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'measure') {
              // Handle custom performance measures
            }
          });
        });
        
        performanceObserverRef.current.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    
    intervalRef.current = setInterval(() => {
      updateMetrics();
    }, 1000); // Update every second
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
    }
  };

  const updateMetrics = async () => {
    try {
      // Memory metrics
      const memoryInfo = await getMemoryInfo();
      
      // CPU estimation (simplified)
      const cpuUsage = await estimateCPUUsage();
      
      // Network metrics
      const networkInfo = await getNetworkInfo();
      
      // Audio/Video health checks
      const audioHealth = await checkAudioHealth();
      const videoHealth = await checkVideoHealth();

      setMetrics(prev => ({
        ...prev,
        memory: memoryInfo,
        cpu: { ...prev.cpu, usage: cpuUsage },
        network: networkInfo,
        audio: audioHealth,
        video: videoHealth
      }));
    } catch (error) {
      console.error('Failed to update performance metrics:', error);
    }
  };

  const getMemoryInfo = async () => {
    // Use Performance API memory info if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      };
    }
    
    // Fallback estimation
    return {
      used: 50,
      total: 100,
      percentage: 50
    };
  };

  const estimateCPUUsage = async () => {
    // Simplified CPU usage estimation based on performance timing
    const start = performance.now();
    
    // Perform a small computational task
    let result = 0;
    for (let i = 0; i < 100000; i++) {
      result += Math.random();
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Estimate CPU usage (this is a rough approximation)
    const estimatedUsage = Math.min(Math.round(duration / 10), 100);
    return estimatedUsage;
  };

  const getNetworkInfo = async () => {
    // Use Network Information API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        downloadSpeed: connection.downlink || 0,
        uploadSpeed: connection.uplink || 0,
        latency: connection.rtt || 0
      };
    }
    
    // Fallback: measure ping to our server
    try {
      const start = performance.now();
      await fetch('/api/ping', { method: 'HEAD' });
      const latency = performance.now() - start;
      
      return {
        downloadSpeed: 10, // Estimated
        uploadSpeed: 5,    // Estimated
        latency: Math.round(latency)
      };
    } catch {
      return {
        downloadSpeed: 0,
        uploadSpeed: 0,
        latency: 0
      };
    }
  };

  const checkAudioHealth = async () => {
    if (!isRecording) {
      return {
        status: 'healthy' as const,
        sampleRate: 0,
        bufferSize: 0,
        latency: 0
      };
    }

    try {
      // Check if audio context is available and healthy
      if (typeof AudioContext !== 'undefined') {
        const audioContext = new AudioContext();
        const status = audioContext.state === 'running' ? 'healthy' : 'warning';
        
        const result = {
          status: status as const,
          sampleRate: audioContext.sampleRate,
          bufferSize: audioContext.baseLatency * audioContext.sampleRate,
          latency: Math.round(audioContext.baseLatency * 1000) // ms
        };
        
        audioContext.close();
        return result;
      }
    } catch (error) {
      console.error('Audio health check failed:', error);
    }

    return {
      status: 'error' as const,
      sampleRate: 0,
      bufferSize: 0,
      latency: 0
    };
  };

  const checkVideoHealth = async () => {
    if (!isVideoRecording) {
      return {
        status: 'healthy' as const,
        fps: 0,
        resolution: '0x0',
        bitrate: 0
      };
    }

    try {
      // Check video capabilities
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const capabilities = videoTrack.getCapabilities();
        
        stream.getTracks().forEach(track => track.stop());
        
        return {
          status: 'healthy' as const,
          fps: settings.frameRate || 30,
          resolution: `${settings.width}x${settings.height}`,
          bitrate: capabilities.bitRate?.[0] || 0
        };
      }
    } catch (error) {
      console.error('Video health check failed:', error);
    }

    return {
      status: 'error' as const,
      fps: 0,
      resolution: '0x0',
      bitrate: 0
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          System Performance
          {isMonitoring && (
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CPU & Memory */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span className="text-sm font-medium">CPU</span>
            </div>
            <Progress value={metrics.cpu.usage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{metrics.cpu.usage}%</span>
              <span>{metrics.cpu.cores} cores</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span className="text-sm font-medium">Memory</span>
            </div>
            <Progress value={metrics.memory.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{metrics.memory.percentage}%</span>
              <span>{metrics.memory.used}MB / {metrics.memory.total}MB</span>
            </div>
          </div>
        </div>

        {/* Audio/Video Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="text-sm">Audio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={getStatusColor(metrics.audio.status)}>
                {getStatusIcon(metrics.audio.status)}
              </div>
              <Badge variant="outline" className="text-xs">
                {metrics.audio.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="text-sm">Video</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={getStatusColor(metrics.video.status)}>
                {getStatusIcon(metrics.video.status)}
              </div>
              <Badge variant="outline" className="text-xs">
                {metrics.video.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Network</span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Download:</span>
              <br />
              <span className="font-medium">{metrics.network.downloadSpeed} Mbps</span>
            </div>
            <div>
              <span className="text-muted-foreground">Upload:</span>
              <br />
              <span className="font-medium">{metrics.network.uploadSpeed} Mbps</span>
            </div>
            <div>
              <span className="text-muted-foreground">Latency:</span>
              <br />
              <span className="font-medium">{metrics.network.latency}ms</span>
            </div>
          </div>
        </div>

        {/* Browser Info */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {metrics.browser.vendor} • {metrics.browser.engine}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}