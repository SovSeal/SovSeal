# Fast Refresh Full Reload Fix

## Problem
Fast Refresh was performing full page reloads on first wallet connection, causing the warning:
```
⚠ Fast Refresh had to perform a full reload.
```

## Root Cause
According to [Next.js Fast Refresh documentation](https://nextjs.org/docs/architecture/fast-refresh), full reloads occur when:

1. **Dynamic imports in callbacks** - The `connect()` function was dynamically importing `@polkadot/extension-dapp` on every connection
2. **State changes during mount** - localStorage operations in `useEffect` were running on every Fast Refresh
3. **Module re-evaluation** - Dynamic imports cause module re-evaluation which breaks Fast Refresh state preservation

## Solution Applied

### 1. Module Preloading & Caching
Instead of dynamic imports during connection, we now:
- Preload extension modules on initial page load
- Cache them in a module-scoped variable
- Reuse cached modules on subsequent connections

```typescript
// Preload modules asynchronously
if (typeof window !== 'undefined') {
  Promise.all([
    import("@polkadot/extension-dapp"),
    import("@polkadot/util")
  ]).then(([dapp, util]) => {
    extensionModulesCache = {
      web3Enable: dapp.web3Enable,
      web3Accounts: dapp.web3Accounts,
      web3FromAddress: dapp.web3FromAddress,
      stringToHex: util.stringToHex,
    };
  });
}
```

### 2. Initial Mount Guard
Added `useRef` to ensure localStorage cleanup only runs once:

```typescript
const isInitialMount = useRef(true);

useEffect(() => {
  if (!isInitialMount.current) return;
  isInitialMount.current = false;
  // ... localStorage cleanup
}, []);
```

### 3. Proper TypeScript Types
Used proper type annotations for cached modules to maintain type safety:

```typescript
type ExtensionModules = {
  web3Enable?: typeof import("@polkadot/extension-dapp").web3Enable;
  web3Accounts?: typeof import("@polkadot/extension-dapp").web3Accounts;
  // ...
};
```

## Benefits

1. **No more full reloads** - Fast Refresh now preserves component state during development
2. **Faster connections** - Modules are preloaded, reducing connection time
3. **Better DX** - Developers can edit code without losing wallet connection state
4. **Type safety maintained** - Full TypeScript support with proper types

## Testing

To verify the fix:
1. Start dev server: `npm run dev`
2. Connect wallet
3. Edit any component file and save
4. Verify no "Fast Refresh had to perform a full reload" warning appears
5. Verify wallet connection state is preserved

## Files Modified

- `lib/wallet/WalletProvider.tsx` - Added module caching and initial mount guard
- `lib/crypto/AsymmetricCrypto.ts` - Cached `decodeAddress` module
- `lib/contract/ContractService.ts` - Cached `web3FromAddress` module

## Additional Dynamic Imports Fixed

The issue wasn't just in WalletProvider - it was also in:

1. **AsymmetricCrypto.ts** - `decodeAddress` was dynamically imported during message creation
2. **ContractService.ts** - `web3FromAddress` was dynamically imported during transaction signing

All dynamic imports now use the same preload + cache strategy to prevent Fast Refresh full reloads.
