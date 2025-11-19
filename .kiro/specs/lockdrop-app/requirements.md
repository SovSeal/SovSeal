# Requirements Document

## Introduction

FutureProof is a decentralized time-capsule application that enables users to record or upload audio/video messages, encrypt them locally in the browser, store them on IPFS via Web3.Storage, and anchor unlock metadata on the Polkadot testnet (Westend). The application guarantees privacy through client-side encryption and timestamp-enforced unlocking, ensuring no plaintext media or encryption keys leave the user's browser or rely on centralized servers.
Note: The design anticipates future cross-chain expansion to other Polkadot parachains via XCM (Cross-Consensus Messaging). This ensures FutureProof can evolve to support multiple networks while maintaining full interoperability and decentralization.


## Glossary

- **Lockdrop_App**: The Next.js web application that provides the user interface and orchestrates all client-side operations
- **Talisman_Wallet**: A browser extension wallet for the Polkadot ecosystem that manages user authentication and transaction signing.
- **Message**: An audio or video recording or uploaded file that a user wants to time-lock
- **Encrypted_Blob**: The AES-encrypted binary data of a Message stored on IPFS
- **IPFS_CID**: Content Identifier, a unique hash that references the Encrypted_Blob on the InterPlanetary File System
- **Web3_Storage**: A decentralized storage service that pins content to IPFS
- **Polkadot_Contract**: A smart contract deployed on Westend testnet (or alternative Polkadot testnet) that stores message metadata
- **Unlock_Timestamp**: A Unix timestamp that defines when a Message becomes decryptable
- **AES_Key**: A unique 256-bit Advanced Encryption Standard key generated per Message for client-side encryption
- **Dashboard**: The user interface displaying Sent and Received messages with their current status
- **Message_Status**: The current state of a Message (Locked, Unlockable, or Unlocked)

## Requirements

### Requirement 1

**User Story:** As a user, I want to connect my Talisman wallet to the application, so that I can authenticate and interact with the Polkadot blockchain

#### Acceptance Criteria

1. WHEN the user clicks the wallet connect button, THE Lockdrop_App SHALL initiate a connection request to the Talisman_Wallet extension
2. IF the Talisman_Wallet extension is not installed, THEN THE Lockdrop_App SHALL display an error message with installation instructions
3. WHEN the Talisman_Wallet connection is established, THE Lockdrop_App SHALL display the connected wallet address in the user interface
4. THE Lockdrop_App SHALL persist the wallet connection state across browser sessions until the user explicitly disconnects
5. WHEN the user clicks the disconnect button, THE Lockdrop_App SHALL terminate the Talisman_Wallet connection and clear the session state

### Requirement 2

**User Story:** As a user, I want to record audio or video messages directly in the browser, so that I can create time-locked content without uploading existing files

#### Acceptance Criteria

1. WHEN the user clicks the record button, THE Lockdrop_App SHALL request microphone and camera permissions from the browser
2. WHILE recording is active, THE Lockdrop_App SHALL display a visual indicator showing recording duration and active input devices
3. WHEN the user clicks the stop recording button, THE Lockdrop_App SHALL save the recorded media as a Blob in browser memory
4. THE Lockdrop_App SHALL support audio-only recording when the user selects audio mode
5. THE Lockdrop_App SHALL support video recording with audio when the user selects video mode

### Requirement 3

**User Story:** As a user, I want to upload existing audio or video files, so that I can time-lock content I already have

#### Acceptance Criteria

1. WHEN the user selects a file through the upload interface, THE Lockdrop_App SHALL validate that the file is an audio or video format
2. IF the uploaded file exceeds 100 MB, THEN THE Lockdrop_App SHALL display a warning message about file size
3. WHEN a valid file is selected, THE Lockdrop_App SHALL load the file into browser memory as a Blob
4. THE Lockdrop_App SHALL support common audio formats including MP3, WAV, and OGG
5. THE Lockdrop_App SHALL support common video formats including MP4, WEBM, and MOV

### Requirement 4

**User Story:** As a user, I want my messages encrypted locally in the browser before upload, so that my content remains private and no third party can access the plaintext

#### Acceptance Criteria

