# Implementation Plan

## Overview

This implementation plan breaks down the Lockdrop application into discrete, manageable coding tasks. Each task builds incrementally on previous work, ensuring a systematic approach from project setup through final deployment.

## Task List

- [x] 1. Set up Next.js project structure and core dependencies
  - Initialize Next.js 14+ project with TypeScript and App Router
  - Install and configure Tailwind CSS for styling
  - Set up project folder structure (components, lib, hooks, types, utils)
  - Configure TypeScript with strict mode
  - Set up ESLint and Prettier
  - Create environment variable template (.env.example)
  - _Requirements: 11.2, 12.3_

- [x] 2. Implement Polkadot wallet integration
  - [x] 2.1 Create wallet connection service
    - Install @polkadot/extension-dapp and @polkadot/api packages
    - Implement WalletProvider React context
    - Create useWallet custom hook for wallet operations
    - Implement Talisman extension detection
    - Handle wallet connection and account selection
    - Implement wallet disconnection
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 2.2 Build wallet UI components
    - Create WalletConnectButton component
    - Create AccountSelector component
    - Display connected wallet address
    - Show installation instructions when extension not found
    - Implement connection state persistence in localStorage
    - Add key backup warning modal on first connection
    - _Requirements: 1.1, 1.2, 1.3, 14.1, 14.3_

- [x] 3. Create encryption and key management module
  - [x] 3.1 Implement core encryption service
    - Create CryptoService class using Web Crypto API
    - Implement AES-256-GCM key generation
    - Implement media blob encryption with IV generation
    - Implement media blob decryption
    - Add secure memory cleanup after operations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 3.2 Implement asymmetric key encryption
    - Implement public key retrieval from Talisman API
    - Add Ed25519/Sr25519 to X25519 key conversion using @polkadot/util-crypto
    - Implement AES key encryption with recipient's public key
    - Implement AES key decryption using Talisman wallet
    - Add SHA-256 hash generation for encrypted blobs
    - _Requirements: 4.5, 6.1, 6.1a, 9.4, 9.5_

- [x] 4. Build media capture and upload functionality
  - [x] 4.1 Implement media recording
    - Create MediaRecorder component with audio/video mode selection
    - Request microphone and camera permissions
    - Implement recording start/stop with MediaRecorder API
    - Display recording duration and active device indicators
    - Save recorded media as Blob in memory
    - Detect iOS Safari and show upload-only fallback
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.2 Implement file upload
    - Create MediaUploader component with drag-and-drop
    - Validate file types (MP3, WAV, OGG, MP4, WEBM, MOV)
    - Validate file size (warn if >100MB)
    - Load uploaded files as Blob in memory
    - Display file preview and metadata
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.3 Create media preview component
    - Build MediaPreview component for playback
    - Display media metadata (size, type, duration)
    - Add basic playback controls for preview
    - _Requirements: 3.3_

- [x] 5. Implement IPFS storage integration
  - [x] 5.1 Create Web3.Storage service
    - Install web3.storage SDK
    - Create IPFSService class
    - Implement encrypted blob upload to Web3.Storage
    - Add upload progress tracking
    - Implement chunked upload for files >50MB
    - Return IPFS CID on successful upload
    - Verify CID accessibility after upload (attempt retrieval)
    - _Requirements: 3.6, 5.1, 5.2, 5.4, 5.6_
  
  - [x] 5.2 Implement retry logic for storage uploads
    - Retry logic with exponential backoff
    - Surface upload state to user
    - _Requirements: 5.3_
  
  - [x] 5.3 Build upload progress UI
    - Create UploadProgress component
    - Display upload percentage and status
    - Show provider being used (Storacha)
    - Handle upload errors with retry option
    - _Requirements: 5.4_

- [x] 6. Develop smart contract interaction layer
  - [x] 6.1 Set up Polkadot.js API connection
    - Install @polkadot/api and related packages
    - Create ContractService class
    - Connect to Westend testnet RPC endpoint
    - Load contract ABI and address from environment variables
    - Implement connection error handling
    - _Requirements: 6.2, 13.5_
  
  - [x] 6.2 Implement contract write operations
    - Create storeMessage function to submit metadata
    - Build transaction with encryptedKeyCID, encryptedMessageCID, messageHash, unlockTimestamp, recipient
    - Request transaction signing via Talisman
    - Handle transaction confirmation
    - Display success confirmation to user
    - Show faucet guidance on transaction failure
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  
  - [x] 6.3 Implement contract read operations
    - Create getSentMessages query function
    - Create getReceivedMessages query function
    - Parse and format blockchain response data
    - Handle query errors with retry logic
    - _Requirements: 7.1, 8.1_

