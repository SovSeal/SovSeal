# Wallet Setup Guide for Passet Hub

## Critical Information

**Passet Hub uses pallet-revive (PolkaVM) which requires Ethereum-format addresses (0x...)**

❌ **DO NOT USE** Substrate/Polkadot addresses (5...)  
✅ **USE** Ethereum addresses (0x...)

---

## Option 1: Talisman (Recommended)

Talisman is the recommended wallet for Polkadot ecosystem projects. It supports both Polkadot and Ethereum accounts. **You must use an Ethereum account.**

### Installation

1. Visit https://www.talisman.xyz/download
2. Install browser extension
3. Create a new wallet or import existing
4. Save your seed phrase securely

### Create Ethereum Account

1. Open Talisman extension
2. Click "Add Account" or "+"
3. **Select "Ethereum" account type** (not Polkadot!)
4. Name your account (e.g., "FutureProof ETH")
5. Verify address starts with **0x**

### Get Tokens

1. Copy your Ethereum address (starts with 0x)
2. Visit https://faucet.polkadot.io/paseo
3. Paste your address
4. Request tokens
5. Wait ~1 minute

---

## Option 2: MetaMask (Alternative)

MetaMask is a popular alternative as all accounts are Ethereum by default.

### Installation

1. Visit https://metamask.io/
2. Install browser extension
3. Create a new wallet or import existing
4. Save your seed phrase securely

### Configuration

1. Open MetaMask
2. Click network dropdown
3. Select "Add Network" → "Add a network manually"
4. Enter Passet Hub details:
   - **Network Name**: Passet Hub Testnet
   - **RPC URL**: `wss://testnet-passet-hub.polkadot.io`
   - **Chain ID**: (TBD - check with Passet Hub docs)
   - **Currency Symbol**: PAS
   - **Block Explorer**: (if available)
5. Save

### Get Tokens

1. Copy your address (starts with 0x)
2. Visit https://faucet.polkadot.io/paseo
3. Paste your address
4. Request tokens
5. Wait ~1 minute

---

1. Visit https://talisman.xyz/
2. Install browser extension
3. Create a new wallet
4. Save your seed phrase securely

### Create Ethereum Account

**IMPORTANT:** You need an Ethereum account, not a Polkadot account.

1. Open Talisman
2. Click "+" to add account
3. Select **"Ethereum"** (NOT "Polkadot")
4. Name your account
5. Your address will start with 0x

### Configuration

1. Open Talisman
2. Click network dropdown
3. Search for "Passet Hub" or add custom network
4. Select Passet Hub Testnet

### Get Tokens

1. Copy your Ethereum address (starts with 0x)
2. Visit https://faucet.polkadot.io/paseo
3. Paste your address
4. Request tokens
5. Wait ~1 minute

---

## Verification

### Check Your Address Format

✅ **Correct (Ethereum):**
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```
- Starts with `0x`
- Followed by 40 hexadecimal characters
- Total length: 42 characters

❌ **Wrong (Substrate):**
```
5E2jTHsQfRCq8wBPeHgwKQAeCMwSsxYCCZfB4dG2SWhp4ZTv
```
- Starts with number/letter (not 0x)
- 47-48 characters long
- This will NOT work on Passet Hub

### Test Connection

1. Open Lockdrop app
2. Click "Connect Wallet"
3. Select your wallet (Talisman recommended, MetaMask supported)
4. Approve connection
5. You should see:
   - ✅ Wallet connected
   - ✅ Your 0x... address displayed
   - ✅ PAS balance shown
   - ✅ Network: Passet Hub

---

## Troubleshooting

### "Invalid address format"

**Problem:** You're using a Substrate address (5...)

**Solution:**
- MetaMask: All addresses are correct by default
- Talisman: Make sure you created an **Ethereum account**, not Polkadot

### "Cannot connect to network"

**Problem:** Wrong network configuration

**Solution:**
1. Check RPC endpoint: `wss://testnet-passet-hub.polkadot.io`
2. Verify network name: `passet-hub`
3. Restart browser/wallet

### "Insufficient balance"

**Problem:** No PAS tokens

**Solution:**
1. Visit faucet: https://faucet.polkadot.io/paseo
2. Use your 0x... address
3. Wait for tokens to arrive
4. Check balance in wallet

### Talisman shows Polkadot address

**Problem:** You created a Polkadot account instead of Ethereum

**Solution:**
1. Create a new account in Talisman
2. Select **"Ethereum"** as account type
3. Use this new account for FutureProof

---

## Quick Reference

| Wallet | Account Type | Address Format | Works with Passet Hub? |
|--------|-------------|----------------|----------------------|
| MetaMask | Ethereum (default) | 0x... | ✅ Yes |
| Talisman (Ethereum) | Ethereum | 0x... | ✅ Yes |
| Talisman (Polkadot) | Substrate | 5... | ❌ No |

---

## Summary

1. **Use Ethereum addresses (0x...)** for Passet Hub
2. **MetaMask** works out of the box
3. **Talisman** requires creating an Ethereum account
4. Get PAS tokens from https://faucet.polkadot.io/paseo
5. Verify your address starts with 0x

---

**Need Help?**

- Check `.env.local` has correct contract address (0x...)
- Verify RPC endpoint: `wss://testnet-passet-hub.polkadot.io`
- See `ADDRESS_FORMAT_FIX.md` for technical details
