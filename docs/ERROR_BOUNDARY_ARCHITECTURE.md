# Error Boundary Architecture

## Hierarchy Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│ app/error.tsx (Root Error Boundary)                                     │
│ • Catches critical app-wide failures                                    │
│ • WalletProvider initialization errors                                  │
│ • Routing errors                                                        │
│ • Unexpected React errors                                               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ app/layout.tsx                                                    │ │
│  │ • WalletProvider wrapper                                          │ │
│  │                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │ app/create/error.tsx (Create Page Error Boundary)         │ │ │
│  │  │ • Wallet connection failures                               │ │ │
│  │  │ • Media recording/upload errors                            │ │ │
│  │  │ • Encryption failures                                      │ │ │
│  │  │ • IPFS upload errors                                       │ │ │
│  │  │ • Blockchain transaction errors                            │ │ │
│  │  │                                                             │ │ │
│  │  │  ┌───────────────────────────────────────────────────────┐ │ │ │
│  │  │  │ app/create/page.tsx                                  │ │ │ │
│  │  │  │                                                       │ │ │ │
│  │  │  │  Components:                                          │ │ │ │
│  │  │  │  • MediaRecorder (with onError)                      │ │ │ │
│  │  │  │  • MediaUploader (with onError)                      │ │ │ │
│  │  │  │  • MediaPreview                                      │ │ │ │
│  │  │  │                                                       │ │ │ │
│  │  │  │  Services:                                            │ │ │ │
│  │  │  │  • MessageCreationService                            │ │ │ │
│  │  │  │    ├─ CryptoService                                  │ │ │ │
│  │  │  │    ├─ AsymmetricCrypto                               │ │ │ │
│  │  │  │    ├─ IPFSService                                    │ │ │ │
│  │  │  │    └─ ContractService                                │ │ │ │
│  │  │  └───────────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │ app/dashboard/error.tsx (Dashboard Page Error Boundary)   │ │ │
│  │  │ • Blockchain query failures                               │ │ │
│  │  │ • Wallet state errors                                     │ │ │
│  │  │ • Message decryption failures                             │ │ │
│  │  │ • Network timeouts and RPC errors                         │ │ │
│  │  │                                                             │ │ │
│  │  │  ┌───────────────────────────────────────────────────────┐ │ │ │
│  │  │  │ app/dashboard/page.tsx                               │ │ │ │
│  │  │  │                                                       │ │ │ │
│  │  │  │  Components:                                          │ │ │ │
│  │  │  │  • SentMessages                                      │ │ │ │
│  │  │  │  • ReceivedMessages                                  │ │ │ │
│  │  │  │  • MessageList                                       │ │ │ │
│  │  │  │  • MessageCard                                       │ │ │ │
│  │  │  │  • MessageFilters                                    │ │ │ │
│  │  │  │  • Pagination                                        │ │ │ │
│  │  │  │                                                       │ │ │ │
│  │  │  │  Services:                                            │ │ │ │
│  │  │  │  • ContractService.getSentMessages()                │ │ │ │
│  │  │  │  • ContractService.getReceivedMessages()            │ │ │ │
│  │  │  │  • CryptoService (for decryption)                   │ │ │ │
│  │  │  └───────────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Error Flow

### 1. Component-Level Errors
```
MediaRecorder throws error
    ↓
onError callback in page
    ↓
Set error state
    ↓
Display inline error message
```

### 2. Page-Level Errors
```
Async operation fails (encryption, upload, transaction)
    ↓
Error thrown in page component
    ↓
app/create/error.tsx catches
    ↓
Display context-aware error UI
    ↓
User can retry or navigate away
```

### 3. Root-Level Errors
```
Critical failure (WalletProvider, routing)
    ↓
Error bubbles up past page boundary
    ↓
app/error.tsx catches
    ↓
Display global error UI
    ↓
User can retry or return home
```

## Error Categories & Handlers

| Error Type | Handler | Fallback UI | Recovery |
|------------|---------|-------------|----------|
| **Wallet Connection** | Page boundary | Wallet error message + install instructions | Retry connection |
| **Media Permission** | Component onError | Inline error + alternative options | Grant permission or upload file |
| **Media Upload** | Component onError | Inline error + format/size info | Try different file |
| **Form Validation** | Component state | Inline validation messages | Fix input |
| **Encryption** | Page boundary | Crypto error + browser suggestions | Try different browser |
| **IPFS Upload** | Page boundary | Upload error + retry/fallback info | Retry or use Pinata |
| **Blockchain Tx** | Page boundary (create) | Transaction error + faucet links | Get tokens or retry |
| **Blockchain Query** | Page boundary (dashboard) | Network error + status check | Retry or check network |
| **Message Decryption** | Page boundary (dashboard) | Decryption error + account check | Switch account or retry |
| **Critical App** | Root boundary | Global error + cache clear instructions | Refresh or report issue |

## Error Message Strategy

### Principle: Progressive Disclosure
1. **Primary Message**: User-friendly, non-technical
2. **Suggestions**: Actionable steps to resolve
3. **Technical Details**: Collapsible, for advanced users
4. **Actions**: Retry, navigate, or report

### Example: Wallet Error
```
┌─────────────────────────────────────────┐
│ 🔴 Wallet Connection Error              │
│                                         │
│ There was a problem connecting to your  │
│ Talisman wallet.                        │
│                                         │
│ What you can try:                       │
│ • Make sure Talisman is installed       │
│ • Unlock your wallet                    │
│ • Grant permission to this site         │
│                                         │
│ ▼ Technical Details                     │
│                                         │
│ [Try Again] [Go to Home]                │
└─────────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests
- Test error boundary rendering
- Test error message selection logic
- Test retry functionality
- Test navigation after error

### Integration Tests
- Test wallet connection failures
- Test media permission denials
- Test form validation errors
- Test async operation failures

### E2E Tests
- Test complete error recovery flows
- Test error boundary fallback UI
- Test error logging
- Test user actions after errors

## Monitoring & Analytics

### Error Tracking (Future)
```typescript
// In production, integrate with monitoring service
useEffect(() => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'create-page',
        errorType: getErrorType(error),
      },
      user: {
        address: walletAddress,
      },
    });
  }
}, [error]);
```

### Metrics to Track
- Error rate by type
- Error recovery success rate
- Time to recovery
- User actions after error (retry vs navigate away)
- Browser/device correlation with errors

## Best Practices Applied

✅ **Fail Gracefully**: Never show blank screen or cryptic errors  
✅ **Provide Context**: Explain what went wrong in user terms  
✅ **Offer Solutions**: Give specific steps to resolve  
✅ **Enable Recovery**: Retry button, navigation options  
✅ **Log for Debugging**: Console logs + future monitoring  
✅ **Progressive Disclosure**: Hide technical details by default  
✅ **Accessible**: Semantic HTML, proper ARIA labels  
✅ **Responsive**: Mobile-friendly error UI  

