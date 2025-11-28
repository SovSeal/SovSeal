# Manual Testing Guide

This guide provides a comprehensive checklist for manually testing the Lockdrop application across different browsers and scenarios.

## Prerequisites

- Talisman or MetaMask wallet extension installed
- Test wallet with Passet Hub testnet tokens (PAS)
- Multiple browsers installed (Chrome, Firefox, Safari)
- Test media files (audio and video)
- Mobile device for responsive testing (optional)

**Note:** Get PAS tokens from https://faucet.polkadot.io/paseo

## Browser Compatibility Testing

### Chrome/Edge Testing

- [ ] Open application in Chrome/Edge
- [ ] Verify all UI elements render correctly
- [ ] Test wallet connection
- [ ] Test media recording (audio and video)
- [ ] Test file upload
- [ ] Test message creation flow
- [ ] Test dashboard loading
- [ ] Test message unlock flow
- [ ] Verify no console errors

### Firefox Testing

- [ ] Open application in Firefox
- [ ] Verify all UI elements render correctly
- [ ] Test wallet connection
- [ ] Test media recording (audio and video)
- [ ] Test file upload
- [ ] Test message creation flow
- [ ] Test dashboard loading
- [ ] Test message unlock flow
- [ ] Verify no console errors

### Safari Testing

- [ ] Open application in Safari
- [ ] Verify all UI elements render correctly
- [ ] Test wallet connection
- [ ] Check for iOS Safari limitations (recording may not work)
- [ ] Test file upload as fallback
- [ ] Test message creation flow
- [ ] Test dashboard loading
- [ ] Test message unlock flow
- [ ] Verify no console errors

## Wallet Integration (Talisman/MetaMask)

### Wallet Connection

- [ ] Click "Connect Wallet" button
- [ ] Verify wallet extension popup appears
- [ ] Select test account (must be Ethereum account with 0x address)
- [ ] Verify wallet address displays in UI
- [ ] Verify connection persists on page refresh
- [ ] Test disconnect functionality
- [ ] Verify disconnection clears wallet state

### Wallet Not Installed

- [ ] Disable/remove wallet extensions
- [ ] Attempt to connect wallet
- [ ] Verify error message displays
- [ ] Verify installation instructions are shown
- [ ] Verify link to Talisman/MetaMask website works

### Wallet Locked

- [ ] Lock Talisman wallet
- [ ] Attempt to sign transaction
- [ ] Verify unlock prompt appears
- [ ] Unlock wallet and retry
- [ ] Verify transaction succeeds

## Media Recording Testing

### Audio Recording

- [ ] Click "Record Audio" button
- [ ] Grant microphone permission
- [ ] Verify recording indicator appears
- [ ] Speak into microphone
- [ ] Verify duration counter updates
- [ ] Stop recording
- [ ] Verify audio preview plays correctly
- [ ] Verify file size is reasonable

### Video Recording

- [ ] Click "Record Video" button
- [ ] Grant camera and microphone permissions
- [ ] Verify video preview appears
- [ ] Record test video
- [ ] Verify duration counter updates
- [ ] Stop recording
- [ ] Verify video preview plays correctly
- [ ] Verify file size is reasonable

### Permission Denied

- [ ] Deny microphone/camera permission
- [ ] Verify error message displays
- [ ] Verify instructions to enable permissions
- [ ] Grant permissions and retry
- [ ] Verify recording works after granting

### iOS Safari Fallback

- [ ] Open app on iOS Safari
- [ ] Verify recording buttons are disabled or hidden
- [ ] Verify upload-only message is displayed
- [ ] Test file upload as alternative

## File Upload Testing

### Valid Audio Formats

- [ ] Upload MP3 file
- [ ] Upload WAV file
- [ ] Upload OGG file
- [ ] Verify each file loads correctly
- [ ] Verify preview plays correctly

### Valid Video Formats

