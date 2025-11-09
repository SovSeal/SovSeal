# Technology Stack

## Core Technologies

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with Prettier plugin for class sorting
- **Blockchain**: Polkadot.js API for Westend testnet
- **Storage**: Web3.Storage w3up-client (IPFS) for decentralized file storage
- **Wallet**: Talisman browser extension via @polkadot/extension-dapp
- **Cryptography**: Web Crypto API (AES-256-GCM, RSA-OAEP)

## Key Dependencies

```json
{
  "@polkadot/api": "^16.4.9",
  "@polkadot/extension-dapp": "^0.62.3",
  "@polkadot/util-crypto": "^13.5.7",
  "@web3-storage/w3up-client": "^17.3.0",
  "next": "^14.2.0",
  "react": "^18.3.0"
}
```

## Common Commands

### Development
```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Create production build
npm start            # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## TypeScript Configuration

- Target: ES2020
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Module resolution: bundler (Next.js)

## ESLint Rules

- Extends: next/core-web-vitals, next/typescript
- Unused vars: warn (ignore args starting with `_`)
- Explicit any: warn

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Smart contract address
- `NEXT_PUBLIC_RPC_ENDPOINT` - Polkadot RPC endpoint (default: wss://westend-rpc.polkadot.io)
- `NEXT_PUBLIC_NETWORK` - Network name (westend)
- `NEXT_PUBLIC_PINATA_API_KEY` - Pinata API key (optional)
- `NEXT_PUBLIC_PINATA_SECRET` - Pinata secret (optional)
- `NEXT_PUBLIC_DEMO_MODE` - Enable demo mode (false)

Note: The new w3up-client uses email-based authentication or delegation instead of API tokens.

## Prerequisites

- Node.js 18+
- Talisman wallet browser extension
- Web3.Storage account (email-based authentication)
- Westend testnet tokens (from faucet)
