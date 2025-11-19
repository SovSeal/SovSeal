# Redeem Package Components

Components for handling recipient-without-wallet flow in Lockdrop.

## Overview

These components enable senders to create passphrase-protected claim links for recipients who don't have a Talisman wallet yet. Recipients can claim messages after setting up a wallet.

## Components

### RedeemPackageGenerator

Allows senders to create a passphrase-protected redeem package.

**Features:**
- Passphrase input with confirmation
- Configurable expiration period
- Encrypts package with PBKDF2-derived key
- Uploads encrypted package to IPFS
- Generates shareable claim link

**Usage:**
```tsx
<RedeemPackageGenerator
  encryptedKeyCID="bafybeiabc..."
  encryptedMessageCID="bafybeiabc..."
  messageHash="sha256hash..."
  unlockTimestamp={1234567890}
  senderAddress="5GrwvaEF..."
  onComplete={(claimLink) => console.log(claimLink)}
  onCancel={() => console.log('Cancelled')}
/>
```

### ClaimLinkDisplay

Displays the generated claim link to the sender with instructions.

**Features:**
- Copy-to-clipboard functionality
- Security reminders
- Expiration information
- Sharing instructions

**Usage:**
```tsx
<ClaimLinkDisplay
  claimLink={{
    url: 'https://app.com/claim/bafybeiabc...',
    packageCID: 'bafybeiabc...',
    expiresAt: 1234567890
  }}
  onClose={() => console.log('Closed')}
/>
```

### ClaimInterface

Allows recipients to claim messages using a passphrase.

**Features:**
- Passphrase input
- Downloads encrypted package from IPFS
- Decrypts package with passphrase
- Wallet connection check
- Saves claimed message to localStorage

**Usage:**
```tsx
<ClaimInterface
  packageCID="bafybeiabc..."
  onClaimed={(package) => console.log('Claimed:', package)}
/>
```

## Security

- Passphrases must be at least 8 characters
- PBKDF2 with 100,000 iterations for key derivation
- AES-256-GCM encryption
- Passphrase and link should be shared through separate channels
- Packages include expiration timestamps

## Requirements

Implements requirement 6.6: Recipient-without-wallet flow