- [ ] Upload MP4 file
- [ ] Upload WEBM file
- [ ] Upload MOV file
- [ ] Verify each file loads correctly
- [ ] Verify preview plays correctly

### Invalid Formats

- [ ] Attempt to upload PDF file
- [ ] Attempt to upload image file
- [ ] Attempt to upload text file
- [ ] Verify error message for each
- [ ] Verify file is rejected

### File Size Validation

- [ ] Upload file under 10MB (should work smoothly)
- [ ] Upload file around 50MB (should work with chunking)
- [ ] Upload file around 100MB (should show warning)
- [ ] Attempt to upload file over 100MB
- [ ] Verify appropriate warnings/errors

### Drag and Drop

- [ ] Drag valid audio file onto upload area
- [ ] Verify file is accepted
- [ ] Drag invalid file onto upload area
- [ ] Verify file is rejected

## Message Creation Flow

### Complete Flow

- [ ] Connect wallet
- [ ] Record or upload media
- [ ] Enter valid recipient address
- [ ] Select future unlock date/time
- [ ] Verify preview shows all details
- [ ] Click "Create Message"
- [ ] Verify encryption progress indicator
- [ ] Verify IPFS upload progress
- [ ] Verify transaction signing prompt
- [ ] Sign transaction
- [ ] Verify success message
- [ ] Verify redirect to dashboard

### Invalid Recipient Address

- [ ] Enter invalid Polkadot address
- [ ] Verify validation error
- [ ] Enter Ethereum address
- [ ] Verify validation error
- [ ] Enter empty address
- [ ] Verify validation error

### Invalid Unlock Time

- [ ] Select past date/time
- [ ] Verify validation error
- [ ] Select current time
- [ ] Verify validation error
- [ ] Select valid future time
- [ ] Verify validation passes

### Transaction Failure

- [ ] Attempt transaction with insufficient funds
- [ ] Verify error message
- [ ] Verify faucet link is provided
- [ ] Reject transaction in wallet
- [ ] Verify cancellation message

## Dashboard Testing

### Sent Messages View

- [ ] Navigate to "Sent Messages" tab
- [ ] Verify messages load
- [ ] Verify each message shows:
  - [ ] Recipient address
  - [ ] Unlock timestamp
  - [ ] Status badge (Locked/Unlockable)
  - [ ] Created date
- [ ] Verify status updates in real-time
- [ ] Verify messages are sorted by date

### Received Messages View

- [ ] Navigate to "Received Messages" tab
- [ ] Verify messages load
- [ ] Verify each message shows:
  - [ ] Sender address
  - [ ] Unlock timestamp
  - [ ] Status badge (Locked/Unlockable/Unlocked)
  - [ ] Created date
- [ ] Verify status updates in real-time
- [ ] Verify messages are sorted by date

### Message Filtering

- [ ] Filter by "All" status
- [ ] Verify all messages show
- [ ] Filter by "Locked" status
- [ ] Verify only locked messages show
- [ ] Filter by "Unlockable" status
- [ ] Verify only unlockable messages show
- [ ] Filter by "Unlocked" status
- [ ] Verify only unlocked messages show

### Message Sorting

- [ ] Sort by newest first
- [ ] Verify correct order
- [ ] Sort by oldest first
- [ ] Verify correct order
- [ ] Sort by unlock time
- [ ] Verify correct order

### Pagination

- [ ] If more than 10 messages, verify pagination appears
- [ ] Click "Next" page
- [ ] Verify next set of messages loads
- [ ] Click "Previous" page
- [ ] Verify previous set loads
- [ ] Verify page numbers are correct

### Empty State

- [ ] Test with account that has no messages
- [ ] Verify empty state message displays
- [ ] Verify helpful instructions are shown

### Loading State

- [ ] Refresh dashboard
- [ ] Verify loading spinner appears
- [ ] Verify messages load after spinner

### Error State