1. WHEN a Message is ready for encryption, THE Lockdrop_App SHALL generate a unique 256-bit AES_Key using the Web Crypto API
2. THE Lockdrop_App SHALL encrypt the Message Blob using AES-GCM mode with the generated AES_Key
3. THE Lockdrop_App SHALL create an Encrypted_Blob that contains the encrypted content and initialization vector
4. THE Lockdrop_App SHALL ensure that no plaintext Message data is transmitted outside the browser
5. THE Lockdrop_App SHALL store the AES_Key only in browser memory until encryption completes, and then immediately encrypt the key with the recipient’s public key before anchoring it on-chain.


### Requirement 5

**User Story:** As a user, I want encrypted messages uploaded to Storacha Network (IPFS), so that my content is stored on decentralized infrastructure without relying on centralized servers

#### Acceptance Criteria

1. WHEN an Encrypted_Blob is ready for upload, THE Lockdrop_App SHALL upload the blob to Web3_Storage via their API
2. WHEN the upload completes successfully, THE Lockdrop_App SHALL receive an IPFS_CID from Web3_Storage
3. IF the upload fails, THEN THE Lockdrop_App SHALL display an error message and allow the user to retry
4. THE Lockdrop_App SHALL display upload progress to the user during the upload operation
5. THE Lockdrop_App SHALL ensure that only the Encrypted_Blob is uploaded, never the plaintext Message or AES_Key

### Requirement 6

**User Story:** As a user, I want message metadata stored on the Polkadot testnet, so that unlock conditions are enforced by blockchain consensus rather than a centralized authority

#### Acceptance Criteria

1. WHEN a Message is encrypted and uploaded, THE Lockdrop_App SHALL submit a transaction to the Polkadot_Contract containing the IPFS_CID, Unlock_Timestamp, sender address, and recipient address
2. THE Lockdrop_App SHALL request the user to sign the transaction using their Palisman_Wallet
3. WHEN the transaction is confirmed on the blockchain, THE Lockdrop_App SHALL display a success confirmation to the user
4. IF the transaction fails, THEN THE Lockdrop_App SHALL display an error message with the failure reason
6. IF the recipient does not have a wallet address, THE Lockdrop_App SHALL generate a temporary public key and view-only link, allowing recipients to claim and decrypt later after wallet setup


### Requirement 7

**User Story:** As a user, I want to view a Dashboard of my sent messages, so that I can track the status of time-locked content I have created

#### Acceptance Criteria

1. WHEN the user navigates to the Sent Messages section, THE Lockdrop_App SHALL query the Polkadot_Contract for all messages where the sender address matches the connected wallet
2. THE Lockdrop_App SHALL display each sent Message with its recipient address, Unlock_Timestamp, and current Message_Status
3. WHEN the current time is before the Unlock_Timestamp, THE Lockdrop_App SHALL display the Message_Status as "Locked"
4. WHEN the current time is at or after the Unlock_Timestamp, THE Lockdrop_App SHALL display the Message_Status as "Unlockable"
5. THE Lockdrop_App SHALL update Message_Status values in real-time as timestamps are reached

### Requirement 8

**User Story:** As a user, I want to view a Dashboard of messages sent to me, so that I can see when time-locked content will become available

#### Acceptance Criteria

1. WHEN the user navigates to the Received Messages section, THE Lockdrop_App SHALL query the Polkadot_Contract for all messages where the recipient address matches the connected wallet
2. THE Lockdrop_App SHALL display each received Message with its sender address, Unlock_Timestamp, and current Message_Status
3. WHEN the current time is before the Unlock_Timestamp, THE Lockdrop_App SHALL display the Message_Status as "Locked"
4. WHEN the current time is at or after the Unlock_Timestamp and the message has not been decrypted, THE Lockdrop_App SHALL display the Message_Status as "Unlockable"
5. WHEN the user has successfully decrypted and viewed a Message, THE Lockdrop_App SHALL display the Message_Status as "Unlocked"

### Requirement 9

**User Story:** As a recipient, I want to unlock and decrypt messages only after the unlock timestamp has passed, so that the time-lock guarantee is enforced

#### Acceptance Criteria

