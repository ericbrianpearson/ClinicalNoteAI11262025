import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface AutoSaveData {
  encounterId?: number;
  patientId?: string;
  transcriptionText?: string;
  audioBlob?: Blob;
  videoBlob?: Blob;
  images?: File[];
  formData?: Record<string, any>;
  timestamp: number;
  status: 'draft' | 'saving' | 'saved' | 'error';
}

interface UseAutoSaveOptions {
  encounterId?: number;
  saveInterval?: number; // milliseconds
  debounceDelay?: number; // milliseconds
  maxRetries?: number;
}

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const {
    encounterId,
    saveInterval = 30000, // 30 seconds
    debounceDelay = 2000, // 2 seconds
    maxRetries = 3
  } = options;

  const [autoSaveData, setAutoSaveData] = useState<AutoSaveData>({
    timestamp: Date.now(),
    status: 'draft'
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const cacheKeyRef = useRef(`autosave_${encounterId || 'temp'}`);

  // Load from local cache on mount
  useEffect(() => {
    const loadFromCache = () => {
      try {
        const cached = localStorage.getItem(cacheKeyRef.current);
        if (cached) {
          const parsedData = JSON.parse(cached);
          // Only load if data is less than 24 hours old
          if (Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
            setAutoSaveData(prev => ({ ...prev, ...parsedData }));
            console.log('Loaded encounter data from cache');
          }
        }
      } catch (error) {
        console.error('Failed to load from cache:', error);
      }
    };

    loadFromCache();
  }, [encounterId]);

  // Save to local cache
  const saveToCache = useCallback((data: Partial<AutoSaveData>) => {
    try {
      const updatedData = {
        ...autoSaveData,
        ...data,
        timestamp: Date.now()
      };
      
      // Don't store blobs in localStorage - convert to base64 if needed
      const cacheData = {
        ...updatedData,
        audioBlob: undefined,
        videoBlob: undefined,
        images: undefined
      };
      
      localStorage.setItem(cacheKeyRef.current, JSON.stringify(cacheData));
      setAutoSaveData(updatedData);
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }, [autoSaveData]);

  // Save to backend
  const saveToBackend = useCallback(async (data: Partial<AutoSaveData>) => {
    if (!encounterId) return;

    setSaveStatus('saving');
    
    try {
      const formData = new FormData();
      formData.append('encounterId', encounterId.toString());
      formData.append('autoSaveData', JSON.stringify({
        patientId: data.patientId,
        transcriptionText: data.transcriptionText,
        formData: data.formData,
        timestamp: data.timestamp
      }));

      // Add binary data if present
      if (data.audioBlob) {
        formData.append('audioBlob', data.audioBlob, 'autosave_audio.wav');
      }
      if (data.videoBlob) {
        formData.append('videoBlob', data.videoBlob, 'autosave_video.webm');
      }
      if (data.images) {
        data.images.forEach((image, index) => {
          formData.append(`image_${index}`, image);
        });
      }

      await apiRequest('POST', '/api/encounters/auto-save', formData);
      
      setSaveStatus('saved');
      setLastSaved(new Date());
      retryCountRef.current = 0;
      
      console.log('Data auto-saved to backend');
    } catch (error) {
      console.error('Auto-save to backend failed:', error);
      setSaveStatus('error');
      
      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => saveToBackend(data), 5000 * retryCountRef.current);
      }
    }
  }, [encounterId, maxRetries]);

  // Debounced save function
  const debouncedSave = useCallback((data: Partial<AutoSaveData>) => {
    // Always save to cache immediately
    saveToCache(data);

    // Debounce backend save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToBackend(data);
    }, debounceDelay);
  }, [saveToCache, saveToBackend, debounceDelay]);

  // Periodic auto-save
  useEffect(() => {
    if (!encounterId) return;

    intervalRef.current = setInterval(() => {
      if (autoSaveData.status === 'draft' && autoSaveData.timestamp) {
        saveToBackend(autoSaveData);
      }
    }, saveInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [encounterId, saveInterval, autoSaveData, saveToBackend]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Public API
  const saveData = useCallback((data: Partial<AutoSaveData>) => {
    debouncedSave({
      ...data,
      status: 'draft'
    });
  }, [debouncedSave]);

  const saveTranscription = useCallback((text: string) => {
    saveData({ transcriptionText: text });
  }, [saveData]);

  const saveAudio = useCallback((blob: Blob) => {
    saveData({ audioBlob: blob });
  }, [saveData]);

  const saveVideo = useCallback((blob: Blob) => {
    saveData({ videoBlob: blob });
  }, [saveData]);

  const saveImages = useCallback((images: File[]) => {
    saveData({ images });
  }, [saveData]);

  const saveFormData = useCallback((formData: Record<string, any>) => {
    saveData({ formData });
  }, [saveData]);

  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveToBackend(autoSaveData);
  }, [autoSaveData, saveToBackend]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(cacheKeyRef.current);
      setAutoSaveData({
        timestamp: Date.now(),
        status: 'draft'
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, []);

  const loadFromBackend = useCallback(async () => {
    if (!encounterId) return;

    try {
      const response = await apiRequest('GET', `/api/encounters/${encounterId}/auto-save`);
      if (response.autoSaveData) {
        setAutoSaveData(prev => ({
          ...prev,
          ...response.autoSaveData,
          status: 'saved'
        }));
      }
    } catch (error) {
      console.error('Failed to load from backend:', error);
    }
  }, [encounterId]);

  return {
    // Data
    autoSaveData,
    saveStatus,
    lastSaved,
    
    // Actions
    saveData,
    saveTranscription,
    saveAudio,
    saveVideo,
    saveImages,
    saveFormData,
    forceSave,
    clearCache,
    loadFromBackend,
    
    // Status
    isSaving: saveStatus === 'saving',
    hasUnsavedChanges: saveStatus === 'idle' || saveStatus === 'error',
    isError: saveStatus === 'error'
  };
}