- [ ] Disconnect network
- [ ] Attempt to load dashboard
- [ ] Verify error message displays
- [ ] Verify retry button appears
- [ ] Reconnect network and retry
- [ ] Verify messages load successfully

## Unlock and Playback Testing

### Locked Message

- [ ] Click on locked message
- [ ] Verify countdown timer displays
- [ ] Verify unlock button is disabled
- [ ] Verify time remaining is accurate
- [ ] Verify error message if unlock attempted

### Unlockable Message

- [ ] Click on unlockable message
- [ ] Verify unlock button is enabled
- [ ] Click "Unlock" button
- [ ] Verify decryption progress indicator
- [ ] Verify IPFS download progress
- [ ] Verify hash verification
- [ ] Verify media player appears

### Media Playback

- [ ] Verify media loads correctly
- [ ] Click play button
- [ ] Verify media plays
- [ ] Test pause button
- [ ] Test seek/scrub functionality
- [ ] Test volume control
- [ ] Verify playback progress updates
- [ ] Verify duration displays correctly

### Playback Controls

- [ ] Test play/pause toggle
- [ ] Test volume slider
- [ ] Test mute button
- [ ] Test seek bar
- [ ] Test fullscreen (for video)
- [ ] Verify all controls are responsive

### Close Playback

- [ ] Close media player
- [ ] Verify object URL is revoked
- [ ] Verify memory is cleaned up
- [ ] Verify message status updates to "Unlocked"

### Corrupted Data

- [ ] Test with corrupted IPFS CID (if possible)
- [ ] Verify error message displays
- [ ] Verify helpful troubleshooting info

## Demo Mode Testing

### Enable Demo Mode

- [ ] Set `NEXT_PUBLIC_DEMO_MODE=true`
- [ ] Restart application
- [ ] Verify "DEMO MODE" banner displays
- [ ] Verify banner is prominent and clear

### Demo Mode Behavior

- [ ] Create message with future unlock time
- [ ] Attempt to unlock immediately
- [ ] Verify unlock succeeds (bypassing timestamp)
- [ ] Verify demo mode warning is shown
- [ ] Verify normal encryption/decryption still works

### Disable Demo Mode

