# Storage Components

UI components for IPFS storage operations with Web3.Storage and Pinata fallback.

## Components

### UploadProgress

Displays real-time upload progress with provider information and error handling.

**Features:**
- Real-time progress tracking (0-100%)
- Provider badge (Web3.Storage or Pinata)
- Status indicators (uploading, success, error)
- Smooth progress animation
- Error messages with retry option
- Cancel functionality

**Usage:**

```tsx
import { UploadProgress } from '@/components/storage';
import { ipfsService } from '@/lib/storage';

function MyComponent() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [provider, setProvider] = useState<'web3.storage' | 'pinata'>();
  const [error, setError] = useState<string>();

  const handleUpload = async (blob: Blob) => {
    setStatus('uploading');
    setProgress(0);
    
    try {
      const result = await ipfsService.uploadEncryptedBlob(blob, 'my-file', {
        onProgress: (p) => setProgress(p),
      });
      
      setProvider(result.provider);
      setStatus('success');
      console.log('Uploaded to IPFS:', result.cid);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <UploadProgress
      progress={progress}
      status={status}
      provider={provider}
      error={error}
      onRetry={handleUpload}
      onCancel={() => setStatus('idle')}
    />
  );
}
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `progress` | `number` | Current upload progress (0-100) |
| `status` | `'idle' \| 'uploading' \| 'success' \| 'error'` | Upload status |
| `provider` | `'web3.storage' \| 'pinata'` | Provider being used (optional) |
| `error` | `string` | Error message if upload failed (optional) |
| `onRetry` | `() => void` | Callback for retry action (optional) |
| `onCancel` | `() => void` | Callback for cancel action (optional) |

## Integration with IPFSService

The UploadProgress component is designed to work seamlessly with the IPFSService:

```tsx
import { ipfsService } from '@/lib/storage';
import { UploadProgress } from '@/components/storage';

// The IPFSService automatically:
// 1. Tries Web3.Storage first (3 attempts with exponential backoff)
// 2. Falls back to Pinata if Web3.Storage fails
// 3. Returns the provider used in the result
// 4. Calls onProgress callback during upload

const result = await ipfsService.uploadEncryptedBlob(
  encryptedBlob,
  'encrypted-media',
  {
    onProgress: (progress) => {
      // Update UI with progress
      setProgress(progress);
    }
  }
);

// result.provider will be 'web3.storage' or 'pinata'
setProvider(result.provider);
```

## Testing

Visit `/test-media` to see a live demo of the UploadProgress component with simulated upload behavior including:
- Progress tracking
- Provider switching (Web3.Storage → Pinata fallback)
- Error handling with retry
- Success states

## Requirements

This component fulfills:
- **Requirement 5.3**: Pinata fallback service
- **Requirement 5.4**: Upload progress tracking and display
