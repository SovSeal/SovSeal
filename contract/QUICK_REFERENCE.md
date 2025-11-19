# Lockdrop Contract Quick Reference

## Build & Deploy

```bash
# Build contract
cd contract
./deploy.sh

# Deploy via Polkadot.js Apps
# https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/contracts
```

## Contract Functions

### store_message (mutates)
Store a new time-locked message.

```rust
store_message(
    encrypted_key_cid: String,      // IPFS CID of encrypted AES key
    encrypted_message_cid: String,  // IPFS CID of encrypted message
    message_hash: String,           // SHA-256 hash (64+ chars)
    unlock_timestamp: u64,          // Future Unix timestamp
    recipient: AccountId            // Recipient address
) -> Result<u64>                    // Returns message ID
```

**Validations**:
- CIDs must not be empty
- Hash must be 64+ characters
- Timestamp must be in future
- Sender ≠ recipient

### get_sent_messages (read-only)
Get all messages sent by an address.

```rust
get_sent_messages(
    sender: AccountId
) -> Vec<MessageMetadata>
```

### get_received_messages (read-only)
Get all messages received by an address.

```rust
get_received_messages(
    recipient: AccountId
) -> Vec<MessageMetadata>
```

### get_message (read-only)
Get a specific message by ID.

```rust
get_message(
    message_id: u64
) -> Result<MessageMetadata>
```

### get_message_count (read-only)
Get total number of messages.

```rust
get_message_count() -> u64
```

## MessageMetadata Structure

```rust
{
    encrypted_key_cid: String,      // IPFS CID for key
    encrypted_message_cid: String,  // IPFS CID for message
    message_hash: String,           // SHA-256 hash
    unlock_timestamp: u64,          // Unlock time
    sender: AccountId,              // Sender address
    recipient: AccountId,           // Recipient address
    created_at: u64                 // Creation time
}
```

## Error Types

- `InvalidTimestamp` - Unlock time is in the past
- `InvalidMessageHash` - Hash is empty or too short
- `InvalidKeyCID` - Key CID is empty
- `InvalidMessageCID` - Message CID is empty
- `SenderIsRecipient` - Sender and recipient are the same
- `MessageNotFound` - Message ID doesn't exist

## Events

### MessageStored
Emitted when a message is stored.

```rust
{
    message_id: u64,        // Indexed
    sender: AccountId,      // Indexed
    recipient: AccountId,   // Indexed
    unlock_timestamp: u64
}
```

## Testing

```bash
# Run unit tests
cargo test

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture
```

## Files

- `lib.rs` - Contract source code
- `Cargo.toml` - Dependencies and configuration
- `abi.json` - Contract ABI for frontend
- `deploy.sh` - Build and deployment helper
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `README.md` - Full documentation

## Environment Variables

After deployment, update `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
NEXT_PUBLIC_RPC_ENDPOINT=wss://westend-rpc.polkadot.io
NEXT_PUBLIC_NETWORK=westend
```

## Useful Links

- [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/contracts)
- [Westend Faucet](https://faucet.polkadot.io/)
- [Subscan Explorer](https://westend.subscan.io/)
- [ink! Documentation](https://use.ink/)

## Common Commands

```bash
# Build contract
cargo contract build --release

# Run tests
cargo test

# Check contract size
ls -lh target/ink/futureproof_contract.wasm

# Clean build
cargo clean

# Update dependencies
cargo update
```

## Requirements Implemented

- **6.2**: Store message metadata on blockchain
- **7.1**: Query sent messages by sender address
- **8.1**: Query received messages by recipient address
- **12.5**: Contract deployment to Westend
- **13.1**: Contract documentation
