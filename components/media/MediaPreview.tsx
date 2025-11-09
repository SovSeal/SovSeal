'use client';

import { useState, useRef, useEffect } from 'react';
import type { MediaFile } from '@/types/media';
import { formatFileSize, formatDuration } from '@/utils/mediaValidation';

interface MediaPreviewProps {
  mediaFile: MediaFile;
  onClose?: () => void;
}

/**
 * MediaPreview component for playback and metadata display
 * Requirement 3.3: Display media metadata and basic playback controls
 */
export function MediaPreview({ mediaFile, onClose }: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(mediaFile.duration || 0);
  const [volume, setVolume] = useState(1);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  // Create object URL for media playback
  useEffect(() => {
    const url = URL.createObjectURL(mediaFile.blob);
    setMediaUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [mediaFile.blob]);

  // Update current time
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayPause = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;

    const time = parseFloat(e.target.value);
    media.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;

    const vol = parseFloat(e.target.value);
    media.volume = vol;
    setVolume(vol);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Media Preview</h3>
          <p className="text-sm text-gray-600">{mediaFile.name || 'Recorded Media'}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close preview"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Media Player */}
      <div className="rounded-lg bg-gray-900">
        {mediaUrl && mediaFile.type === 'video' ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={mediaUrl}
            className="w-full rounded-lg"
            playsInline
          />
        ) : (
          <div className="flex items-center justify-center p-12">
            <svg
              className="h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            {mediaUrl && (
              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={mediaUrl}
                className="hidden"
              />
            )}
          </div>
        )}
      </div>

      {/* Playback Controls */}
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progress}%, #E5E7EB ${progress}%, #E5E7EB 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="h-2 w-20 cursor-pointer appearance-none rounded-lg bg-gray-200"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Metadata - Requirement 3.3 */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-900">Media Information</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium text-gray-900">
              {mediaFile.type === 'video' ? 'Video' : 'Audio'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Size:</span>
            <span className="ml-2 font-medium text-gray-900">
              {formatFileSize(mediaFile.size)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Format:</span>
            <span className="ml-2 font-medium text-gray-900">{mediaFile.mimeType}</span>
          </div>
          {duration > 0 && (
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
