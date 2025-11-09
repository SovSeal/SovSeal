# Recipient Message Visibility Fix

## Problem

Recipients couldn't see messages sent to them because the app was only using localStorage (browser-specific cache) to store and retrieve messages. When the sender created a message, it was stored in their browser's localStorage. When the recipient connected their wallet in a different browser, they had a completely different localStorage, so they couldn't see the message.

## Root Cause

The `getReceivedMessages()` and `getSentMessages()` methods in `ContractService` were only querying the local cache:

```typescript
// OLD CODE - Only checked localStorage
const messages = MessageCache.getReceivedMessages(recipientAddress);
return messages;
```

This meant:
- **Sender's browser**: Message stored in localStorage → sender can see it ✓
- **Recipient's browser**: Different localStorage → recipient can't see it ✗

## Solution

Updated both methods to query the blockchain (where messages are actually stored via `system.remark` extrinsics) and merge with the cache:

```typescript
// NEW CODE - Queries blockchain + cache
const blockchainMessages = await this.queryMessagesFromRemarks(
  api,
  recipientAddress,
  "recipient"
);

const cachedMessages = MessageCache.getReceivedMessages(recipientAddress);

// Merge and deduplicate
const allMessages = [...blockchainMessages];
const existingIds = new Set(blockchainMessages.map(m => m.id));

for (const cached of cachedMessages) {
  if (!existingIds.has(cached.id)) {
    allMessages.push(cached);
  }
}
```

## How It Works Now

1. **Sender creates message** → Stored on blockchain via `system.remark` + cached locally
2. **Recipient queries messages** → Scans recent blockchain blocks + checks cache
3. **Both parties see the same data** → Single source of truth (blockchain)

## Technical Details

### Blockchain Scanning

The `queryMessagesFromRemarks()` method:
- Scans the last 20 blocks for `system.remark` extrinsics
- Filters for messages with `type: "futureproof_message"`
- Matches by sender or recipient address
- Returns deduplicated message metadata

### Cache Usage

The cache is still used for:
- **Instant loading** of recently sent messages (before blockchain confirmation)
- **Performance** - reduces blockchain queries for frequently accessed data
- **Offline support** - shows cached messages when blockchain is unavailable

### Limitations

- Only scans last 20 blocks (performance constraint)
- Older messages may not appear until proper contract indexing is implemented
- For production, this should be replaced with:
  - Smart contract with proper storage and events
  - Subquery/indexer for efficient message retrieval
  - Event-based notifications for new messages

## Future: Storacha/Web3.Storage

According to the design spec, **Storacha (Web3.Storage) is used for storing encrypted media files**, not message metadata:

- **Encrypted media blob** → Uploaded to IPFS via Web3.Storage → Returns CID
- **Encrypted AES key** → Uploaded to IPFS via Web3.Storage → Returns CID
- **Message metadata** (CIDs, timestamps, addresses) → Stored on blockchain

The blockchain stores:
```typescript
{
  encryptedKeyCID: "bafybeiabc123...",      // IPFS CID from Web3.Storage
  encryptedMessageCID: "bafybeiabc456...",  // IPFS CID from Web3.Storage
  messageHash: "sha256hash...",
  unlockTimestamp: 1234567890,
  sender: "5CcfrQD1...",
  recipient: "5DTestNKiE..."
}
```

## Testing

To verify the fix:

1. **Sender**: Connect wallet, create and send a message
2. **Recipient**: Connect their wallet in a different browser/incognito window
3. **Expected**: Recipient should see the message in their "Received Messages" dashboard
4. **Check console**: Should see "Loaded X received messages (Y from blockchain, Z from cache)"

## Notes

- The fix maintains backward compatibility with cached messages
- Performance is acceptable for the hackathon MVP (20 blocks ≈ 2 minutes of history)
- For production, implement proper smart contract with indexed storage
