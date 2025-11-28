# Lockdrop - Current Status

**Last Updated**: November 17, 2025  
**Version**: 1.0.0  
**Status**: ✅ FULLY FUNCTIONAL

---

## ✅ Working Features

### Core Functionality

- [x] Create encrypted time-locked messages
- [x] Upload video/audio files (MP4, WebM, MP3, WAV, OGG)
- [x] Client-side AES-256-GCM encryption
- [x] RSA-OAEP key encryption with wallet
- [x] IPFS storage via Storacha Network
- [x] Blockchain storage on Passet Hub
- [x] Time-locked message unlocking
- [x] Secure media playback
- [x] Automatic memory cleanup

### Wallet Integration

- [x] Talisman wallet support (recommended)
- [x] MetaMask wallet support
- [x] EIP-1193 standard compliance
- [x] Ethereum address format (0x...)
- [x] Network detection and switching
- [x] Connection state management

### Dashboard

- [x] View received messages
- [x] Real-time status updates (Locked/Unlockable/Unlocked)
- [x] Filter by status
- [x] Sort by date (newest/oldest)
- [x] Pagination for large lists
- [x] Refresh functionality

### Security

- [x] End-to-end encryption
- [x] Client-side only decryption
- [x] No plaintext storage
- [x] Blockchain-enforced unlock times
- [x] SHA-256 integrity verification
- [x] Automatic sensitive data cleanup

---

## 📋 Quick Start

### 1. Install Wallet

- **Recommended**: [Talisman](https://www.talisman.xyz/download)
- **Alternative**: [MetaMask](https://metamask.io/download)
- Create an **Ethereum account** (address starts with 0x)

### 2. Get Testnet Tokens

1. Copy your Ethereum address
2. Visit [Paseo Faucet](https://faucet.polkadot.io/paseo)
3. Request PAS tokens
4. Wait ~1 minute

### 3. Setup Storacha

1. Visit [Storacha](https://storacha.network)
2. Sign up with email
3. Create a space
4. Copy your DID (starts with `did:key:`)
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_STORACHA_DID=your_did_here
   ```

### 4. Run the App

```bash
npm install
npm run dev
```

Visit http://localhost:3000

---

## 🔧 Configuration

### Environment Variables

```bash
# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0xeD0fDD2be363590800F86ec8562Dde951654668F
NEXT_PUBLIC_RPC_ENDPOINT=https://testnet-passet-hub-eth-rpc.polkadot.io
NEXT_PUBLIC_NETWORK=passet-hub

# Storage
NEXT_PUBLIC_STORACHA_GATEWAY=storacha.link
NEXT_PUBLIC_STORACHA_DID=your_did_here
```

### Supported Networks

- **Passet Hub Testnet** (Chain ID: 420420421)
- Currency: PAS (testnet tokens)
- RPC: https://testnet-passet-hub-eth-rpc.polkadot.io

### Supported Media Formats

- **Video**: MP4, WebM
- **Audio**: MP3, WAV, OGG
- Auto-detected via file magic numbers

---

## 🐛 Known Issues

### 1. Old Messages Without Mime Type

**Issue**: Messages created before v1.0.0 may show "Unsupported media type"  
**Solution**: Create a new message (mime type now stored automatically)

### 2. Hot Reload Blob URL Issues

**Issue**: During development, hot reload may revoke blob URLs  
**Solution**: Refresh the page after unlocking

### 3. Network Mismatch

**Issue**: Wallet on wrong network (Ethereum Mainnet instead of Passet Hub)  
**Solution**: Switch wallet to Passet Hub testnet or add the network

---

## 📚 Documentation

### Essential Docs

- [README.md](README.md) - Project overview and setup
- [WALLET_SETUP_GUIDE.md](WALLET_SETUP_GUIDE.md) - Wallet configuration
- [WALLET_TROUBLESHOOTING.md](WALLET_TROUBLESHOOTING.md) - Common wallet issues
- [CHANGELOG.md](CHANGELOG.md) - Version history

### Technical Docs

- [POLKADOT_ECOSYSTEM_EXPLAINED.md](POLKADOT_ECOSYSTEM_EXPLAINED.md) - Understanding Passet Hub
- [ETHERS_QUICK_REFERENCE.md](ETHERS_QUICK_REFERENCE.md) - Contract interaction guide
- [PASSET_HUB_QUICK_REFERENCE.md](PASSET_HUB_QUICK_REFERENCE.md) - Network commands

### Developer Docs

- [docs/CONNECTION_IMPROVEMENTS.md](docs/CONNECTION_IMPROVEMENTS.md) - Connection persistence improvements
- [docs/USER_CONNECTION_GUIDE.md](docs/USER_CONNECTION_GUIDE.md) - User connection setup guide
- [docs/RPC_ENDPOINTS.md](docs/RPC_ENDPOINTS.md) - RPC endpoint reference

---

## 🚀 Next Steps

### For Users

1. Install Talisman wallet
2. Get testnet tokens
3. Create your first time-locked message
4. Test the unlock flow

### For Developers

1. Review the codebase structure
2. Check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
3. Run tests: `npm test`
4. Deploy to production (see deployment docs)

---

## 💡 Tips

### Creating Messages

- Use MP4 for best video compatibility
- Keep files under 100MB for faster uploads
- Set unlock time at least 1 minute in future for testing
- Send to yourself first to test the flow

### Unlocking Messages

- Wait for status to change to "Unlockable"
- Ensure wallet is connected
- Click the message to start unlock flow
- Media player will open automatically

### Troubleshooting

- Check browser console for detailed errors
- Ensure wallet is on Passet Hub network
- Verify you have PAS tokens for gas
- Clear localStorage if status seems stuck

---

**Status**: ✅ Production Ready  
**Last Tested**: November 17, 2025  
**Test Coverage**: Core flows verified
