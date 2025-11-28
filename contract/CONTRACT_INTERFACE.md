# Lockdrop Contract Interface

## Contract Address

**Passet Hub Testnet:** `<TO_BE_DEPLOYED>`

## ABI Location

After compilation, the ABI is available at:

- `contract/artifacts/contracts/FutureProof.sol/FutureProof.json`

## Function Signatures

### Write Functions

#### storeMessage

```solidity
function storeMessage(
    string calldata encryptedKeyCid,
    string calldata encryptedMessageCid,
    string calldata messageHash,
    uint64 unlockTimestamp,
    address recipient
) external returns (uint64 messageId)
```

**Parameters:**

- `encryptedKeyCid`: IPFS CID of encrypted AES key (non-empty string)
- `encryptedMessageCid`: IPFS CID of encrypted message (non-empty string)
- `messageHash`: SHA-256 hash (minimum 64 characters)
- `unlockTimestamp`: Unix timestamp (must be in future)
- `recipient`: Recipient address (cannot be sender)

**Returns:** Message ID (uint64)

**Emits:** `MessageStored(messageId, sender, recipient, unlockTimestamp)`

**Errors:**

- `InvalidKeyCID()` - Empty key CID
- `InvalidMessageCID()` - Empty message CID
- `InvalidMessageHash()` - Hash too short
- `InvalidTimestamp()` - Timestamp in past
- `SenderIsRecipient()` - Sender equals recipient

### Read Functions

#### getMessage

```solidity
function getMessage(uint64 messageId)
    external
    view
    returns (MessageMetadata memory)
```

**Parameters:**

- `messageId`: The message ID to query

**Returns:** MessageMetadata struct

**Errors:**

- `MessageNotFound()` - Message doesn't exist

#### getSentMessages

```solidity
function getSentMessages(address sender)
    external
    view
    returns (MessageMetadata[] memory)
```

**Parameters:**

- `sender`: Address to query sent messages for

**Returns:** Array of MessageMetadata

#### getReceivedMessages

```solidity
function getReceivedMessages(address recipient)
    external
    view
    returns (MessageMetadata[] memory)
```

**Parameters:**

- `recipient`: Address to query received messages for

**Returns:** Array of MessageMetadata

#### getMessageCount

```solidity
function getMessageCount()
    external
    view
    returns (uint64)
```

**Returns:** Total number of messages stored

## Data Structures

### MessageMetadata

```solidity
struct MessageMetadata {
    string encryptedKeyCid;      // IPFS CID of encrypted key
    string encryptedMessageCid;  // IPFS CID of encrypted message
    string messageHash;          // SHA-256 hash
    uint64 unlockTimestamp;      // Unix timestamp
    address sender;              // Sender address
    address recipient;           // Recipient address
    uint64 createdAt;            // Creation timestamp
}
```

## Events

### MessageStored

```solidity
event MessageStored(
    uint64 indexed messageId,
    address indexed sender,
    address indexed recipient,
    uint64 unlockTimestamp
)
```

**Emitted when:** A new message is stored

**Indexed fields:** messageId, sender, recipient (for efficient filtering)

## Usage Examples

### JavaScript/ethers.js

```javascript
import { ethers } from "ethers";
import FutureProofABI from "./FutureProof.abi.json";

// Connect to contract
const provider = new ethers.JsonRpcProvider(
  "https://testnet-passet-hub-eth-rpc.polkadot.io"
);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, FutureProofABI, signer);

// Store a message
const tx = await contract.storeMessage(
  "QmKeyABC123",
  "QmMessageXYZ789",
  "a".repeat(64), // 64-char hash
  Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
  recipientAddress
);
await tx.wait();

// Get message
const message = await contract.getMessage(0);
console.log(message.encryptedKeyCid);

// Get sent messages
const sentMessages = await contract.getSentMessages(senderAddress);
console.log(`Sent ${sentMessages.length} messages`);

// Listen for events
contract.on(
  "MessageStored",
  (messageId, sender, recipient, unlockTimestamp) => {
    console.log(`New message ${messageId} from ${sender} to ${recipient}`);
  }
);
```

### TypeScript Types

```typescript
interface MessageMetadata {
  encryptedKeyCid: string;
  encryptedMessageCid: string;
  messageHash: string;
  unlockTimestamp: bigint;
  sender: string;
  recipient: string;
  createdAt: bigint;
}

interface FutureProofContract {
  storeMessage(
    encryptedKeyCid: string,
    encryptedMessageCid: string,
    messageHash: string,
    unlockTimestamp: bigint,
    recipient: string
  ): Promise<bigint>;

  getMessage(messageId: bigint): Promise<MessageMetadata>;
  getSentMessages(sender: string): Promise<MessageMetadata[]>;
  getReceivedMessages(recipient: string): Promise<MessageMetadata[]>;
  getMessageCount(): Promise<bigint>;
}
```

## Gas Estimates

Approximate gas costs on Passet Hub:

| Function            | Gas Cost                |
| ------------------- | ----------------------- |
| storeMessage        | ~150,000                |
| getMessage          | ~30,000                 |
| getSentMessages     | ~50,000 + (n \* 20,000) |
| getReceivedMessages | ~50,000 + (n \* 20,000) |
| getMessageCount     | ~25,000                 |

_Note: Actual costs may vary based on data size and network conditions_

## Frontend Integration Checklist

- [ ] Copy ABI from `artifacts/contracts/FutureProof.sol/FutureProof.json`
- [ ] Update contract address in `.env.local`
- [ ] Initialize contract with ethers.js or web3.js
- [ ] Handle custom errors properly
- [ ] Listen for MessageStored events
- [ ] Convert timestamps (Solidity uses seconds, JS uses milliseconds)
- [ ] Handle BigInt for uint64 values
- [ ] Add loading states for transactions
- [ ] Show transaction confirmations

## Testing

```javascript
// Test in Hardhat console
const FutureProof = await ethers.getContractFactory("FutureProof");
const contract = FutureProof.attach("CONTRACT_ADDRESS");

// Store test message
const tx = await contract.storeMessage(
  "QmTest",
  "QmTest2",
  "a".repeat(64),
  Math.floor(Date.now() / 1000) + 3600,
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
);
await tx.wait();

// Verify
const count = await contract.getMessageCount();
console.log("Messages:", count.toString());
```

## Network Configuration

### Passet Hub Testnet

- **Ethereum RPC:** https://testnet-passet-hub-eth-rpc.polkadot.io
- **Substrate RPC:** wss://testnet-passet-hub.polkadot.io
- **Chain ID:** 420420421
- **Currency:** PAS
- **Block Time:** ~6 seconds
- **Faucet:** https://faucet.polkadot.io/paseo

**Note:** Use the Ethereum RPC for Solidity contract interactions.

## Security Notes

1. **Validate inputs client-side** before sending transactions
2. **Check unlock timestamps** are in the future
3. **Verify IPFS CIDs** are valid format
4. **Handle transaction failures** gracefully
5. **Never expose private keys** in frontend code
6. **Use environment variables** for contract addresses
7. **Implement proper error handling** for all custom errors

## Upgrade Path

This contract is **not upgradeable**. For future versions:

1. Deploy new contract
2. Update frontend configuration
3. Migrate data if needed
4. Keep old contract for historical data

## Support

- Contract Source: `contract/contracts/FutureProof.sol`
- Tests: `contract/test/FutureProof.test.js`
- Deployment Guide: `contract/DEPLOYMENT_GUIDE.md`