1. WHEN the user clicks on an Unlockable Message, THE Lockdrop_App SHALL verify that the current time is at or after the Unlock_Timestamp
2. IF the current time is before the Unlock_Timestamp, THEN THE Lockdrop_App SHALL display an error message and prevent decryption
3. WHEN the timestamp verification passes, THE Lockdrop_App SHALL retrieve the encrypted AES_Key from the blockchain metadata
4. THE Lockdrop_App SHALL decrypt the AES_Key using the recipient's Palisman_Wallet private key
5. THE Lockdrop_App SHALL download the Encrypted_Blob from IPFS using the stored IPFS_CID

### Requirement 10

**User Story:** As a recipient, I want to decrypt and play unlocked messages in my browser, so that I can view the time-locked content privately

#### Acceptance Criteria

1. WHEN the Encrypted_Blob is downloaded, THE Lockdrop_App SHALL decrypt the blob using the recovered AES_Key and AES-GCM algorithm
2. WHEN decryption succeeds, THE Lockdrop_App SHALL create a playable media element in the browser with the decrypted content
3. THE Lockdrop_App SHALL provide standard media controls for playback including play, pause, volume, and seek
4. THE Lockdrop_App SHALL ensure that decrypted content remains only in browser memory and is never written to disk
5. WHEN the user closes the playback interface, THE Lockdrop_App SHALL clear the decrypted content from memory.
6. THE Lockdrop_App SHALL automatically revoke decrypted media URLs when playback ends, preventing reuse or download from browser cache.


### Requirement 11

**User Story:** As a user, I want the application to have a clean, modern UI with clear branding, so that I trust the application and understand its privacy guarantees

#### Acceptance Criteria

1. THE Lockdrop_App SHALL display a logo and the tagline "Guaranteed by math, not corporations" on the home page
2. THE Lockdrop_App SHALL use a consistent color scheme and typography throughout the interface
3. THE Lockdrop_App SHALL provide clear visual feedback for all user actions including loading states and success confirmations
4. THE Lockdrop_App SHALL be responsive and functional on desktop and mobile browsers
5. THE Lockdrop_App SHALL display helpful tooltips and explanations for key privacy features

### Requirement 12

**User Story:** As a developer or auditor, I want the application deployed to Vercel with source code on GitHub, so that I can verify the implementation and trust the privacy claims

#### Acceptance Criteria

1. THE Lockdrop_App SHALL be deployed to Vercel with a public URL
2. THE Lockdrop_App SHALL have its complete source code published in a public GitHub repository
3. THE repository SHALL include a README with setup instructions, architecture overview, and privacy guarantees
4. WHERE a Rust toolchain is unavailable, THE repository SHALL document the fallback approach using an existing Polkadot testnet contract
5. THE repository SHALL include instructions for deploying the Polkadot_Contract to Westend testnet or alternative testnet

### Requirement 13

**User Story:** As a user in an environment without Rust toolchain support, I want the application to use a predeployed contract, so that I can still use the application without local contract compilation

#### Acceptance Criteria

1. WHERE the development environment lacks a Rust toolchain, THE Lockdrop_App SHALL use an existing deployed Polkadot_Contract on a testnet
2. THE Lockdrop_App SHALL document the contract address and ABI for the fallback contract in the repository
3. THE Lockdrop_App SHALL provide identical functionality whether using a newly deployed or existing contract
4. THE repository documentation SHALL explain the fallback approach and how to verify the contract code
5. THE Lockdrop_App SHALL configure the contract address through environment variables for easy switching between contracts


## Non-Functional Requirements

1. THE Lockdrop_App SHALL prioritize privacy by ensuring no unencrypted media or keys leave the client browser.
2. THE Lockdrop_App SHALL use AES-256-GCM encryption with unique keys per message.
3. THE Lockdrop_App SHALL limit file size to 100 MB to ensure smooth client-side encryption and upload.
4. THE Lockdrop_App SHALL operate fully client-side for encryption/decryption, without backend plaintext processing.
5. THE Lockdrop_App SHALL use Web3.Storage’s free tier and pin content automatically to IPFS.
6. THE Lockdrop_App SHALL support Polkadot Westend as the default testnet, with environment variables to switch to other testnets.
7. THE Lockdrop_App SHALL aim for a lightweight, responsive frontend suitable for both desktop and mobile.
8. THE Lockdrop_App SHALL include a CI/CD pipeline on GitHub that automatically builds and deploys to Vercel.