- [x] 7. Build message creation flow
  - [x] 7.1 Create message composition UI
    - Build CreateMessage page/component
    - Add recipient address input with validation
    - Add unlock timestamp picker (date/time)
    - Integrate media recording/upload components
    - Add message preview section
    - _Requirements: 2.1, 3.1, 6.2_
  
  - [x] 7.2 Implement end-to-end message creation
    - Orchestrate media capture/upload
    - Generate AES key and encrypt media blob
    - Calculate SHA-256 hash of encrypted blob
    - Retrieve recipient's public key
    - Encrypt AES key with recipient's public key
    - Upload encrypted AES key to IPFS
    - Upload encrypted media blob to IPFS
    - Submit transaction to smart contract
    - Display success/error feedback
    - Clear sensitive data from memory
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4_

- [x] 8. Implement dashboard for sent and received messages
  - [x] 8.1 Create dashboard layout
    - Build Dashboard page with tabs (Sent/Received)
    - Create MessageList component
    - Create MessageCard component with status badge
    - Implement responsive grid layout
    - _Requirements: 7.1, 7.2, 8.1, 8.2, 11.4_
  
  - [x] 8.2 Implement sent messages view
    - Query blockchain for sent messages
    - Display message cards with recipient, timestamp, status
    - Calculate status based on current time vs unlock timestamp
    - Implement real-time status updates
    - Add loading and error states
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 8.3 Implement received messages view
    - Query blockchain for received messages
    - Display message cards with sender, timestamp, status
    - Calculate status (Locked/Unlockable/Unlocked)
    - Track unlocked messages in localStorage
    - Implement real-time status updates
    - Add loading and error states
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 8.4 Add message filtering and sorting
    - Implement status filter (All/Locked/Unlockable/Unlocked)
    - Add date range filter
    - Implement sorting by timestamp
    - Add pagination for large message lists
    - _Requirements: 7.2, 8.2_

- [ ] 9. Build unlock and playback functionality
  - [x] 9.1 Create unlock flow UI
    - Build UnlockMessage page/component
    - Display message metadata (sender, timestamp)
    - Show countdown timer if still locked
    - Add unlock button (enabled when unlockable)
    - Display unlock progress
    - _Requirements: 9.1, 9.2_
  
  - [x] 9.2 Implement timestamp verification and decryption
    - Verify current time >= unlock timestamp
    - Prevent decryption if timestamp not reached
    - Retrieve encrypted AES key CID from blockchain
    - Download encrypted AES key from IPFS
    - Decrypt AES key using Talisman wallet
    - Download encrypted media blob from IPFS
    - Verify SHA-256 hash matches messageHash
    - Decrypt media blob using recovered AES key
    - Handle decryption errors
    - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 10.1_
  
  - [x] 9.3 Build secure media player
    - Create MediaPlayer component
    - Generate object URL from decrypted blob
    - Implement playback controls (play, pause, seek, volume)
    - Display playback progress and duration
    - Revoke object URL on close
    - Clear decrypted data from memory on close
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [x] 9.4 Add demo mode for simulated unlocks
    - Add DEMO_MODE environment variable check
    - Bypass timestamp verification in demo mode
    - Display "DEMO MODE" banner prominently
    - Ensure demo mode is disabled in production builds
    - _Requirements: 9.3_

- [ ] 10. Implement recipient-without-wallet flow
  - [x] 10.1 Create redeem package generator
    - Generate temporary keypair for encryption
    - Prompt sender for passphrase
    - Encrypt AES key with passphrase-derived key
    - Create redeem package JSON with encrypted key, CID, instructions, expiration
    - Encrypt redeem package
    - Upload encrypted package to IPFS
    - Generate claim link with package CID
    - Display claim link to sender
    - _Requirements: 6.6_
  
  - [x] 10.2 Build claim interface
    - Create ClaimMessage page accessible via claim link
    - Parse package CID from URL
    - Download encrypted redeem package from IPFS
    - Prompt recipient for passphrase
    - Decrypt redeem package
    - Display instructions for wallet setup
    - Allow import after wallet connection
    - _Requirements: 6.6_

- [ ] 11. Design and implement UI/UX
  - [x] 11.1 Create branding and layout
    - Design Lockdrop logo
    - Create homepage with logo and tagline "Guaranteed by math, not corporations"
    - Build navigation header with wallet connection
    - Create footer with links
    - Implement consistent color scheme and typography
    - _Requirements: 11.1, 11.2_
  
  - [x] 11.2 Add loading states and feedback
    - Create LoadingSpinner component
    - Add loading states for all async operations
    - Implement success/error toast notifications
    - Add confirmation dialogs for critical actions
    - _Requirements: 11.3_
  
  - [x] 11.3 Implement tooltips and help text
    - Add tooltips for privacy features
    - Create info icons with explanations
    - Add help text for wallet connection
    - Display key backup warnings
    - _Requirements: 11.5, 14.3, 14.4_
  
  - [x] 11.4 Ensure responsive design
    - Test and optimize for mobile screens
    - Ensure touch-friendly controls
    - Test on desktop browsers
    - Verify accessibility (keyboard navigation, screen readers)
    - _Requirements: 11.4_