- [ ] Set `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] Restart application
- [ ] Verify demo mode banner is gone
- [ ] Verify timestamp enforcement is active
- [ ] Verify locked messages cannot be unlocked early

## Responsive Design Testing

### Desktop (1920x1080)

- [ ] Verify layout is optimal
- [ ] Verify all elements are visible
- [ ] Verify no horizontal scrolling
- [ ] Verify spacing is appropriate

### Laptop (1366x768)

- [ ] Verify layout adapts correctly
- [ ] Verify all elements are accessible
- [ ] Verify no content is cut off

### Tablet (768x1024)

- [ ] Verify mobile layout activates
- [ ] Verify navigation is touch-friendly
- [ ] Verify buttons are appropriately sized
- [ ] Verify text is readable

### Mobile (375x667)

- [ ] Verify mobile layout is optimal
- [ ] Verify all features are accessible
- [ ] Verify touch targets are large enough
- [ ] Verify text is readable without zooming
- [ ] Test portrait and landscape orientations

## Network Resilience Testing

### Slow Network

- [ ] Throttle network to "Slow 3G"
- [ ] Test message creation
- [ ] Verify progress indicators work
- [ ] Verify timeouts are reasonable
- [ ] Verify retry logic works

### Network Disconnection

- [ ] Disconnect network during upload
- [ ] Verify error message displays
- [ ] Verify retry option is available
- [ ] Reconnect network
- [ ] Retry operation
- [ ] Verify operation completes

### IPFS Gateway Failure

- [ ] Test with unreachable IPFS gateway
- [ ] Verify fallback behavior
- [ ] Verify error messages are helpful

## Security Testing

### Key Backup Warning

- [ ] Connect wallet for first time
- [ ] Verify key backup warning displays
- [ ] Verify warning is prominent
- [ ] Verify "Don't show again" option works
- [ ] Verify warning reappears on new device

### No Plaintext Leakage

- [ ] Open browser DevTools
- [ ] Monitor Network tab during message creation
- [ ] Verify no plaintext media is transmitted
- [ ] Verify only encrypted data is uploaded
- [ ] Monitor Console for any plaintext logs

### Memory Cleanup

- [ ] Create and unlock message
- [ ] Take memory snapshot before
- [ ] Take memory snapshot after cleanup
- [ ] Verify sensitive data is cleared
- [ ] Verify no decrypted data remains

### Object URL Revocation

- [ ] Unlock and play message
- [ ] Note the blob URL in DevTools
- [ ] Close player
- [ ] Attempt to access blob URL
- [ ] Verify URL is revoked (404 error)

## Error Handling Testing

### Graceful Degradation

- [ ] Test each error scenario
- [ ] Verify user-friendly error messages
- [ ] Verify no technical jargon
- [ ] Verify actionable guidance is provided
- [ ] Verify retry options where appropriate

### Error Recovery

- [ ] Trigger various errors
- [ ] Use retry functionality
- [ ] Verify state is properly restored
- [ ] Verify no data loss occurs

## Performance Testing

### Load Time

- [ ] Measure initial page load time
- [ ] Verify under 3 seconds on good connection
- [ ] Verify progressive loading

### Dashboard Performance

- [ ] Load dashboard with 50+ messages
- [ ] Verify smooth scrolling
- [ ] Verify no lag in filtering/sorting
- [ ] Verify pagination works smoothly

### Encryption Performance

- [ ] Encrypt 1MB file
- [ ] Measure time (should be under 1 second)
- [ ] Encrypt 50MB file
- [ ] Measure time (should be under 10 seconds)
- [ ] Verify UI remains responsive

### Memory Usage

- [ ] Monitor memory during normal usage
- [ ] Verify no memory leaks
- [ ] Verify memory is released after operations

## Accessibility Testing

### Keyboard Navigation

- [ ] Navigate entire app using only keyboard
- [ ] Verify all interactive elements are reachable
- [ ] Verify focus indicators are visible
- [ ] Verify tab order is logical

### Screen Reader

- [ ] Enable screen reader (VoiceOver/NVDA)
- [ ] Navigate through app
- [ ] Verify all content is announced
- [ ] Verify ARIA labels are present
- [ ] Verify form labels are associated

### High Contrast Mode

- [ ] Enable high contrast mode
- [ ] Verify all text is readable
- [ ] Verify all UI elements are visible
- [ ] Verify color is not the only indicator

### Text Scaling

- [ ] Increase browser text size to 200%
- [ ] Verify layout doesn't break
- [ ] Verify all text is readable
- [ ] Verify no content is cut off

## Test Results

### Test Summary

- Total Tests: \_\_\_
- Passed: \_\_\_
- Failed: \_\_\_
- Blocked: \_\_\_

### Issues Found

| Issue | Severity | Browser | Status |
| ----- | -------- | ------- | ------ |
|       |          |         |        |

### Notes

_Add any additional observations or notes here_

---

## Testing Checklist Summary

- [ ] All browser compatibility tests passed
- [ ] Wallet integration works correctly
- [ ] Media recording/upload works
- [ ] Message creation flow is smooth
- [ ] Dashboard displays correctly
- [ ] Unlock and playback work properly
- [ ] Demo mode functions as expected
- [ ] Responsive design works on all sizes
- [ ] Network resilience is adequate
- [ ] Security measures are in place
- [ ] Error handling is user-friendly
- [ ] Performance is acceptable
- [ ] Accessibility requirements are met

**Tester Name:** **\*\***\_\_\_**\*\***  
**Date:** **\*\***\_\_\_**\*\***  
**Version:** **\*\***\_\_\_**\*\***
