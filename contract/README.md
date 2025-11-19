# Lockdrop Smart Contract

This directory contains the Solidity smart contract for the Lockdrop application, deployed to Passet Hub testnet via pallet-revive (PolkaVM).

## Overview

The Lockdrop smart contract stores metadata for time-locked encrypted messages on the Polkadot blockchain (Passet Hub testnet). It provides functionality to:

- Store message metadata (IPFS CIDs, unlock timestamps, sender/recipient info)
- Query messages sent by a specific address
- Query messages received by a specific address
- Retrieve individual message details

## Technology

- **Language**: Solidity 0.8.20
- **Network**: Passet Hub (Polkadot testnet)
- **VM**: PolkaVM via pallet-revive
- **Tooling**: Hardhat
- **Address Format**: Ethereum (0x...)

## Requirements Implemented

- **6.2**: Store message metadata on blockchain
- **7.1**: Query sent messages by sender address
- **8.1**: Query received messages by recipient address

## Contract Functions

### `store_message`

Stores a new message on the blockchain.

**Parameters:**

- `encrypted_key_cid`: IPFS CID of the encrypted AES key
- `encrypted_message_cid`: IPFS CID of the encrypted message blob
- `message_hash`: SHA-256 hash of the encrypted message (64 hex characters)
- `unlock_timestamp`: Unix timestamp when the message can be unlocked
- `recipient`: Address of the message recipient

**Returns:** Message ID (u64)

**Validations:**

- Encrypted key CID must not be empty
- Encrypted message CID must not be empty
- Message hash must be at least 64 characters (SHA-256)
- Unlock timestamp must be in the future
- Sender and recipient must be different addresses

### `get_sent_messages`

Retrieves all messages sent by a specific address.

**Parameters:**

- `sender`: Address of the sender

**Returns:** Vector of MessageMetadata

### `get_received_messages`

Retrieves all messages received by a specific address.

**Parameters:**

- `recipient`: Address of the recipient

**Returns:** Vector of MessageMetadata

### `get_message`

Retrieves a specific message by ID.

**Parameters:**

- `message_id`: The message ID

**Returns:** MessageMetadata or Error

### `get_message_count`

Returns the total number of messages stored.

**Returns:** u64

## Building the Contract

### Prerequisites

1. Install Node.js 18+ and npm
2. Install Foundry (forge, cast)
3. Install dependencies:

```bash
cd contract
npm install
```

### Build Commands

```bash
# Compile the contract with Foundry
forge build --use solc:0.8.20

# Run tests
forge test

# Deploy to Passet Hub testnet
forge create --resolc \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key $PRIVATE_KEY \
  contracts/FutureProof.sol:FutureProof
```

The build process generates:

- `out/FutureProof.sol/FutureProof.json` - Compiled contract with ABI
- `abi.json` - Extracted ABI for frontend integration

## Testing

Run the test suite:

```bash
forge test
```

## Deployment

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions to Passet Hub testnet.

## Contract Structure

```
MessageMetadata {
    encrypted_key_cid: String,      // IPFS CID for encrypted AES key
    encrypted_message_cid: String,  // IPFS CID for encrypted message
    message_hash: String,           // SHA-256 hash for integrity
    unlock_timestamp: u64,          // When message can be unlocked
    sender: AccountId,              // Message sender
    recipient: AccountId,           // Message recipient
    created_at: u64,                // Creation timestamp
}
```

## Events

### `MessageStored`

Emitted when a new message is stored.

**Fields:**

- `message_id`: The unique message ID
- `sender`: Address of the sender
- `recipient`: Address of the recipient
- `unlock_timestamp`: When the message can be unlocked

## Error Handling

The contract includes comprehensive error handling:

- `InvalidTimestamp`: Unlock timestamp is in the past
- `InvalidMessageHash`: Message hash is invalid (empty or too short)
- `InvalidKeyCID`: Encrypted key CID is empty
- `InvalidMessageCID`: Encrypted message CID is empty
- `SenderIsRecipient`: Sender and recipient are the same
- `MessageNotFound`: Message ID does not exist

## Security Considerations

1. **Access Control**: Only the sender can create messages for a specific recipient
2. **Validation**: All inputs are validated before storage
3. **Immutability**: Once stored, message metadata cannot be modified
4. **Timestamp Verification**: Unlock timestamps must be in the future
5. **Hash Integrity**: Message hashes ensure content integrity
