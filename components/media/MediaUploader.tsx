'use client';

import { useState, useRef, DragEvent } from 'react';
import type { MediaFile } from '@/types/media';
import {
  validateFileType,
  validateFileSize,
  getMediaDuration,
  formatFileSize,
} from '@/utils/mediaValidation';

interface MediaUploaderProps {
  onFileSelect: (mediaFile: MediaFile) => void;
  onError?: (error: Error) => void;
}

/**
 * MediaUploader component with drag-and-drop support
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export function MediaUploader({ onFileSelect, onError }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Process and validate uploaded file
   * Requirements: 3.1, 3.2, 3.3
   */
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setWarning(null);

    try {
      // Validate file type - Requirement 3.1
      const typeValidation = validateFileType(file);
      if (!typeValidation.isValid || !typeValidation.mediaType) {
        throw new Error(typeValidation.error || 'Invalid file type');
      }

      // Validate file size - Requirement 3.2
      const sizeValidation = validateFileSize(file);
      if (sizeValidation.isWarning && sizeValidation.warning) {
        setWarning(sizeValidation.warning);
      }

      // Get media duration
      const duration = await getMediaDuration(file);

      // Create MediaFile object - Requirement 3.3
      const mediaFile: MediaFile = {
        blob: file,
        type: typeValidation.mediaType,
        size: file.size,
        mimeType: file.type,
        duration,
        name: file.name,
      };

      setSelectedFile(mediaFile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMessage);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle file selection from input
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  /**
   * Handle drag and drop - Requirement 3.1
   */
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  /**
   * Handle file selection confirmation
   */
  const handleUseFile = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      handleClear();
    }
  };

  /**
   * Clear selection
   */
  const handleClear = () => {
    setSelectedFile(null);
    setWarning(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Open file picker
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.ogg,.mp4,.webm,.mov,audio/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Warning Display - Requirement 3.2 */}
      {warning && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 flex-shrink-0 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-yellow-700">{warning}</p>
          </div>
        </div>
      )}

      {/* Drag and Drop Area */}
      {!selectedFile && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
        >
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <div>
              <p className="text-lg font-medium text-gray-900">
                {isProcessing ? 'Processing file...' : 'Drop your file here'}
              </p>
              <p className="mt-1 text-sm text-gray-600">or</p>
            </div>

            <button
              onClick={handleBrowseClick}
              disabled={isProcessing}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Browse Files
            </button>

            <div className="text-xs text-gray-500">
              <p>Supported formats:</p>
              <p className="mt-1">Audio: MP3, WAV, OGG</p>
              <p>Video: MP4, WEBM, MOV</p>
              <p className="mt-2">Maximum size: 100 MB</p>
            </div>
          </div>
        </div>
      )}

      {/* File Preview - Requirements 3.3, 3.5 */}
      {selectedFile && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* File Icon */}
              <div className="flex-shrink-0">
                {selectedFile.type === 'video' ? (
                  <svg
                    className="h-12 w-12 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-12 w-12 text-blue-600"
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
                )}
              </div>

              {/* File Metadata - Requirement 3.5 */}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <div className="mt-1 space-y-1 text-sm text-gray-600">
                  <p>Type: {selectedFile.type}</p>
                  <p>Size: {formatFileSize(selectedFile.size)}</p>
                  {selectedFile.duration && (
                    <p>
                      Duration:{' '}
                      {Math.floor(selectedFile.duration / 60)}:
                      {Math.floor(selectedFile.duration % 60)
                        .toString()
                        .padStart(2, '0')}
                    </p>
                  )}
                  <p className="text-xs">MIME: {selectedFile.mimeType}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-shrink-0 space-x-2">
              <button
                onClick={handleClear}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Remove
              </button>
              <button
                onClick={handleUseFile}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Use File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
