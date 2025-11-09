# Quick Start: Retry Tests 2.4 - 2.7+

**Status**: ✅ Bugs fixed, ready to test  
**Time Needed**: ~30 minutes

---

## 🚀 Quick Setup

### 1. Verify Fixes Applied

```bash
# Check that both fixes are in place
grep -A 5 "getPublicKeyFromTalisman" lib/crypto/AsymmetricCrypto.ts
grep "randomAsU8a(24)" lib/crypto/AsymmetricCrypto.ts
```

Should show: 
- `decodeAddress(address)` (public key fix)
- `const nonce = randomAsU8a(24)` (encryption fix)

### 2. Restart Dev Server (IMPORTANT!)

```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

**Note**: You MUST restart the dev server for the encryption fix to take effect!

### 3. Prepare Test Environment

```bash
# Make sure dev server is running
npm run dev
```

Open http://localhost:3000 in browser with Talisman installed

### 3. Get Test Recipient Address

**Option A**: Create second account in Talisman

1. Open Talisman extension
2. Click "+" to add account
3. Create new account
4. Copy the address (starts with 5)

**Option B**: Use any valid Westend address

- Get from faucet page: https://faucet.polkadot.io/westend
- Or use a friend's address
- Any valid SS58 address works now!

---

## 📋 Test Sequence

### ✅ Test 2.4: Transaction Submission (Normal Network)

**Setup**:

- Network: No throttling
- Wallet: Connected with WND tokens
- Recipient: Valid Westend address (from step 3 above)

**Steps**:

1. Navigate to http://localhost:3000/create
2. Enter recipient address (the one from step 3)
3. Set unlock date/time (tomorrow at noon)
4. Upload a small test file (5-10MB)
5. Click "Create Time-Locked Message"
6. Approve transaction in Talisman popup
7. Wait for completion

**Expected**:

- ✅ No "Account not found" error
- ✅ Transaction submits successfully
- ✅ Completes in 30-90 seconds
- ✅ Success message with Message ID

**Record**:

- Submission time: **\_** seconds
- Finalization time: **\_** seconds
- Total time: **\_** seconds
- Status: ✅ Success / ❌ Failed
- Message ID: **********\_**********

---

### ✅ Test 2.5: Transaction Submission (Slow 3G)

**Setup**:

- Network: Slow 3G (in DevTools)
- Same recipient as Test 2.4

**Steps**:

1. Open DevTools → Network tab
2. Select "Slow 3G" throttling
3. Repeat Test 2.4 steps

**Expected**:

- ✅ Completes in 60-120 seconds
- ✅ No timeout (120s limit)
- ✅ Progress indicator updates

**Record**:

- Total time: **\_** seconds
- Timeout triggered: ✅ Yes / ❌ No
- Status: ✅ Success / ❌ Failed

---

### ✅ Test 2.6: Query Messages (Normal Network)

**Setup**:

- Network: No throttling
- Prerequisite: At least 1 message created (from Test 2.4)

**Steps**:

1. Navigate to http://localhost:3000/dashboard
2. Observe message loading
3. Check console for query logs

**Expected**:

- ✅ Messages load in 5-15 seconds
- ✅ No timeout (60s batch limit)
- ✅ Your created message appears

**Record**:

- Load time: **\_** seconds
- Messages found: **\_** count
- Status: ✅ Success / ❌ Failed

---

### ✅ Test 2.7: Query Messages (Slow 3G)

**Setup**:

- Network: Slow 3G

**Steps**:

1. Apply Slow 3G throttling
2. Navigate to Dashboard
3. Observe loading time

**Expected**:

- ✅ Messages load in 30-60 seconds
- ✅ No timeout
- ✅ Loading indicator shown

**Record**:

- Load time: **\_** seconds
- Timeout triggered: ✅ Yes / ❌ No
- Status: ✅ Success / ❌ Failed

---

## 🐛 Troubleshooting

### "Invalid Polkadot address format"

- Check address starts with 5 (Westend)
- Verify it's 47-48 characters long
- No spaces or special characters

### "Insufficient balance" / "funds"

- Get WND tokens from faucet: https://faucet.polkadot.io/westend
- Wait 30 seconds for tokens to arrive
- Check balance in Talisman

### "Transaction was cancelled"

- You clicked "Cancel" in Talisman popup
- Retry and click "Approve" this time

### Still getting "Account not found"

- Verify the fix was applied (see step 1 above)
- Restart dev server: `npm run dev`
- Clear browser cache and refresh

### "Bad nonce size" error

- **FIXED!** Restart dev server: `npm run dev`
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- See `ENCRYPTION_FIX_APPLIED.md` for details

---

## 📊 After Testing

### Update Test Guide

1. Open `MANUAL_TIMEOUT_TEST_GUIDE.md`
2. Fill in your test results
3. Mark tests as complete

### Continue to Test Suite 3

Once Tests 2.4-2.7 pass, continue with:

- Test Suite 3: IPFS Operations (3.1-3.7)
- Test Suite 4: Crypto Operations (4.1-4.2)
- Test Suite 5: End-to-End Scenarios (5.1-5.4)

---

## ✅ Success Criteria

All tests should pass with:

- ✅ No "Account not found" errors
- ✅ Transactions complete successfully
- ✅ Messages appear on dashboard
- ✅ No unexpected timeouts
- ✅ All operations within timeout limits

---

**Good luck with testing! You've got this! 🎉**
