export const convertBlobToWav = async (blob: Blob): Promise<Blob> => {
  // For now, we'll return the blob as-is since most browsers support WebM
  // In production, you might want to use a library like lamejs to convert to WAV
  return blob;
};

export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/x-wav', 'audio/x-m4a'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
    return { valid: false, error: 'Please upload an audio file (MP3, WAV, M4A)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' };
  }

  return { valid: true };
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });
    audio.addEventListener('error', reject);
    audio.src = URL.createObjectURL(file);
  });
};
