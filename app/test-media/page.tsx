'use client';

import { useState } from 'react';
import { MediaRecorder, MediaUploader, MediaPreview } from '@/components/media';
import { UploadProgress } from '@/components/storage';
import type { MediaFile } from '@/types/media';

/**
 * Test page for media capture and upload functionality
 * This page demonstrates all three media components
 */
export default function TestMediaPage() {
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  
  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProvider, setUploadProvider] = useState<'storacha' | undefined>();
  const [uploadError, setUploadError] = useState<string>();

  const handleRecordingComplete = (blob: Blob, type: 'audio' | 'video') => {
    const mediaFile: MediaFile = {
      blob,
      type,
      size: blob.size,
      mimeType: blob.type,
      name: `recorded-${type}-${Date.now()}`,
    };
    setMediaFile(mediaFile);
  };

  const handleFileSelect = (file: MediaFile) => {
    setMediaFile(file);
  };

  const handleError = (error: Error) => {
    console.error('Media error:', error);
    alert(`Error: ${error.message}`);
  };

  const handleClearMedia = () => {
    setMediaFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadProvider(undefined);
    setUploadError(undefined);
  };

  const handleTestUpload = async () => {
    if (!mediaFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError(undefined);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    // Simulate provider selection
    setTimeout(() => {
      setUploadProvider('storacha');
    }, 1000);

    // Simulate completion or error
    setTimeout(() => {
      clearInterval(progressInterval);
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setUploadProgress(100);
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
        setUploadError('Failed to upload to Web3.Storage. Retrying with Pinata...');
        
        // Simulate fallback to Pinata
        setTimeout(() => {
          setUploadStatus('uploading');
          setUploadProvider('storacha');
          setUploadProgress(50);
          
          setTimeout(() => {
            setUploadProgress(100);
            setUploadStatus('success');
          }, 2000);
        }, 1500);
      }
    }, 5000);
  };

  const handleRetryUpload = () => {
    handleTestUpload();
  };

  const handleCancelUpload = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadProvider(undefined);
    setUploadError(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Media Capture & Upload Test
          </h1>
          <p className="mt-2 text-gray-600">
            Test the media recording, upload, and preview functionality
          </p>
        </div>

        {!mediaFile ? (
          <div className="space-y-6">
            {/* Tab Selection */}
            <div className="flex space-x-2 rounded-lg bg-white p-1 shadow">
              <button
                onClick={() => setActiveTab('record')}
                className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
                  activeTab === 'record'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Record Media
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Upload File
              </button>
            </div>

            {/* Content Area */}
            <div className="rounded-lg bg-white p-6 shadow">
              {activeTab === 'record' ? (
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    Record Audio or Video
                  </h2>
                  <MediaRecorder
                    onRecordingComplete={handleRecordingComplete}
                    onError={handleError}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    Upload Media File
                  </h2>
                  <MediaUploader onFileSelect={handleFileSelect} onError={handleError} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview */}
            <MediaPreview mediaFile={mediaFile} onClose={handleClearMedia} />

            {/* Upload Progress */}
            <UploadProgress
              progress={uploadProgress}
              status={uploadStatus}
              provider={uploadProvider}
              error={uploadError}
              onRetry={handleRetryUpload}
              onCancel={handleCancelUpload}
            />

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleClearMedia}
                className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 hover:bg-gray-300"
                disabled={uploadStatus === 'uploading'}
              >
                Clear & Start Over
              </button>
              <button
                onClick={handleTestUpload}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={uploadStatus === 'uploading'}
              >
                {uploadStatus === 'success' ? 'Upload Complete!' : 'Test IPFS Upload'}
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900">Test Instructions:</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
            <li>Use the &quot;Record Media&quot; tab to test audio/video recording</li>
            <li>Use the &quot;Upload File&quot; tab to test file upload with drag-and-drop</li>
            <li>Try uploading files larger than 100MB to see the warning</li>
            <li>Test with different file formats (MP3, WAV, MP4, etc.)</li>
            <li>Preview the media with playback controls</li>
            <li>Click &quot;Test IPFS Upload&quot; to see the upload progress UI (simulated)</li>
            <li>The upload demo shows Web3.Storage with Pinata fallback behavior</li>
            <li>On iOS Safari, recording will show a fallback message</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
