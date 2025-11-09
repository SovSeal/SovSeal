import {
  SUPPORTED_AUDIO_FORMATS,
  SUPPORTED_VIDEO_FORMATS,
  MAX_FILE_SIZE,
  SUPPORTED_FILE_EXTENSIONS,
  type MediaType,
} from '@/types/media';

/**
 * Validate file type
 * Requirement 3.1: Validate that the file is an audio or video format
 */
export function validateFileType(file: File): {
  isValid: boolean;
  mediaType: MediaType | null;
  error?: string;
} {
  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Check by MIME type first
  if (SUPPORTED_AUDIO_FORMATS.includes(mimeType)) {
    return { isValid: true, mediaType: 'audio' };
  }

  if (SUPPORTED_VIDEO_FORMATS.includes(mimeType)) {
    return { isValid: true, mediaType: 'video' };
  }

  // Fallback to file extension check
  const hasValidExtension = SUPPORTED_FILE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (hasValidExtension) {
    // Determine type by extension
    const isAudio = ['.mp3', '.wav', '.ogg'].some((ext) => fileName.endsWith(ext));
    return {
      isValid: true,
      mediaType: isAudio ? 'audio' : 'video',
    };
  }

  return {
    isValid: false,
    mediaType: null,
    error: `Unsupported file format. Supported formats: ${SUPPORTED_FILE_EXTENSIONS.join(', ')}`,
  };
}

/**
 * Validate file size
 * Requirement 3.2: Warn if file exceeds 100MB
 */
export function validateFileSize(file: File): {
  isValid: boolean;
  isWarning: boolean;
  error?: string;
  warning?: string;
} {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: true,
      isWarning: true,
      warning: `File size is ${(file.size / 1024 / 1024).toFixed(2)} MB. Files larger than 100 MB may take longer to encrypt and upload.`,
    };
  }

  return {
    isValid: true,
    isWarning: false,
  };
}

/**
 * Get media duration from file
 */
export function getMediaDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const mediaType = file.type.startsWith('video') ? 'video' : 'audio';
    const element = document.createElement(mediaType);

    element.addEventListener('loadedmetadata', () => {
      const duration = element.duration;
      URL.revokeObjectURL(url);
      resolve(duration);
    });

    element.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    });

    element.src = url;
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
