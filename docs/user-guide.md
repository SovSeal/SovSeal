# Lockdrop User Guide

Welcome to Lockdrop! This guide will help you get started with creating and receiving time-locked messages.

## Table of Contents

1. [What is Lockdrop?](#what-is-lockdrop)
2. [Getting Started](#getting-started)
3. [Connecting Your Wallet](#connecting-your-wallet)
4. [Creating Time-Locked Messages](#creating-time-locked-messages)
5. [Viewing Your Messages](#viewing-your-messages)
6. [Unlocking and Playing Messages](#unlocking-and-playing-messages)
7. [Privacy Features](#privacy-features)
8. [Key Backup](#key-backup)
9. [FAQ](#faq)

## What is Lockdrop?

Lockdrop is a decentralized application that lets you send messages to the future. You can:

- **Record or upload** audio/video messages
- **Set an unlock time** when the message can be viewed
- **Send to anyone** with a Polkadot wallet address
- **Guarantee privacy** through client-side encryption

Your messages are encrypted in your browser, stored on decentralized IPFS, and unlock times are enforced by the Polkadot blockchain. No corporation or server can access your content—it's guaranteed by mathematics.

### Key Benefits

✅ **Complete Privacy**: All encryption happens in your browser  
✅ **Decentralized**: No central server can access your content  
✅ **Time-Locked**: Recipients can't view messages before unlock time  
✅ **Permanent**: Messages stored on IPFS are distributed and resilient  
✅ **Trustless**: Blockchain enforces rules, not corporations  

## Getting Started

### What You'll Need

Before using Lockdrop, make sure you have:

1. **A modern web browser**
   - Chrome, Firefox, or Edge (recommended)
   - Safari works but has limited recording support

2. **Talisman Wallet** (browser extension)
   - Download from [talisman.xyz](https://talisman.xyz/)
   - Available for Chrome, Firefox, and Edge
   - Free to install and use

3. **Westend Testnet Tokens** (WND)
   - Free tokens for testing
   - Get them from the faucet (see below)

4. **Internet Connection**
   - Required for uploading to IPFS and blockchain


## Connecting Your Wallet

### Step 1: Install Talisman Wallet

1. Visit [talisman.xyz](https://talisman.xyz/)
2. Click "Download" and select your browser
3. Install the extension from your browser's extension store
4. Click the Talisman icon in your browser toolbar
5. Follow the setup wizard to create a new wallet

### Step 2: Create or Import an Account

**Creating a New Account:**
1. Open Talisman wallet
2. Click "Create New Account"
3. Choose "Polkadot" as the network
4. Give your account a name
5. **IMPORTANT**: Write down your seed phrase and store it safely!
6. Confirm your seed phrase
7. Set a password for the wallet

**Importing an Existing Account:**
1. Open Talisman wallet
2. Click "Import Account"
3. Enter your seed phrase or private key
4. Choose "Polkadot" network
5. Set a password

### Step 3: Get Testnet Tokens

You need WND tokens to send messages on the Westend testnet:

1. Copy your Polkadot address from Talisman
2. Visit the [Westend Faucet](https://faucet.polkadot.io/westend)
3. Paste your address and request tokens
4. Wait 1-2 minutes for tokens to arrive
5. Check your balance in Talisman

**Alternative Faucet:**
- Join the [Westend Faucet Matrix room](https://matrix.to/#/#westend_faucet:matrix.org)
- Send your address in the chat
- The bot will send you tokens

### Step 4: Connect to Lockdrop

1. Open Lockdrop in your browser
2. Click "Connect Wallet" button
3. Talisman will pop up asking for permission
4. Click "Connect" to authorize Lockdrop
5. Select the account you want to use
6. You're connected! Your address will appear in the header

**Troubleshooting:**
- If Talisman doesn't pop up, click the extension icon and unlock it
- Make sure you have at least one Polkadot account created
- Refresh the page if connection fails
- Check that Talisman is enabled in your browser extensions


## Creating Time-Locked Messages

### Step 1: Navigate to Create Message

1. Click "Create Message" in the navigation menu
2. You'll see the message creation interface

### Step 2: Choose Your Media

You have two options:

**Option A: Record a Message**
1. Click the "Record" tab
2. Choose "Audio Only" or "Video"
3. Click "Start Recording"
4. Allow camera/microphone access when prompted
5. Record your message
6. Click "Stop Recording" when done
7. Preview your recording

**Option B: Upload a File**
1. Click the "Upload" tab
2. Drag and drop a file, or click to browse
3. Select an audio or video file
4. Supported formats: MP3, WAV, OGG, MP4, WEBM, MOV
5. Maximum size: 100MB (larger files may be slow)
6. Preview your file

**Note for iOS Safari Users:**
- Recording may not work on older iOS versions
- Use the upload option instead
- Record on another device and transfer the file

### Step 3: Set Recipient and Unlock Time

1. **Enter Recipient Address**
   - Paste the recipient's Polkadot address
   - Format: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`
   - Double-check the address is correct!

2. **Set Unlock Date and Time**
   - Click the date/time picker
   - Choose when the message should unlock
   - Must be in the future
   - Consider time zones if sending internationally

3. **Add a Note (Optional)**
   - Add context about the message
   - This note is NOT encrypted
   - Keep it general (no sensitive info)

### Step 4: Review and Send

1. Review your message details:
   - Recipient address
   - Unlock date and time
   - Media file size and type

2. Click "Send Message"

3. **Encryption Process** (automatic):
   - Your browser generates a unique encryption key
   - Media is encrypted locally (never sent unencrypted)
   - Encryption key is encrypted with recipient's public key
   - Both are uploaded to IPFS
   - Metadata is stored on blockchain

4. **Sign the Transaction**:
   - Talisman will pop up
   - Review the transaction details
   - Click "Sign" to confirm
   - Wait for blockchain confirmation (10-30 seconds)

5. **Success!**
   - You'll see a confirmation message
   - The message appears in your "Sent Messages"
   - Recipient will see it in their "Received Messages"

**What Happens Behind the Scenes:**
1. ✅ Media encrypted with AES-256 in your browser
2. ✅ Encrypted media uploaded to IPFS
3. ✅ Encryption key encrypted with recipient's public key
4. ✅ Encrypted key uploaded to IPFS
5. ✅ Metadata stored on Polkadot blockchain
6. ✅ Original media and keys cleared from memory


## Viewing Your Messages

### Dashboard Overview

The Dashboard shows all your messages in two tabs:

1. **Sent Messages**: Messages you've created and sent
2. **Received Messages**: Messages sent to you

### Sent Messages Tab

View all messages you've sent:

**Message Card Information:**
- 👤 **Recipient**: Who will receive the message
- 📅 **Unlock Date**: When the message becomes viewable
- 🔒 **Status**: Current state of the message
  - **Locked**: Unlock time hasn't arrived yet
  - **Unlockable**: Recipient can now view it
- 📊 **File Info**: Size and type of media
- 🔗 **CIDs**: IPFS identifiers (for backup)

**Actions:**
- Click "View Details" to see full information
- Copy CIDs for backup purposes
- Share claim link (if created for non-wallet recipient)

### Received Messages Tab

View all messages sent to you:

**Message Card Information:**
- 👤 **Sender**: Who sent the message
- 📅 **Unlock Date**: When you can view it
- 🔒 **Status**: Current state
  - **Locked**: Can't view yet (countdown shown)
  - **Unlockable**: Ready to unlock and view
  - **Unlocked**: You've already viewed it
- 📊 **File Info**: Size and type of media

**Actions:**
- Click "Unlock" when status is "Unlockable"
- View countdown timer for locked messages
- Re-watch unlocked messages anytime

### Filtering and Sorting

**Filter by Status:**
- All Messages
- Locked Only
- Unlockable Only
- Unlocked Only

**Sort Options:**
- Newest First
- Oldest First
- Unlock Date (Soonest)
- Unlock Date (Latest)

### Real-Time Updates

The dashboard automatically updates:
- Status changes when unlock time arrives
- Countdown timers tick down
- New messages appear automatically
- No need to refresh the page


## Unlocking and Playing Messages

### When Can I Unlock a Message?

You can unlock a message when:
- ✅ The unlock timestamp has passed
- ✅ You're connected with the recipient wallet
- ✅ The message status shows "Unlockable"

You CANNOT unlock if:
- ❌ The unlock time hasn't arrived yet
- ❌ You're not the intended recipient
- ❌ You're using a different wallet

### Step 1: Navigate to the Message

1. Go to Dashboard > Received Messages
2. Find the message with "Unlockable" status
3. Click "Unlock" button

### Step 2: Verify and Decrypt

**Automatic Process:**
1. Lockdrop verifies the unlock timestamp
2. Downloads encrypted key from IPFS
3. Talisman decrypts the key using your private key
4. Downloads encrypted media from IPFS
5. Verifies data integrity (hash check)
6. Decrypts media in your browser
7. Creates a secure playback URL

**What You'll See:**
- Progress indicator during download
- "Decrypting..." message
- Media player when ready

### Step 3: Play the Message

**Media Player Controls:**
- ▶️ Play/Pause button
- 🔊 Volume control
- ⏩ Seek bar (scrub through video/audio)
- ⏱️ Duration and current time
- 🖥️ Fullscreen (for videos)

**Privacy Features:**
- Media stays in browser memory only
- Not saved to disk or cache
- Secure playback URL (can't be shared)
- Automatically cleared when you close the player

### Step 4: Close the Player

When you're done:
1. Click "Close" or the X button
2. Media is cleared from memory
3. Playback URL is revoked
4. Message status changes to "Unlocked"

**Can I Watch Again?**
- Yes! Click "Unlock" again anytime
- The decryption process repeats
- Your private key is always required

### Troubleshooting Unlock Issues

**"Timestamp not reached"**
- Wait until the unlock time arrives
- Check the countdown timer
- Ensure your system clock is correct

**"Decryption failed"**
- Make sure you're using the correct wallet
- Verify you're the intended recipient
- Check that Talisman is unlocked
- Try disconnecting and reconnecting wallet

**"Download failed"**
- Check your internet connection
- Wait a moment and try again
- IPFS nodes may be temporarily unavailable
- Contact sender to verify CIDs are correct

**"Hash verification failed"**
- The encrypted data may be corrupted
- Contact the sender
- They may need to resend the message


## Privacy Features

### What Makes Lockdrop Private?

Lockdrop is designed with privacy as the foundation. Here's how your data is protected:

### 1. Client-Side Encryption

**What it means:**
- All encryption happens in YOUR browser
- Your media never leaves your device unencrypted
- No server ever sees your plaintext content

**How it works:**
- Browser generates a unique AES-256 key for each message
- Media is encrypted before upload
- Only the recipient's private key can decrypt it

**What you see:**
- "Encrypting..." progress indicator
- Confirmation that encryption completed
- No plaintext data in network requests

### 2. Decentralized Storage

**What it means:**
- Your encrypted content is stored on IPFS
- Distributed across multiple nodes worldwide
- No single company controls your data

**How it works:**
- Encrypted files uploaded to Web3.Storage
- Automatically pinned to IPFS network
- Content-addressed (CID) for integrity

**Benefits:**
- Resilient to server failures
- Censorship-resistant
- Permanent storage option

### 3. Blockchain-Enforced Time-Locks

**What it means:**
- Unlock times are enforced by Polkadot blockchain
- No one can override the timestamp
- Decentralized consensus guarantees fairness

**How it works:**
- Metadata stored on-chain (CIDs, timestamp, addresses)
- Smart contract verifies unlock conditions
- Recipients can't decrypt before timestamp

**Benefits:**
- Trustless enforcement
- Transparent and verifiable
- Immutable once set

### 4. Zero-Knowledge Design

**What Lockdrop NEVER sees:**
- Your unencrypted media
- Your encryption keys
- Your private keys (always in Talisman)
- Your decrypted content

**What IS visible:**
- Encrypted blobs (meaningless without keys)
- IPFS CIDs (public identifiers)
- Blockchain metadata (addresses, timestamps)
- Transaction hashes

### 5. Memory Safety

**Automatic protections:**
- Decrypted content only in browser memory
- Never written to disk or cache
- Object URLs revoked after playback
- Sensitive data cleared after operations

**What this prevents:**
- Content leaking to disk
- Browser cache exposure
- Memory dumps containing plaintext
- Unauthorized access after playback

### Privacy Best Practices

✅ **DO:**
- Back up your wallet seed phrase securely
- Verify recipient addresses before sending
- Use strong, unique passphrases for redeem packages
- Keep your Talisman wallet locked when not in use
- Review transaction details before signing

❌ **DON'T:**
- Share your seed phrase with anyone
- Store seed phrases digitally or in the cloud
- Use the same passphrase for multiple redeem packages
- Leave your wallet unlocked on shared computers
- Trust screenshots or copies of decrypted content

### What Data is Public?

**Public Information:**
- Sender and recipient addresses (on blockchain)
- Unlock timestamps (on blockchain)
- IPFS CIDs (content identifiers)
- Transaction hashes
- Message metadata (file size, type)

**Private Information:**
- Media content (encrypted)
- Encryption keys (encrypted with recipient's public key)
- Decrypted content (only in recipient's browser)

### Verifying Privacy

You can verify Lockdrop's privacy claims:

1. **Open Source Code**: Review on GitHub
2. **Network Inspector**: Check browser DevTools
3. **IPFS Content**: Try downloading CIDs (you'll get encrypted data)
4. **Blockchain Explorer**: View on-chain metadata
5. **Security Audit**: Review audit reports (if available)


## Key Backup

### Why Backup is Critical

**⚠️ IMPORTANT: If you lose your wallet seed phrase, you CANNOT recover your account or decrypt received messages!**

There is NO password recovery, NO account restoration, and NO customer support that can help you. Your seed phrase is the ONLY way to access your private keys.

### What is a Seed Phrase?

A seed phrase (also called recovery phrase or mnemonic) is:
- 12 or 24 words generated when you create a wallet
- The master key to all your accounts
- Used to restore your wallet on any device
- The ONLY way to recover if you lose access

**Example seed phrase:**
```
witch collapse practice feed shame open despair creek road again ice least
```

### How to Back Up Your Seed Phrase

#### Step 1: Find Your Seed Phrase

1. Open Talisman wallet
2. Click Settings (gear icon)
3. Select "Accounts"
4. Click on your account
5. Click "Show Seed Phrase"
6. Enter your wallet password
7. Your seed phrase will be displayed

#### Step 2: Write It Down

**Best Practice: Paper Backup**
1. Get a piece of paper and pen
2. Write down all words in order
3. Number each word (1-12 or 1-24)
4. Double-check spelling
5. Verify the order is correct

**Alternative: Metal Backup**
- Use a metal seed phrase backup device
- Resistant to fire, water, and corrosion
- Available from crypto hardware vendors

#### Step 3: Store It Securely

**Good Storage Options:**
- ✅ Fireproof safe at home
- ✅ Safety deposit box at bank
- ✅ Multiple paper copies in different secure locations
- ✅ Metal backup in secure location

**BAD Storage Options:**
- ❌ Digital file on computer
- ❌ Cloud storage (Google Drive, Dropbox, etc.)
- ❌ Email or messaging apps
- ❌ Screenshots or photos
- ❌ Password managers (debatable, but risky)
- ❌ Anywhere online

#### Step 4: Test Your Backup

1. Create a new wallet in Talisman (or use a different device)
2. Choose "Import Account"
3. Enter your seed phrase
4. Verify you can access your account
5. Delete the test wallet (keep your original)

### What to Backup

**Essential:**
- ✅ Wallet seed phrase (12-24 words)
- ✅ Wallet password (if you might forget it)

**Recommended:**
- ✅ Polkadot addresses (for reference)
- ✅ Important message CIDs (for re-pinning)
- ✅ Redeem package passphrases (if you created any)

**Not Necessary:**
- ❌ Transaction hashes (on blockchain forever)
- ❌ Public keys (derived from seed phrase)
- ❌ Encrypted content (on IPFS)

### Security Tips

1. **Never Share Your Seed Phrase**
   - Not with support staff
   - Not with friends or family
   - Not with anyone, ever

2. **Beware of Phishing**
   - Lockdrop will never ask for your seed phrase
   - Talisman will never ask for it outside the wallet
   - No legitimate service needs your seed phrase

3. **Use a Strong Wallet Password**
   - Different from other passwords
   - At least 12 characters
   - Mix of letters, numbers, symbols
   - Don't reuse passwords

4. **Consider Multiple Accounts**
   - One for high-value assets
   - One for testing and daily use
   - Separate seed phrases for each

5. **Plan for Inheritance**
   - Consider how loved ones will access your accounts
   - Store seed phrase with estate planning documents
   - Provide instructions for recovery

### If You Lose Your Seed Phrase

**Before it's too late:**
- Create a new wallet immediately
- Transfer any assets to the new wallet
- Update recipient addresses for future messages
- Inform senders of your new address

**After it's lost:**
- You cannot recover the account
- You cannot decrypt received messages
- You cannot access any assets
- You must start over with a new wallet

### Backup Checklist

- [ ] Seed phrase written down on paper
- [ ] Spelling and order verified
- [ ] Stored in secure location
- [ ] Backup tested by importing to new wallet
- [ ] Multiple copies in different locations (optional)
- [ ] Inheritance plan in place (optional)
- [ ] Never stored digitally or online

**Remember: Your seed phrase is your responsibility. Lockdrop cannot help you recover it!**


## FAQ

### General Questions

**Q: What is Lockdrop?**  
A: Lockdrop is a decentralized application for creating time-locked audio/video messages. Messages are encrypted in your browser, stored on IPFS, and unlock times are enforced by the Polkadot blockchain.

**Q: Is Lockdrop free to use?**  
A: The application is free, but you need Westend testnet tokens (WND) to send messages. These are free from the faucet. For mainnet deployment, you'd need real DOT tokens.

**Q: Do I need to create an account?**  
A: No traditional account needed. You just connect your Talisman wallet, which serves as your identity.

**Q: Can I use FutureProof on mobile?**  
A: The web app works on mobile browsers, but Talisman wallet is currently desktop-only. Mobile wallet support is planned for the future.

**Q: Is my data really private?**  
A: Yes! All encryption happens in your browser. Your plaintext content never leaves your device. Only encrypted data is uploaded to IPFS.

---

### Wallet Questions

**Q: Why do I need a wallet?**  
A: The wallet provides your identity on the blockchain and holds your private keys for decryption. It's like your digital ID and key ring combined.

**Q: Can I use a different wallet besides Talisman?**  
A: Currently, FutureProof only supports Talisman. Support for other Polkadot wallets may be added in the future.

**Q: What if I lose access to my wallet?**  
A: If you have your seed phrase, you can restore your wallet on any device. Without it, you cannot recover your account or decrypt messages.

**Q: Can I use the same wallet on multiple devices?**  
A: Yes! Import your seed phrase into Talisman on each device. Your messages will be accessible from any device with your wallet.

**Q: Do I need a different wallet for testnet and mainnet?**  
A: You can use the same wallet, but make sure you're connected to the correct network in Talisman.

---

### Message Questions

**Q: How long can my message be?**  
A: Maximum file size is 100MB. Larger files may be slow to encrypt and upload.

**Q: What file formats are supported?**  
A: Audio: MP3, WAV, OGG. Video: MP4, WEBM, MOV.

**Q: Can I send text messages?**  
A: Currently, only audio/video is supported. Text message support may be added in the future.

**Q: Can I cancel a message after sending?**  
A: No. Once a message is sent and confirmed on the blockchain, it cannot be cancelled or deleted. The recipient will be able to unlock it at the specified time.

**Q: Can I change the unlock time after sending?**  
A: No. The unlock timestamp is immutable once stored on the blockchain.

**Q: What happens if the recipient never unlocks the message?**  
A: The message remains on IPFS and the metadata stays on the blockchain. It can be unlocked anytime after the unlock timestamp.

**Q: Can I send to multiple recipients?**  
A: Currently, each message can only have one recipient. To send to multiple people, create separate messages for each.

**Q: How do I know if my message was delivered?**  
A: Once the transaction is confirmed on the blockchain, the message is "delivered." The recipient will see it in their dashboard.

---

### Unlock Questions

**Q: Can I unlock a message before the timestamp?**  
A: No. The blockchain enforces the timestamp. Even with the encrypted key, you cannot decrypt until the time arrives.

**Q: What if I'm the sender—can I view my own message?**  
A: No. Messages are encrypted with the recipient's public key. Only the recipient's private key can decrypt them.

**Q: Can I download the decrypted message?**  
A: No. For security, decrypted content only exists in browser memory during playback. It's automatically cleared when you close the player.

**Q: How many times can I watch an unlocked message?**  
A: Unlimited! You can unlock and watch the message as many times as you want.

**Q: What if IPFS goes down?**  
A: IPFS is decentralized and distributed. Content is stored on multiple nodes. If one node is down, others can serve the content.

---

### Technical Questions

**Q: What encryption does Lockdrop use?**  
A: AES-256-GCM for content encryption and RSA-OAEP (or X25519 ECDH) for key encryption. These are industry-standard, battle-tested algorithms.

**Q: Where is my data stored?**  
A: Encrypted content is stored on IPFS (via Web3.Storage). Metadata is stored on the Polkadot blockchain. Nothing is stored on centralized servers.

**Q: Can Lockdrop see my messages?**  
A: No. Lockdrop is a client-side application. All encryption happens in your browser. We never see your plaintext content or encryption keys.

**Q: What is IPFS?**  
A: InterPlanetary File System—a decentralized storage network. Files are distributed across many nodes and addressed by content hash (CID).

**Q: What is a CID?**  
A: Content Identifier—a unique hash that identifies your encrypted file on IPFS. It's like a fingerprint for your data.

**Q: Is the blockchain public?**  
A: Yes. Transaction data (addresses, timestamps, CIDs) is public on the Polkadot blockchain. However, the actual content is encrypted and private.

**Q: What happens if Web3.Storage shuts down?**  
A: Your content is on IPFS, not just Web3.Storage. You can re-pin it to other IPFS services (Pinata, Arweave, etc.) using the CID.

---

### Troubleshooting Questions

**Q: Why can't I record video on my iPhone?**  
A: iOS Safari has limited MediaRecorder support. Use the upload option instead—record on another device and upload the file.

**Q: Why is my upload failing?**  
A: Check your internet connection. Large files may timeout. Try a smaller file first. If Web3.Storage fails, the app will automatically try Pinata.

**Q: Why did my transaction fail?**  
A: Common reasons: insufficient WND tokens, network congestion, or incorrect recipient address. Get more tokens from the faucet and try again.

**Q: The app says "Talisman not found"**  
A: Install the Talisman browser extension from talisman.xyz. Make sure it's enabled in your browser extensions.

**Q: My message status isn't updating**  
A: Refresh the page. The dashboard should auto-update, but a manual refresh can help if there's a connection issue.

**Q: I can't decrypt a message**  
A: Make sure you're using the correct wallet (the recipient address). Verify the unlock timestamp has passed. Check that Talisman is unlocked.

---

### Security Questions

**Q: Can someone hack my messages?**  
A: Your messages are protected by AES-256 encryption, which is virtually unbreakable with current technology. The weak point is your private key—keep your seed phrase safe!

**Q: What if someone steals my seed phrase?**  
A: They can access your wallet and decrypt your messages. Treat your seed phrase like cash—never share it and store it securely.

**Q: Can the government access my messages?**  
A: Not without your private key. The encryption is end-to-end. Even if they seize servers, they only get encrypted data.

**Q: Is Lockdrop audited?**  
A: The code is open source on GitHub for community review. Professional security audits may be conducted in the future.

**Q: Can I trust Lockdrop?**  
A: You don't have to trust us—you can verify! The code is open source, encryption happens client-side, and the blockchain is transparent.

---

### Future Features

**Q: Will there be a mobile app?**  
A: Possibly! A React Native mobile app is on the roadmap.

**Q: Will you support other blockchains?**  
A: Multi-chain support via XCM (Cross-Consensus Messaging) is planned for the future.

**Q: Can I send messages to email addresses?**  
A: Not currently. Recipients need a Polkadot wallet. However, you can create a redeem package with a passphrase for non-wallet users.

**Q: Will there be group messages?**  
A: Group messaging is a planned feature for future releases.

**Q: Can I schedule recurring messages?**  
A: Not yet, but message scheduling is on the roadmap.

---

### Getting Help

**Q: Where can I get support?**  
A: Check this user guide first. For technical issues, visit our GitHub repository or join the community Discord/Matrix.

**Q: How do I report a bug?**  
A: Open an issue on our GitHub repository with details about the problem, steps to reproduce, and your browser/OS information.

**Q: Can I contribute to Lockdrop?**  
A: Yes! Lockdrop is open source. Check the GitHub repository for contribution guidelines.

**Q: Where can I learn more?**  
A: Visit our documentation:
- User Guide (this document)
- Developer Guide (for technical details)
- Design Document (architecture and decisions)
- Requirements Document (specifications)

---

**Still have questions? Join our community or open an issue on GitHub!**

---

## Quick Reference

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ⚠️ Safari 14+ (limited recording support)

### Supported File Formats
- **Audio**: MP3, WAV, OGG
- **Video**: MP4, WEBM, MOV
- **Max Size**: 100MB

### Important Links
- **Talisman Wallet**: https://talisman.xyz/
- **Westend Faucet**: https://faucet.polkadot.io/westend
- **GitHub Repository**: [Your repo URL]
- **Documentation**: [Your docs URL]

### Message Status Guide
- 🔒 **Locked**: Unlock time hasn't arrived
- 🔓 **Unlockable**: Ready to decrypt and view
- ✅ **Unlocked**: Already viewed (can view again)

---

**Thank you for using Lockdrop! Your privacy is guaranteed by math, not corporations.**
