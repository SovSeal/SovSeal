# Edge Case Testing Guide

This document provides a comprehensive guide for testing edge cases and error scenarios in the Lockdrop application.

## Requirements

Task 12.2 - Handle edge cases:
- Test with no wallet installed
- Test with wallet locked
- Test with network disconnection
- Test with invalid recipient addresses
- Test with corrupted IPFS data
- Test with failed transactions

## Testing Scenarios

### 1. Wallet Edge Cases

#### 1.1 No Wallet Installed
**Test Steps:**
1. Open the application in a browser without Talisman extension
2. Attempt to connect wallet
3. Verify error message displays installation instructions
4. Verify link to Talisman extension is provided

**Expected Behavior:**
- Clear error message: "Talisman extension not found"
- Installation instructions displayed
- Link to Chrome/Firefox extension store

#### 1.2 Wallet Locked
**Test Steps:**
1. Install Talisman extension but keep it locked
2. Attempt to connect wallet
3. Verify error message prompts user to unlock wallet

**Expected Behavior:**
- Error message: "Please unlock your Talisman wallet"
- Retry button available
- No application crash

#### 1.3 Wallet Disconnected Mid-Operation
**Test Steps:**
1. Connect wallet and start creating a message
2. Lock or disconnect wallet during encryption
3. Verify graceful error handling

**Expected Behavior:**
- Operation fails with clear error message
- No data loss or corruption
- User can retry after reconnecting

#### 1.4 Wrong Account Selected
**Test Steps:**
1. Connect with account A
2. Try to unlock message sent to account B
3. Verify appropriate error message

**Expected Behavior:**
- Error: "This message was not sent to your account"
- Suggestion to switch accounts
- No decryption attempted

### 2. Network Edge Cases

#### 2.1 Network Disconnection
**Test Steps:**
1. Disconnect network (airplane mode or disable WiFi)
2. Attempt to create a message
3. Verify error handling and retry logic

**Expected Behavior:**
- Network error detected
- Clear error message displayed
- Retry button available
- Automatic retry when network restored

#### 2.2 Slow Network
**Test Steps:**
1. Throttle network to 3G speeds (Chrome DevTools)
2. Upload large media file
3. Verify progress tracking and timeout handling

**Expected Behavior:**
- Upload progress displayed
- Appropriate timeout (not too short)
- Chunked upload for large files
- No premature timeout errors

#### 2.3 RPC Endpoint Unavailable
**Test Steps:**
1. Configure invalid RPC endpoint
2. Attempt to query blockchain
3. Verify fallback to alternative endpoints

**Expected Behavior:**
- Automatic fallback to alternative RPC
- Clear error if all endpoints fail
- Suggestion to check network status

### 3. Input Validation Edge Cases

#### 3.1 Invalid Recipient Address
**Test Steps:**
1. Enter invalid Polkadot address formats:
   - Too short: "5GrwvaEF5z"
   - Too long: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY123456"
   - Invalid characters: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQ@"
   - Empty string
2. Attempt to create message
3. Verify validation error

**Expected Behavior:**
- Validation error before submission
- Clear error message
- Input field highlighted
- No blockchain transaction attempted

#### 3.2 Past Unlock Timestamp
**Test Steps:**
1. Set unlock timestamp to past date
2. Attempt to create message
3. Verify validation error

**Expected Behavior:**
- Error: "Unlock time must be in the future"
- Date picker prevents past dates
- No message creation attempted

#### 3.3 Self-Send Message
**Test Steps:**
1. Enter own address as recipient
2. Attempt to create message
3. Verify validation error

**Expected Behavior:**
- Error: "Cannot send message to yourself"
- Clear explanation
- No message creation attempted

### 4. Media Edge Cases

#### 4.1 Unsupported File Format
**Test Steps:**
1. Upload unsupported file types:
   - .txt file
   - .pdf file
   - .exe file
2. Verify rejection with clear error

**Expected Behavior:**
- File rejected before upload
- List of supported formats displayed
- No encryption attempted

#### 4.2 File Too Large
**Test Steps:**
1. Upload file > 100MB
2. Verify warning message
3. Test if upload proceeds or is blocked

**Expected Behavior:**
- Warning displayed
- Option to proceed or cancel
- Chunked upload if proceeding
- Clear progress indication

#### 4.3 Corrupted Media File
**Test Steps:**
1. Upload corrupted media file
2. Attempt to play after decryption
3. Verify error handling

**Expected Behavior:**
- Decryption succeeds (file is encrypted)
- Playback fails with clear error
- No application crash

#### 4.4 Permission Denied (Recording)
**Test Steps:**
1. Deny microphone/camera permissions
2. Attempt to record
3. Verify error message and fallback

**Expected Behavior:**
- Clear error: "Permission denied"
- Instructions to enable permissions
- Fallback to file upload option

### 5. IPFS Edge Cases

#### 5.1 IPFS Upload Failure
**Test Steps:**
1. Simulate IPFS service unavailable
2. Attempt to upload encrypted blob
3. Verify retry logic and fallback

**Expected Behavior:**
- Automatic retry with exponential backoff
- Fallback to Pinata if configured
- Clear error if all providers fail
- No data loss

#### 5.2 Corrupted IPFS Data
**Test Steps:**
1. Manually corrupt CID data
2. Attempt to download and decrypt
3. Verify hash verification catches corruption

