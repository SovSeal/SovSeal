# Contract Service Module

This module provides the interface for interacting with the Polkadot smart contract that stores time-locked message metadata on the Westend testnet.

## Overview

The `ContractService` class handles:
- Connection to Polkadot RPC endpoints
- Submitting message metadata transactions
- Querying sent and received messages
- Transaction signing via Talisman wallet
- Error handling with retry logic

## Configuration

Set the following environment variables in `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=<your_contract_address>
NEXT_PUBLIC_RPC_ENDPOINT=wss://westend-rpc.polkadot.io
NEXT_PUBLIC_NETWORK=westend
```

## Usage

### Storing a Message

```typescript
import { ContractService } from '@/lib/contract';
import { useWallet } from '@/lib/wallet/WalletProvider';

const { selectedAccount } = useWallet();

const result = await ContractService.storeMessage(
  {
    encryptedKeyCID: 'Qm...',
    encryptedMessageCID: 'Qm...',
    messageHash: '0x...',
    unlockTimestamp: 1735689600000,
    recipient: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  },
  selectedAccount
);

if (result.success) {
  console.log('Message stored with ID:', result.messageId);
}
```

### Querying Sent Messages

```typescript
const messages = await ContractService.getSentMessages(senderAddress);

messages.forEach((msg) => {
  console.log(`Message ${msg.id} to ${msg.recipient}`);
  console.log(`Unlocks at: ${new Date(msg.unlockTimestamp)}`);
});
```

### Querying Received Messages

```typescript
const messages = await ContractService.getReceivedMessages(recipientAddress);

messages.forEach((msg) => {
  console.log(`Message ${msg.id} from ${msg.sender}`);
  console.log(`Unlocks at: ${new Date(msg.unlockTimestamp)}`);
});
```

## Error Handling

The service provides helpful error messages for common issues:

- **Insufficient funds**: Includes faucet links for getting testnet tokens
- **Connection errors**: Suggests checking network connectivity
- **Transaction cancelled**: Indicates user cancelled the transaction
- **Query failures**: Automatically retries with exponential backoff

## Current Implementation

**Note**: The current implementation uses `system.remark` extrinsics as a placeholder until the ink! smart contract is deployed. This allows the application to function while the contract is being developed.

Once the contract is deployed:
1. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` with the deployed contract address
2. Add the contract ABI to the project
3. Replace the placeholder transaction/query logic with actual contract calls

## Future Contract Integration

The service is designed to easily integrate with an ink! smart contract. The contract should implement:

```rust
#[ink(message)]
pub fn store_message(
    encrypted_key_cid: String,
    encrypted_message_cid: String,
    message_hash: String,
    unlock_timestamp: u64,
    recipient: AccountId,
) -> Result<MessageId>;

#[ink(message)]
pub fn get_sent_messages(sender: AccountId) -> Vec<MessageMetadata>;

#[ink(message)]
pub fn get_received_messages(recipient: AccountId) -> Vec<MessageMetadata>;
```

## Faucet Links

Get free Westend testnet tokens:
- https://faucet.polkadot.io/westend
- https://matrix.to/#/#westend_faucet:matrix.org

## Requirements

This module implements requirements:
- 6.2: Store message metadata on blockchain
- 6.3: Request transaction signing via Talisman
- 6.4: Handle transaction confirmation
- 6.5: Display success/error feedback
- 7.1: Query sent messages
- 8.1: Query received messages
- 13.5: Configure contract via environment variables
