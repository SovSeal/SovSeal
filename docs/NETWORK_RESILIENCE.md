# Network Resilience - Blockchain Service

This document describes the network resilience features implemented in `ContractService.ts`.

## Features

### 1. Automatic Reconnection

The service automatically attempts to reconnect when the WebSocket connection is lost:

- **Max Attempts**: 5 automatic reconnection attempts
- **Backoff Strategy**: Exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
- **Event Listeners**: Monitors `disconnected`, `connected`, and `error` events

```typescript
// Automatic reconnection happens in the background
// No action needed from your code
```

### 2. Fallback RPC Endpoints

If the primary RPC endpoint fails, the service automatically tries fallback endpoints:

**Westend Fallbacks**:
- `wss://westend-rpc.polkadot.io` (primary)
- `wss://rpc.polkadot.io/westend`
- `wss://westend.api.onfinality.io/public-ws`

**Rococo Fallbacks**:
- `wss://rococo-rpc.polkadot.io` (primary)
- `wss://rpc.polkadot.io/rococo`

### 3. Connection State Management

Subscribe to connection state changes in your React components:

```typescript
import { useBlockchainConnection } from '@/hooks/useBlockchainConnection';

function MyComponent() {
  const { isConnected, isReconnecting, reconnect } = useBlockchainConnection();
  
  if (!isConnected) {
    return (
      <div>
        <p>Disconnected from blockchain</p>
        <button onClick={reconnect} disabled={isReconnecting}>
          {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
        </button>
      </div>
    );
  }
  
  return <div>Connected!</div>;
}
```

### 4. Connection Status Banner

Add the `ConnectionStatus` component to your layout to show a banner when disconnected:

```typescript
import { ConnectionStatus } from '@/components/blockchain/ConnectionStatus';

export default function Layout({ children }) {
  return (
    <>
      <ConnectionStatus />
      {children}
    </>
  );
}
```

### 5. Network Verification

Verify the connected network matches your configuration:

```typescript
import { ContractService } from '@/lib/contract/ContractService';

// Check if connected to correct network
const isCorrectNetwork = await ContractService.verifyNetwork();

if (!isCorrectNetwork) {
  // Show warning to user
  alert('Please switch to Westend network in your wallet');
}
```

### 6. Manual Reconnection

Trigger manual reconnection from UI:

```typescript
import { ContractService } from '@/lib/contract/ContractService';

async function handleReconnect() {
  try {
    await ContractService.reconnect();
    console.log('Reconnected successfully');
  } catch (error) {
    console.error('Reconnection failed:', error);
  }
}
```

### 7. Chain Information

Get information about the connected chain:

```typescript
const chainInfo = await ContractService.getChainInfo();

if (chainInfo) {
  console.log(`Connected to ${chainInfo.name} v${chainInfo.version}`);
}
```

## Error Handling

### Retryable Errors

The service automatically retries these errors:
- Network timeouts
- Connection refused
- DNS lookup failures
- WebSocket errors
- 503/504 service unavailable
- Rate limiting (429)

### Non-Retryable Errors

These errors fail immediately:
- Invalid addresses
- Contract not found
- Configuration errors
- Authentication errors

## Timeout Configuration

All blockchain operations have appropriate timeouts:

```typescript
BLOCKCHAIN_CONNECT: 15s        // RPC connection
BLOCKCHAIN_QUERY: 10s          // Single query
BLOCKCHAIN_QUERY_BATCH: 60s    // Batch queries
BLOCKCHAIN_TX_SUBMIT: 30s      // Transaction submission
BLOCKCHAIN_TX_FINALIZE: 120s   // Finalization
```

## Best Practices

### 1. Always Handle Connection State

```typescript
const { isConnected } = useBlockchainConnection();

if (!isConnected) {
  return <div>Please wait, connecting to blockchain...</div>;
}

// Proceed with blockchain operations
```

### 2. Show User-Friendly Errors

```typescript
try {
  await ContractService.storeMessage(params, account);
} catch (error) {
  if (error.message.includes('timeout')) {
    showError('Operation timed out. Please check your connection and try again.');
  } else if (error.message.includes('balance')) {
    showError('Insufficient balance. Get testnet tokens from the faucet.');
  } else {
    showError('Transaction failed. Please try again.');
  }
}
```

### 3. Verify Network Before Critical Operations

```typescript
async function createMessage() {
  // Verify network first
  const isCorrectNetwork = await ContractService.verifyNetwork();
  
  if (!isCorrectNetwork) {
    throw new Error('Please switch to Westend network');
  }
  
  // Proceed with message creation
  await ContractService.storeMessage(params, account);
}
```

### 4. Use Connection Status Component

Add to your root layout for global connection monitoring:

```typescript
// app/layout.tsx
import { ConnectionStatus } from '@/components/blockchain/ConnectionStatus';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConnectionStatus />
        {children}
      </body>
    </html>
  );
}
```

## Monitoring

The service logs all connection events to the console:

- ✅ `Connected to westend at wss://...`
- ⚠️ `WebSocket disconnected from RPC endpoint`
- 🔄 `Attempting reconnection 1/5 in 1000ms...`
- ✅ `Successfully reconnected to RPC endpoint`
- ❌ `Max reconnection attempts reached`

## Testing

### Test Disconnection Handling

1. Start the app and connect wallet
2. Open browser DevTools → Network tab
3. Set throttling to "Offline"
4. Observe automatic reconnection attempts
5. Set back to "Online"
6. Verify reconnection succeeds

### Test Fallback Endpoints

1. Set invalid primary RPC endpoint in `.env.local`
2. Start the app
3. Observe fallback to alternative endpoints
4. Verify operations work with fallback

### Test Network Verification

1. Connect to Westend
2. Call `ContractService.verifyNetwork()`
3. Should return `true`
4. Switch wallet to different network
5. Call again, should return `false`

## Troubleshooting

### Connection keeps dropping

- Check your internet connection
- Try a different RPC endpoint
- Check if the RPC endpoint is rate-limiting you

### Fallback endpoints not working

- Verify fallback endpoints are accessible
- Check browser console for detailed error messages
- Try manual reconnection

### Network mismatch warnings

- Ensure your wallet is connected to the correct network
- Check `NEXT_PUBLIC_NETWORK` environment variable
- Verify contract address matches the network

## Future Enhancements

- [ ] Add circuit breaker pattern for failing endpoints
- [ ] Implement endpoint health monitoring
- [ ] Add metrics collection for connection reliability
- [ ] Support custom fallback endpoint configuration
- [ ] Add connection quality indicators (latency, success rate)
