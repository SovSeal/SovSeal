# Media Components

This directory contains components for media capture, upload, and preview functionality.

## Components

### MediaRecorder

Records audio or video directly in the browser using the MediaRecorder API.

**Features:**
- Audio-only or video+audio recording modes
- Real-time recording duration display
- Active device indicators (microphone/camera)
- iOS Safari detection with fallback message
- Permission handling with clear error messages

**Usage:**
```tsx
import { MediaRecorder } from '@/components/media';

<MediaRecorder
  onRecordingComplete={(blob, type) => {
    // Handle the recorded blob
  }}
  onError={(error) => {
    // Handle errors
  }}
/>
```

**Requirements Implemented:**
- 2.1: Request microphone and camera permissions
- 2.2: Display recording duration and active device indicators
- 2.3: Save recorded media as Blob in memory
- 2.4: Support audio-only recording
- 2.5: Detect iOS Safari and show upload-only fallback

---

### MediaUploader

Upload existing media files with drag-and-drop support.

**Features:**
- Drag-and-drop file upload
- File type validation (MP3, WAV, OGG, MP4, WEBM, MOV)
- File size validation with warnings for files >100MB
- File metadata display
- Preview before confirmation

**Usage:**
```tsx
import { MediaUploader } from '@/components/media';

<MediaUploader
  onFileSelect={(mediaFile) => {
    // Handle the selected file
  }}
  onError={(error) => {
    // Handle errors
  }}
/>
```

**Requirements Implemented:**
- 3.1: Validate file types
- 3.2: Warn if file exceeds 100MB
- 3.3: Load uploaded files as Blob in memory
- 3.4: Support common audio formats
- 3.5: Display file preview and metadata

---

### MediaPreview

Preview and play media files with basic controls.

**Features:**
- Audio and video playback
- Play/pause/seek controls
- Volume control
- Progress bar with time display
- Media metadata display (size, type, duration)

**Usage:**
```tsx
import { MediaPreview } from '@/components/media';

<MediaPreview
  mediaFile={mediaFile}
  onClose={() => {
    // Handle close
  }}
/>
```

**Requirements Implemented:**
- 3.3: Display media metadata and basic playback controls

---

## Types

See `types/media.ts` for TypeScript type definitions:
- `MediaType`: 'audio' | 'video'
- `MediaFile`: Complete media file information
- `RecordingState`: Recording state management
- `MediaMetadata`: Media file metadata

## Utilities

See `utils/mediaValidation.ts` for validation and formatting utilities:
- `validateFileType()`: Validate file MIME type and extension
- `validateFileSize()`: Check file size and generate warnings
- `getMediaDuration()`: Extract media duration
- `formatFileSize()`: Format bytes to human-readable size
- `formatDuration()`: Format seconds to MM:SS or HH:MM:SS

## Testing

Visit `/test-media` to test all media components in action.

## Browser Compatibility

- Chrome/Edge 90+ (full support)
- Firefox 88+ (full support)
- Safari 14+ (full support)
- iOS Safari (upload only, recording not supported)

## Notes

- All media processing happens client-side
- Recorded media is stored in memory as Blobs
- Object URLs are automatically cleaned up
- Permissions are requested on first recording attempt
