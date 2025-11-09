# Wallet Security Audit & Fixes

## Critical Issues Identified

### Issue 1: Wallet Shows "Connected" When Talisman is Locked 🔴

**Problem**: The app may show wallet as connected even when Talisman extension is locked.

**Root Cause**:

- React state persists during Fast Refresh in development
- No validation that wallet is actually accessible
- No periodic health checks

**Security Risk**: HIGH

- User thinks they're connected when they're not
- Operations will fail silently or with confusing errors
- False sense of security

### Issue 2: Fast Refresh Still Causing Full Reloads

**Problem**: Navigating to `/create` triggers Fast Refresh full reload.

**Root Cause**:

- `utils/edgeCaseValidation.ts` has uncached dynamic import
- Possibly component state changes triggering re-evaluation

## Fixes Required

### Fix 1: Add Wallet Health Validation

Need to verify wallet is actually accessible before showing as "connected":

```typescript
// Periodic health check
useEffect(() => {
  if (!isConnected) return;

  const checkHealth = async () => {
    try {
      // Try to access wallet
      const { web3Accounts } = await import("@polkadot/extension-dapp");
      const accounts = await web3Accounts();

      if (accounts.length === 0) {
        // Wallet locked or disconnected
        disconnect();
      }
    } catch (error) {
      // Wallet not accessible
      disconnect();
    }
  };

  // Check every 30 seconds
  const interval = setInterval(checkHealth, 30000);
  return () => clearInterval(interval);
}, [isConnected]);
```

### Fix 2: Validate on Every Operation

Before any wallet operation (sign, send tx), verify wallet is accessible:

```typescript
const validateWalletAccess = async () => {
  if (!selectedAccount) {
    throw new Error("No account selected");
  }

  try {
    const { web3Accounts } = await import("@polkadot/extension-dapp");
    const accounts = await web3Accounts();

    if (accounts.length === 0) {
      throw new Error(
        "Wallet is locked. Please unlock Talisman and try again."
      );
    }

    // Verify our account still exists
    const accountExists = accounts.some(
      (acc) => acc.address === selectedAccount.address
    );
    if (!accountExists) {
      throw new Error(
        "Account no longer available. Please reconnect your wallet."
      );
    }
  } catch (error) {
    // Clear invalid state
    disconnect();
    throw error;
  }
};
```

### Fix 3: Clear State on Window Focus

When user returns to tab, verify wallet is still accessible:

```typescript
useEffect(() => {
  const handleFocus = async () => {
    if (isConnected) {
      try {
        const { web3Accounts } = await import("@polkadot/extension-dapp");
        await web3Accounts(); // Will throw if locked
      } catch {
        disconnect();
      }
    }
  };

  window.addEventListener("focus", handleFocus);
  return () => window.removeEventListener("focus", handleFocus);
}, [isConnected]);
```

### Fix 4: Cache Dynamic Import in edgeCaseValidation.ts

```typescript
// At top of file
let web3EnableCache:
  | typeof import("@polkadot/extension-dapp").web3Enable
  | null = null;

if (typeof window !== "undefined") {
  import("@polkadot/extension-dapp").then((module) => {
    web3EnableCache = module.web3Enable;
  });
}

// In function
const web3Enable =
  web3EnableCache || (await import("@polkadot/extension-dapp")).web3Enable;
```

### Fix 5: Don't Persist Connection State

Remove localStorage persistence entirely - require fresh connection each session:

```typescript
// Remove all localStorage.setItem(STORAGE_KEY, ...)
// Remove all localStorage.getItem(STORAGE_KEY)
// Users must connect wallet each session for security
```

## Security Best Practices

### ✅ DO:

- Validate wallet access before every operation
- Clear state when wallet becomes inaccessible
- Show clear error messages when wallet is locked
- Require fresh connection each session

### ❌ DON'T:

- Trust persisted connection state
- Assume wallet is accessible because state says so
- Cache wallet connection across sessions
- Show "connected" without validation

## Implementation Priority

1. **HIGH**: Remove localStorage persistence (security risk)
2. **HIGH**: Add wallet validation before operations
3. **MEDIUM**: Add periodic health checks
4. **MEDIUM**: Fix remaining dynamic imports
5. **LOW**: Add window focus validation

## Testing Checklist

- [ ] Lock Talisman while app shows "connected" - should auto-disconnect
- [ ] Try to sign message with locked wallet - should show clear error
- [ ] Refresh page - should require reconnection
- [ ] Switch accounts in Talisman - should update or disconnect
- [ ] Close Talisman extension - should disconnect
- [ ] Navigate between pages - should not trigger Fast Refresh reload
