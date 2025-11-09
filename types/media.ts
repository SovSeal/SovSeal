/**
 * Type definitions for media capture and upload functionality
 * Requirements: 2.1-2.5, 3.1-3.5
 */

export type MediaType = "audio" | "video";

export type MediaMimeType =
  | "audio/webm"
  | "audio/mp4"
  | "audio/mpeg"
  | "audio/wav"
  | "audio/ogg"
  | "video/webm"
  | "video/mp4"
  | "video/quicktime";

export interface MediaConfig {
  type: MediaType;
  mimeType: string;
  maxSize: number; // in bytes
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  blob: Blob | null;
  stream: MediaStream | null;
}

export interface MediaFile {
  blob: Blob;
  type: MediaType;
  size: number;
  mimeType: string;
  duration?: number;
  name?: string;
}

export interface MediaMetadata {
  size: number;
  type: string;
  duration?: number;
  name?: string;
}

export const SUPPORTED_AUDIO_FORMATS = [
  "audio/mpeg", // MP3
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
];

export const SUPPORTED_VIDEO_FORMATS = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // MOV
];

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const SUPPORTED_FILE_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".ogg",
  ".mp4",
  ".webm",
  ".mov",
];
