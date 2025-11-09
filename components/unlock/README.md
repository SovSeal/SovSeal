# Unlock Components

This directory contains components for unlocking and playing time-locked messages.

## Components

### UnlockFlow

Modal component that displays message metadata and handles the unlock process.

**Features:**
- Displays message metadata (sender, timestamp, file info)
- Shows countdown timer for locked messages
- Verifies unlock timestamp before allowing decryption
- Displays unlock progress with stages
- Supports demo mode for testing (bypasses timestamp verification)
- Error handling with user-friendly messages

**Requirements:** 9.1, 9.2, 9.3

### MediaPlayer

Secure media player for decrypted content with full playback controls.

**Features:**
- Supports both audio and video playback
- Standard playback controls (play, pause, seek, volume)
- Displays playback progress and duration
- Automatically revokes object URLs on close
- Clears decrypted data from memory when closed
- Security notice to inform users about privacy guarantees

**Requirements:** 10.2, 10.3, 10.4, 10.5, 10.6

### DemoModeBanner

Prominent warning banner displayed when demo mode is active.

**Features:**
- Bright yellow banner with warning icons
- Clear messaging about bypassed timestamp verification
- Displayed at top of application when `NEXT_PUBLIC_DEMO_MODE=true`

**Requirements:** 9.3

## Usage

### Basic Unlock Flow

```tsx
import { UnlockFlow, MediaPlayer } from "@/components/unlock";
import { UnlockService } from "@/lib/unlock";

function MyComponent() {
  const [unlockResult, setUnlockResult] = useState(null);

  const handleUnlock = async (message, demoMode) => {
    const result = await UnlockService.unlockMessage(message, {
      demoMode,
      onProgress: (stage, progress) => {
        console.log(`${stage}: ${progress}%`);
      },
    });
    
    UnlockService.markAsUnlocked(message.id);
    setUnlockResult(result);
  };

  return (
    <>
      {!unlockResult && (
        <UnlockFlow
          message={message}
          onUnlock={handleUnlock}
          onClose={() => router.back()}
        />
      )}
      
      {unlockResult && (
        <MediaPlayer
          unlockResult={unlockResult}
          onClose={() => setUnlockResult(null)}
          messageId={message.id}
          sender={message.sender}
        />
      )}
    </>
  );
}
```

### Demo Mode

Set the environment variable to enable demo mode:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

When enabled:
- Timestamp verification is bypassed
- All messages appear as "Unlockable"
- Prominent warning banner is displayed
- Should be disabled in production builds

## Security Considerations

1. **Object URL Revocation**: MediaPlayer automatically revokes object URLs when closed to prevent memory leaks and unauthorized access.

2. **Memory Cleanup**: Decrypted data is cleared from memory when the player is closed using `CryptoService.secureCleanup()`.

3. **Timestamp Enforcement**: UnlockService verifies that the current time is at or after the unlock timestamp before allowing decryption (unless demo mode is enabled).

4. **Hash Verification**: The SHA-256 hash of the encrypted media is verified against the stored hash before decryption to ensure data integrity.

5. **No Plaintext Storage**: Decrypted content is never written to disk or localStorage - it exists only in memory during playback.

## Related Modules

- `lib/unlock/UnlockService.ts` - Core unlock logic and timestamp verification
- `lib/crypto/CryptoService.ts` - AES encryption/decryption
- `lib/crypto/AsymmetricCrypto.ts` - Key decryption and hash verification
- `lib/storage/IPFSService.ts` - Download encrypted content from IPFS
