# FutureProof

**Guaranteed by math, not corporations**

A decentralized time-capsule application that enables users to create time-locked audio/video messages using client-side encryption, IPFS storage, and Polkadot blockchain.

## 🎯 Overview

FutureProof is a privacy-first application that allows you to send messages to the future. Record or upload audio/video content, encrypt it locally in your browser, store it on decentralized IPFS, and set a future unlock time enforced by the Polkadot blockchain. No corporation, server, or third party can access your content before the unlock time—it's guaranteed by cryptography and blockchain consensus.

## ✨ Features

- 🔐 **Client-side encryption** with AES-256-GCM (all encryption happens in your browser)
- 🌐 **Decentralized storage** via IPFS using Web3.Storage (w3up-client)
- ⛓️ **Blockchain-enforced unlock conditions** on Polkadot Westend testnet
- 🎥 **Record or upload** audio/video messages directly in the browser
- ⏰ **Time-locked message delivery** with timestamp verification
- 🦊 **Talisman wallet integration** for blockchain interactions
- 📦 **Recipient-without-wallet flow** using redeem packages with passphrase protection
- 📊 **Dashboard** to track sent and received messages with real-time status updates

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client-Side)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js Application                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   UI Layer   │  │ Crypto Layer │  │ Wallet Layer │ │ │
│  │  │  (React)     │  │ (Web Crypto) │  │ (Talisman)   │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Media Layer  │  │ Storage Layer│  │Contract Layer│ │ │
│  │  │(MediaRecorder│  │ (IPFS Client)│  │(Polkadot.js) │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Web3.Storage │    │   Polkadot   │    │   Talisman   │
│   (IPFS)     │    │   Westend    │    │    Wallet    │
│              │    │   Testnet    │    │  Extension   │
└──────────────┘    └──────────────┘    └──────────────┘
```

### How It Works

1. **Create**: Record or upload audio/video content
2. **Encrypt**: Generate unique AES-256 key and encrypt content locally
3. **Store**: Upload encrypted content to IPFS via Web3.Storage
4. **Anchor**: Submit metadata (CID, unlock timestamp, recipient) to Polkadot smart contract
5. **Wait**: Blockchain enforces the time-lock until unlock timestamp
6. **Unlock**: Recipient decrypts and plays content after timestamp passes

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Blockchain**: Polkadot.js API for Westend testnet
- **Storage**: @web3-storage/w3up-client (IPFS)
- **Wallet**: Talisman browser extension via @polkadot/extension-dapp
- **Cryptography**: Web Crypto API (AES-256-GCM, RSA-OAEP)
- **Media**: MediaRecorder API for recording

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed and configured:

- **Node.js 18+** and npm
- **Talisman wallet** browser extension ([Install here](https://talisman.xyz/))
- **Web3.Storage account** (email-based authentication via w3up-client - [Sign up](https://web3.storage/))
- **Westend testnet tokens** (see [Getting Testnet Tokens](#getting-testnet-tokens) below)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/futureproof-app.git
cd futureproof-app
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

4. **Configure environment variables:**

Edit `.env.local` with your configuration:

```env
# Smart Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_RPC_ENDPOINT=wss://westend-rpc.polkadot.io
NEXT_PUBLIC_NETWORK=westend

# Web3.Storage (w3up-client) Configuration
# Note: w3up-client uses email-based authentication
# No API token required - authentication happens in-browser
# See: https://web3.storage/docs/w3up-client/

# Optional: Pinata Fallback (alternative IPFS provider)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_SECRET=your_pinata_secret_here

# Demo Mode (for testing without timestamp enforcement)
NEXT_PUBLIC_DEMO_MODE=false
```

### Environment Variables Explained

| Variable                       | Required | Description                                                          |
| ------------------------------ | -------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Yes      | Address of the deployed smart contract on Westend                    |
| `NEXT_PUBLIC_RPC_ENDPOINT`     | Yes      | Polkadot RPC endpoint (default: `wss://westend-rpc.polkadot.io`)     |
| `NEXT_PUBLIC_NETWORK`          | Yes      | Network name (use `westend` for testnet)                             |
| `NEXT_PUBLIC_PINATA_API_KEY`   | No       | Pinata API key for IPFS fallback                                     |
| `NEXT_PUBLIC_PINATA_SECRET`    | No       | Pinata secret for IPFS fallback                                      |
| `NEXT_PUBLIC_DEMO_MODE`        | No       | Enable demo mode to bypass timestamp verification (default: `false`) |

### Getting Testnet Tokens

To interact with the Westend testnet, you'll need WND tokens. Get them from these faucets:

- **Polkadot Faucet**: https://faucet.polkadot.io/westend
- **Matrix Faucet Bot**: Join the [Westend Faucet room](https://matrix.to/#/#westend_faucet:matrix.org) on Matrix

**Steps:**

1. Install and open Talisman wallet
2. Create or import a Polkadot account
3. Copy your Westend address
4. Visit the faucet and request tokens (usually 1-10 WND)
5. Wait for confirmation (usually takes 1-2 minutes)

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

Create an optimized production build:

```bash
npm run build
npm start
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Project Structure

```
futureproof-app/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Core services (encryption, IPFS, contracts)
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── public/           # Static assets
```

## 🔒 Privacy Guarantees

FutureProof is designed with privacy as the foundation. Here's what makes it secure:

### Client-Side Encryption

- **All encryption/decryption happens in your browser** using the Web Crypto API
- **No plaintext media or keys ever leave your device**
- Each message uses a unique AES-256-GCM encryption key
- Keys are encrypted with recipient's public key before storage

### Decentralized Architecture

- **No central servers** can access your content
- **IPFS storage** ensures content is distributed across multiple nodes
- **Blockchain consensus** enforces unlock conditions—no single authority can override them
- **Open source** code allows anyone to verify the implementation

### Zero-Knowledge Design

- Application never sees your unencrypted content
- Web3.Storage only receives encrypted blobs (meaningless without the key)
- Smart contract only stores metadata (CIDs, timestamps, addresses)
- Talisman wallet keeps your private keys secure

### Memory Safety

- Decrypted content exists only in browser memory during playback
- Object URLs are automatically revoked after use
- Sensitive data is cleared from memory after operations
- No decrypted content is written to disk or cache

### Timestamp Enforcement

- Unlock times are enforced by blockchain consensus
- Recipients cannot decrypt before the timestamp (even with the encrypted key)
- Verification happens on-chain, not in the application
- Demo mode is clearly labeled and disabled in production

## ⚠️ Important Security Notes

### Key Backup Warning

**CRITICAL: Back up your Talisman wallet seed phrase immediately!**

- If you lose access to your wallet, **you cannot decrypt received messages**
- There is no password recovery or account restoration
- Your seed phrase is the ONLY way to recover your private keys
- Store it securely offline (never digitally or in the cloud)

### Storage Limitations

**Web3.Storage Free Tier:**

- Free tier provides generous storage but has limits
- Content is pinned automatically but not guaranteed forever
- For critical long-term storage, consider:
  - **Paid Web3.Storage plans** for guaranteed persistence
  - **Pinata** as a backup pinning service
  - **Arweave** for permanent storage
  - **Export encrypted CIDs** and store them separately (see below)

### Export Procedure for Encrypted CIDs

To ensure long-term access to your messages, export and back up the encrypted CIDs:

1. **From Dashboard**: Navigate to your sent/received messages
2. **Copy CIDs**: Note the `encryptedMessageCID` and `encryptedKeyCID` for each message
3. **Store Securely**: Save these CIDs in a secure location (encrypted backup, password manager)
4. **Re-pin if Needed**: You can re-upload content to IPFS using the CIDs if original pins expire
5. **Blockchain Metadata**: Message metadata remains on-chain permanently

**Example backup format:**

```json
{
  "messageId": "0x123...",
  "encryptedMessageCID": "bafybeig...",
  "encryptedKeyCID": "bafybeih...",
  "unlockTimestamp": 1735689600,
  "recipient": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
}
```

## 📱 Platform Limitations

### iOS Safari Limitations

**MediaRecorder API Support:**

- iOS Safari has limited MediaRecorder API support
- Recording may not work on older iOS versions (< iOS 14.3)
- **Fallback**: Upload-only mode is automatically enabled on unsupported devices
- Users can record on another device and upload the file

**Recommended Approach:**

- Use desktop browsers (Chrome, Firefox, Edge) for recording
- Use iOS Safari for uploading pre-recorded files
- Test on your specific iOS version before relying on recording

### Mobile Wallet Limitations

**Desktop Extension Required:**

- Talisman wallet is currently a **desktop browser extension only**
- Mobile wallet support (WalletConnect or Talisman mobile) is not yet implemented
- **Workaround**: Use the redeem package flow for mobile recipients

**Redeem Package Flow:**

- Senders can create a redeem package with passphrase protection
- Recipients receive a claim link they can open on mobile
- After setting up Talisman on desktop, they can import and decrypt the message

## 📦 Smart Contract Deployment

### Option 1: Deploy Your Own Contract

If you have a Rust toolchain and want to deploy your own contract:

1. **Install Prerequisites:**

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install ink! CLI
cargo install cargo-contract --force
```

2. **Create ink! Contract:**

Create a new ink! contract project with the following interface:

```rust
#[ink(message)]
pub fn store_message(
    &mut self,
    encrypted_key_cid: String,
    encrypted_message_cid: String,
    message_hash: String,
    unlock_timestamp: u64,
    recipient: AccountId,
) -> Result<MessageId, Error>;

#[ink(message)]
pub fn get_sent_messages(&self, sender: AccountId) -> Vec<MessageMetadata>;

#[ink(message)]
pub fn get_received_messages(&self, recipient: AccountId) -> Vec<MessageMetadata>;
```

3. **Compile Contract:**

```bash
cargo contract build --release
```

4. **Deploy to Westend:**

- Use [Contracts UI](https://contracts-ui.substrate.io/)
- Connect to Westend testnet
- Upload and instantiate your contract
- Copy the contract address to `.env.local`

### Option 2: Use Existing Contract (Fallback Approach)

If you don't have a Rust toolchain or prefer to use an existing contract:

**Fallback Contract Details:**

- **Network**: Westend Testnet
- **Contract Address**: `[To be provided after deployment]`
- **ABI**: See `docs/contract-abi.json`

**Verification:**

1. Visit [Polkadot.js Apps](https://polkadot.js.org/apps/)
2. Connect to Westend testnet
3. Navigate to Developer > Contracts
4. Add the contract address
5. Verify the contract code and ABI

**Switching Contracts:**
Simply update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local` to switch between contracts.

### Contract ABI

The contract ABI is documented in `docs/developer-guide.md`. Key methods:

- `store_message`: Store encrypted message metadata on-chain
- `get_sent_messages`: Query messages sent by an address
- `get_received_messages`: Query messages received by an address

## 🔑 Key Conversion Libraries

For developers working with Polkadot wallet keys:

### Ed25519/Sr25519 to X25519 Conversion

Polkadot wallets (like Talisman) use Ed25519 or Sr25519 keys for signing. To use these keys for encryption (X25519/ECDH), conversion is required.

**Recommended Libraries:**

- **@polkadot/util-crypto**: Official Polkadot utilities with key conversion functions
- **@noble/curves**: Modern, audited cryptography library
- **libsodium.js**: Comprehensive crypto library with conversion support

**Example Conversion (using @polkadot/util-crypto):**

```typescript
import { sr25519ToX25519 } from "@polkadot/util-crypto";

// Convert Sr25519 public key to X25519 for encryption
const x25519PublicKey = sr25519ToX25519(sr25519PublicKey);
```

See `docs/developer-guide.md` for detailed conversion steps and examples.

## 📅 Redeem Package Expiry Policies

### What are Redeem Packages?

Redeem packages allow sending messages to recipients who don't yet have a Polkadot wallet. The sender creates a package protected by a passphrase, which the recipient can claim later.

### Expiry Recommendations

**Default Expiry: 30 days**

- Redeem packages should have a reasonable expiry to limit exposure
- After expiry, the package CID may be unpinned from IPFS
- Recipients should claim packages promptly

**Best Practices:**

1. **Set Expiry**: Include expiration timestamp in redeem package metadata
2. **Notify Recipient**: Share the claim link and passphrase through separate channels
3. **Monitor Claims**: Check if package has been claimed before expiry
4. **Reissue if Needed**: Create a new package if the original expires unclaimed
5. **Document Expiry**: Clearly communicate expiry date to recipient

**Security Considerations:**

- Shorter expiry = less time for brute-force attacks on passphrase
- Longer expiry = more convenience for recipient
- Balance security and usability based on content sensitivity

**Implementation:**

```typescript
const redeemPackage = {
  // ... other fields
  expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  createdAt: Date.now(),
};
```

## 📚 Documentation

### For Users

- **[User Guide](docs/user-guide.md)**: Step-by-step tutorials for using FutureProof
- **[FAQ](docs/user-guide.md#faq)**: Common questions and answers

### For Developers

- **[Developer Guide](docs/developer-guide.md)**: API reference, architecture, and technical details
- **[Requirements](.kiro/specs/futureproof-app/requirements.md)**: Detailed requirements specification
- **[Design](.kiro/specs/futureproof-app/design.md)**: Architecture and design decisions
- **[Implementation Tasks](.kiro/specs/futureproof-app/tasks.md)**: Development roadmap

### Additional Resources

- **[Error Handling](docs/ERROR_HANDLING_QUICK_REFERENCE.md)**: Error handling patterns
- **[Network Resilience](docs/NETWORK_RESILIENCE.md)**: Retry logic and timeout handling
- **[Testing Guide](docs/EDGE_CASE_TESTING.md)**: Testing strategies and edge cases

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built on [Polkadot](https://polkadot.network/) blockchain infrastructure
- Storage powered by [Web3.Storage](https://web3.storage/)
- Wallet integration via [Talisman](https://talisman.xyz/)
- UI framework by [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/futureproof-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/futureproof-app/discussions)
- **Email**: support@futureproof.example.com

---

**Remember: Your privacy is guaranteed by math, not corporations. Always back up your wallet seed phrase!**
