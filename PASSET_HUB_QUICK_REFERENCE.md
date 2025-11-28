# Passet Hub Quick Reference Card

## 🔗 RPC Endpoints

### Ethereum RPC (Use This!)

```
https://testnet-passet-hub-eth-rpc.polkadot.io
```

✅ For: Solidity contracts, forge, cast, ethers.js, MetaMask

### Substrate RPC (Advanced Only)

```
wss://testnet-passet-hub.polkadot.io
```

⚠️ For: Polkadot.js API, substrate pallets only

## 📝 Contract Details

```
Address:  0xeD0fDD2be363590800F86ec8562Dde951654668F
Network:  Passet Hub Testnet
Chain ID: 1000
Token:    PAS (12 decimals)
```

## 🚀 Quick Commands

### Deploy Contract

```bash
forge create --resolc \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key $PRIVATE_KEY \
  contracts/FutureProof.sol:FutureProof
```

### Check Balance

```bash
cast balance 0xYourAddress \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

### Get Nonce

```bash
cast nonce 0xYourAddress \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

### Verify Contract

```bash
cast code 0xContractAddress \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

### Call Contract

```bash
cast call 0xContractAddress \
  "getMessageCount()(uint256)" \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

## 🔑 Address Format

✅ **Correct:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`  
❌ **Wrong:** `5E2jTHsQfRCq8wBPeHgwKQAeCMwSsxYCCZfB4dG2SWhp4ZTv`

Always use Ethereum format (0x...) for Passet Hub!

## 💰 Get Testnet Tokens

1. Visit: https://faucet.polkadot.io/paseo
2. Enter your Ethereum address (0x...)
3. Request PAS tokens
4. Wait ~1-2 minutes

## 🔍 Block Explorers

- **BlockScout:** https://blockscout-passet-hub.parity-testnet.parity.io
- **Polkadot.js:** https://polkadot.js.org/apps/?rpc=wss://testnet-passet-hub.polkadot.io

## 📦 Environment Setup

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xeD0fDD2be363590800F86ec8562Dde951654668F
NEXT_PUBLIC_RPC_ENDPOINT=https://testnet-passet-hub-eth-rpc.polkadot.io
NEXT_PUBLIC_NETWORK=passet-hub
NEXT_PUBLIC_STORACHA_GATEWAY=storacha.link
```

## 🛠️ Wallet Setup

### MetaMask

- All accounts work by default ✅
- Use Ethereum address (0x...)

### Talisman

- Create **Ethereum account** (NOT Polkadot) ✅
- Select "Ethereum" when creating account

## ⚠️ Common Errors

| Error                  | Solution                            |
| ---------------------- | ----------------------------------- |
| "Method not found"     | Use Ethereum RPC, not Substrate RPC |
| "Invalid address"      | Use 0x... format, not 5... format   |
| "Insufficient balance" | Get tokens from faucet              |
| "Connection refused"   | Check RPC URL (HTTPS, not WSS)      |

## 📚 Documentation

- **Full Guide:** `README.md`
- **RPC Details:** `docs/RPC_ENDPOINTS.md`
- **Deployment:** `contract/DEPLOYMENT_GUIDE.md`
- **Wallet Setup:** `WALLET_SETUP_GUIDE.md`

## 🆘 Emergency Recovery

### Lost Contract Address?

```bash
# 1. Get your deployer address
cast wallet address --private-key $PRIVATE_KEY

# 2. Check nonce
cast nonce YOUR_ADDRESS \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io

# 3. Calculate contract address (use nonce - 1)
cast compute-address YOUR_ADDRESS --nonce 0
```

---

**Keep this card handy for quick reference!**