**Expected Behavior:**
- Hash verification fails
- Error: "Data integrity check failed"
- No decryption attempted
- Suggestion to contact sender

#### 5.3 CID Not Found
**Test Steps:**
1. Use non-existent CID
2. Attempt to download
3. Verify error handling

**Expected Behavior:**
- Error: "Content not found on IPFS"
- Retry button available
- Suggestion that content may be unpinned

### 6. Blockchain Edge Cases

#### 6.1 Insufficient Funds
**Test Steps:**
1. Use account with zero balance
2. Attempt to submit transaction
3. Verify error and faucet guidance

**Expected Behavior:**
- Error: "Insufficient funds"
- Link to Westend faucet
- Instructions to get testnet tokens
- No transaction submitted

#### 6.2 Transaction Cancelled
**Test Steps:**
1. Start transaction
2. Cancel in Talisman popup
3. Verify graceful handling

**Expected Behavior:**
- Error: "Transaction cancelled"
- No data loss
- Can retry immediately
- No blockchain state change

#### 6.3 Transaction Timeout
**Test Steps:**
1. Submit transaction during network congestion
2. Wait for timeout
3. Verify error handling

**Expected Behavior:**
- Timeout after reasonable period
- Clear error message
- Retry option available
- Transaction status unclear warning

### 7. Decryption Edge Cases

#### 7.1 Wrong Decryption Key
**Test Steps:**
1. Manually modify encrypted key CID
2. Attempt to decrypt
3. Verify error handling

**Expected Behavior:**
- Decryption fails
- Error: "Failed to decrypt"
- No corrupted data displayed
- Suggestion to verify message details

#### 7.2 Timestamp Not Reached
**Test Steps:**
1. Attempt to unlock message before timestamp
2. Verify timestamp enforcement
3. Check countdown display

**Expected Behavior:**
- Error: "Message is still locked"
- Countdown timer displayed
- Unlock button disabled
- Clear time remaining message

#### 7.3 Hash Mismatch
**Test Steps:**
1. Modify encrypted blob
2. Attempt to decrypt
3. Verify hash verification

**Expected Behavior:**
- Hash verification fails
- Error: "Data integrity check failed"
- No decryption attempted
- Warning about tampering

### 8. Browser Compatibility Edge Cases

#### 8.1 Unsupported Browser
**Test Steps:**
1. Open in old browser (IE11, old Safari)
2. Verify feature detection
3. Check error messages

**Expected Behavior:**
- Feature detection on load
- Clear error: "Browser not supported"
- List of supported browsers
- Specific missing features listed

#### 8.2 iOS Safari Limitations
**Test Steps:**
1. Open on iOS Safari
2. Attempt to record media
3. Verify fallback to upload

**Expected Behavior:**
- Recording not available message
- Upload option prominently displayed
- No broken functionality
- Clear explanation of limitation

#### 8.3 Private/Incognito Mode
**Test Steps:**
1. Open in private browsing mode
2. Test localStorage functionality
3. Verify wallet connection

**Expected Behavior:**
- localStorage may be limited
- Warning if features unavailable
- Core functionality still works
- Session-only state acceptable

## Automated Testing

### Unit Tests
```typescript
// Example test cases
describe('Edge Case Validation', () => {
  test('rejects invalid Polkadot addresses', () => {
    expect(isValidPolkadotAddress('invalid')).toBe(false);
  });

  test('rejects past timestamps', () => {
    expect(isValidFutureTimestamp(Date.now() - 1000)).toBe(false);
  });

  test('validates IPFS CIDs', () => {
    expect(isValidIPFSCID('QmInvalidCID')).toBe(false);
  });
});
```

### Integration Tests
```typescript
describe('Error Recovery', () => {
  test('retries failed IPFS uploads', async () => {
    // Mock IPFS failure then success
    // Verify retry logic works
  });

  test('handles wallet disconnection gracefully', async () => {
    // Simulate wallet disconnect
    // Verify error handling
  });
});
```

## Manual Testing Checklist

- [ ] No wallet installed
- [ ] Wallet locked
- [ ] Network disconnection
- [ ] Invalid recipient addresses
- [ ] Corrupted IPFS data
- [ ] Failed transactions
- [ ] Insufficient funds
- [ ] Transaction cancelled
- [ ] Wrong decryption key
- [ ] Timestamp not reached
- [ ] Unsupported file formats
- [ ] Files too large
- [ ] Permission denied
- [ ] Slow network
- [ ] RPC endpoint unavailable
- [ ] iOS Safari limitations
- [ ] Private browsing mode

## Error Logging

All edge cases should be logged using the ErrorLogger:

```typescript
import { ErrorLogger } from '@/lib/monitoring/ErrorLogger';

try {
  // Operation
} catch (error) {
  ErrorLogger.log(error, 'Operation Context', {
    additionalData: 'relevant info',
  });
  // Handle error
}
```

## Monitoring

In production, errors should be sent to a monitoring service:
- Sentry for error tracking
- LogRocket for session replay
- Custom analytics for error patterns

## Recovery Strategies

Each edge case should have a clear recovery path:
1. **Retryable errors**: Automatic retry with exponential backoff
2. **User action required**: Clear instructions and action buttons
3. **Fatal errors**: Graceful degradation and error boundary
4. **Network errors**: Offline mode or queue for later

## Documentation

All edge cases and their handling should be documented in:
- User-facing error messages
- Developer documentation
- API documentation
- Troubleshooting guides