- [ ] 12. Add error handling and edge cases
  - [x] 12.1 Implement comprehensive error handling
    - Add try-catch blocks for all async operations
    - Create error boundary components
    - Display user-friendly error messages
    - Add retry mechanisms for network errors
    - Log errors for debugging
    - _Requirements: All error scenarios from design_
  
  - [x] 12.2 Handle edge cases
    - Test with no wallet installed
    - Test with wallet locked
    - Test with network disconnection
    - Test with invalid recipient addresses
    - Test with corrupted IPFS data
    - Test with failed transactions
    - _Requirements: Various_

- [ ] 13. Create documentation
  - [x] 13.1 Write comprehensive README
    - Add project overview and tagline
    - Include architecture diagram
    - Document setup instructions
    - List environment variables
    - Add contract deployment guide
    - Include Westend faucet links and instructions
    - Explain privacy guarantees
    - Add key backup warnings section
    - Document fallback contract approach
    - Explain Web3.Storage free-tier limitations
    - List long-term storage options (paid Storacha, Arweave)
    - Document export procedure for encrypted CIDs
    - Add iOS Safari limitations
    - Document mobile wallet limitations
    - Include recommended key conversion libraries
    - Add redeem package expiry policies
    - _Requirements: 12.3, 12.6, 13.2, 13.4, 14.2, 14.5_
  
  - [x] 13.2 Create developer documentation
    - Document API reference for all modules
    - Include contract ABI documentation
    - Add encryption flow diagrams
    - Write testing guide
    - Create deployment guide
    - Add troubleshooting section
    - Document Ed25519/Sr25519 to X25519 conversion steps
    - _Requirements: 12.3_
  
  - [x] 13.3 Write user guide
    - Create "How to connect Talisman wallet" guide
    - Write "How to create time-locked messages" tutorial
    - Document "How to unlock and view messages" process
    - Explain key backup importance
    - List privacy features
    - Add FAQ section
    - _Requirements: 12.3_

- [x] 14. Set up deployment and CI/CD
  - [x] 14.1 Configure Vercel deployment
    - Create Vercel project
    - Configure environment variables in Vercel
    - Set up custom domain (optional)
    - Configure build settings
    - _Requirements: 12.1_
  
  - [x] 14.2 Create GitHub repository
    - Initialize Git repository
    - Create public GitHub repository
    - Push code to GitHub
    - Write clear commit messages
    - _Requirements: 12.2_
  
  - [x] 14.3 Set up CI/CD pipeline
    - Create GitHub Actions workflow
    - Add linting and type checking steps
    - Add build step
    - Configure automatic deployment to Vercel
    - Add preview deployments for PRs
    - _Requirements: 12.1_

- [ ] 15. Deploy smart contract
  - [x] 15.1 Write ink! smart contract
    - Create ink! contract project
    - Implement store_message function
    - Implement get_sent_messages query
    - Implement get_received_messages query
    - Add access control and validation
    - _Requirements: 6.2, 7.1, 8.1_
  
  - [x] 15.2 Deploy contract to Westend
    - Compile contract to WASM
    - Deploy to Westend testnet
    - Verify contract on blockchain explorer
    - Document contract address and ABI
    - _Requirements: 12.5, 13.1_
  

- [x] 16. Testing and quality assurance
  - [x] 16.1 Write unit tests
    - Test encryption/decryption functions
    - Test key generation and management
    - Test IPFS upload/download logic
    - Test contract interaction methods
    - Test timestamp validation
    - Test status calculation logic
    - _Requirements: Various_
  
  - [x] 16.2 Write integration tests
    - Test wallet connection flow
    - Test message creation end-to-end
    - Test message retrieval and decryption
    - Test dashboard data loading
    - Test unlock flow with timestamp verification
    - _Requirements: Various_
  
  - [x] 16.3 Perform manual testing
    - Test on Chrome, Firefox, Safari
    - Test Talisman wallet integration
    - Test media recording on different browsers
    - Test file upload with various formats
    - Test IPFS upload and retrieval
    - Test blockchain transaction submission
    - Test dashboard real-time updates
    - Test playback controls
    - Test demo mode
    - Test responsive design on mobile
    - _Requirements: Various_

- [ ] 17. Final polish and launch preparation
  - [ ] 17.1 Optimize performance
    - Analyze bundle size and optimize
    - Implement code splitting
    - Optimize images and assets
    - Test loading times
    - _Requirements: 11.2_
  
  - [ ] 17.2 Security audit
    - Verify no plaintext leakage
    - Confirm key cleanup after operations
    - Validate timestamp enforcement
    - Check object URL revocation
    - Review error messages for information disclosure
    - _Requirements: 4.4, 10.4, 10.5, 10.6_
  
  - [ ] 17.3 Final testing and bug fixes
    - Perform end-to-end testing of all features
    - Fix any remaining bugs
    - Test on production environment
    - Verify all documentation is accurate
    - _Requirements: All_
  
  - [ ] 17.4 Launch
    - Deploy to production
    - Announce on social media
    - Submit to hackathon
    - Monitor for issues
    - _Requirements: 12.1_

## Notes

- Each task references specific requirements from the requirements document
- Tasks should be completed in order as they build upon each other
- Environment variables should be configured before starting implementation
- Demo mode should be clearly labeled and disabled in production
