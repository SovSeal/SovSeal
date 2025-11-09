'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { MediaType, RecordingState } from '@/types/media';

/**
 * Custom hook for media recording functionality
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export function useMediaRecorder(mediaType: MediaType = 'audio') {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    blob: null,
    stream: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Request microphone and camera permissions
   * Requirement 2.1: Request permissions from browser
   */
  const requestPermissions = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: mediaType === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      console.error('Permission denied or error accessing media devices:', error);
      throw new Error(
        `Failed to access ${mediaType === 'video' ? 'camera and microphone' : 'microphone'}. Please grant permissions.`
      );
    }
  }, [mediaType]);

  /**
   * Start recording
   * Requirements: 2.1, 2.2, 2.3
   */
  const startRecording = useCallback(async () => {
    try {
      const stream = await requestPermissions();
      
      if (!stream) {
        throw new Error('Failed to get media stream');
      }

      // Determine the best supported MIME type
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'audio/webm',
        'audio/mp4',
      ];

      let mimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || (mediaType === 'video' ? 'video/webm' : 'audio/webm'),
        });

        setRecordingState((prev) => ({
          ...prev,
          isRecording: false,
          blob,
        }));

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingState((prev) => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
        }));
      }, 1000);

      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        blob: null,
        stream,
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, [mediaType, requestPermissions]);

  /**
   * Stop recording
   * Requirement 2.3: Save recorded media as Blob in memory
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [recordingState.isRecording]);

  /**
   * Clear recording and reset state
   */
  const clearRecording = useCallback(() => {
    if (recordingState.stream) {
      recordingState.stream.getTracks().forEach((track) => track.stop());
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      blob: null,
      stream: null,
    });

    chunksRef.current = [];
  }, [recordingState.stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingState.stream) {
        recordingState.stream.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState.stream]);

  return {
    recordingState,
    startRecording,
    stopRecording,
    clearRecording,
  };
}
