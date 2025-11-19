# Lockdrop Contract Deployment Record

## Latest Deployment

**Network:** Passet Hub Testnet (Polkadot)  
**Date:** November 15, 2025  
**RPC Endpoint (Substrate):** wss://testnet-passet-hub.polkadot.io  
**RPC Endpoint (Ethereum):** https://testnet-passet-hub-eth-rpc.polkadot.io

### Contract Details

- **Contract Address:** `0xeD0fDD2be363590800F86ec8562Dde951654668F`
- **Contract Type:** Solidity 0.8.20 (compiled to PolkaVM via pallet-revive)
- **Deployer Address:** `0x0A58494CD644f38219c388c032B5BfF62CC5Ea30`
- **Deployment Nonce:** 0
- **Block Explorer:** https://blockscout-passet-hub.parity-testnet.parity.io

### Verification

Check contract bytecode:
```bash
cast code 0xeD0fDD2be363590800F86ec8562Dde951654668F --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

**Result:** ✅ Contract deployed successfully (bytecode starts with `0x50564d` - PolkaVM)

### Explorer Links

- **BlockScout:** https://blockscout-passet-hub.parity-testnet.parity.io/address/0xeD0fDD2be363590800F86ec8562Dde951654668F
- **Polkadot.js Apps:** https://polkadot.js.org/apps/?rpc=wss://testnet-passet-hub.polkadot.io

### Contract Methods

#### Write Methods
- `store_message(encrypted_key_cid, encrypted_message_cid, message_hash, unlock_timestamp, recipient)`

#### Read Methods
- `get_message(message_id)`
- `get_sent_messages(sender)`
- `get_received_messages(recipient)`
- `get_message_count()`

### Frontend Configuration

Update `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xeD0fDD2be363590800F86ec8562Dde951654668F
NEXT_PUBLIC_RPC_ENDPOINT=https://testnet-passet-hub-eth-rpc.polkadot.io
NEXT_PUBLIC_NETWORK=passet-hub
```

### Network Information

- **Chain:** Passet Hub (Polkadot Asset Hub Testnet)
- **Token:** PAS (Paseo)
- **Decimals:** 12
- **Block Time:** ~6 seconds
- **Faucet:** https://faucet.polkadot.io/paseo

### How Contract Address Was Found

Since the transaction hash was not saved, the contract address was recovered using:
```bash
# Get deployer's transaction count
cast nonce 0x0A58494CD644f38219c388c032B5BfF62CC5Ea30 --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
# Result: 1 (meaning 1 transaction sent, nonce 0 was the deployment)

# Calculate contract address from deployer + nonce
cast compute-address 0x0A58494CD644f38219c388c032B5BfF62CC5Ea30 --nonce 0
# Result: 0xeD0fDD2be363590800F86ec8562Dde951654668F
```

### Status

- **Deployment:** ✅ Successful
- **Verification:** ✅ Passed
- **Frontend Integration:** ✅ Ready
- **Production Ready:** ⏭️ Testnet Only

---

*Last Updated: November 15, 2025*
