# Lockdrop Contract Deployment Guide - Passet Hub

This guide walks you through deploying the Lockdrop Solidity smart contract to Passet Hub testnet via pallet-revive (PolkaVM).

## Prerequisites

Before deploying, ensure you have:

1. **Node.js 18+** and npm installed
2. **Foundry** (forge, cast) installed
3. **MetaMask or Talisman wallet** with **Ethereum account** (0x... format)
4. **Passet Hub testnet tokens** (PAS) - Get from [Paseo Faucet](https://faucet.polkadot.io/paseo)
5. **Private key** from your wallet (for deployment)

## Step 1: Install Foundry

### macOS/Linux

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Verify Installation

```bash
forge --version
cast --version
```

## Step 2: Set Up Environment

Navigate to the contract directory and create `.env` file:

```bash
cd contract
cat > .env << EOF
PRIVATE_KEY=your_private_key_without_0x_prefix
EOF
```

**⚠️ Security Warning:** Never commit `.env` to git. It's already in `.gitignore`.

## Step 3: Get Passet Hub Testnet Tokens

1. Install MetaMask or Talisman wallet
2. Create an **Ethereum account** (address starts with 0x)
   - MetaMask: All accounts are Ethereum by default
   - Talisman: Select "Ethereum" when creating account
3. Copy your Ethereum address
4. Visit https://faucet.polkadot.io/paseo
5. Request PAS tokens
6. Wait for confirmation (~1-2 minutes)

## Step 4: Build the Contract

```bash
# Compile with Solidity compiler targeting PolkaVM
forge build --use solc:0.8.20
```

This generates:
- `out/FutureProof.sol/FutureProof.json` - Compiled contract with ABI
- Contract bytecode ready for deployment

## Step 5: Deploy to Passet Hub

### Using Forge Create

```bash
forge create --resolc \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key $PRIVATE_KEY \
  contracts/FutureProof.sol:FutureProof
```

**Important:** Use the Ethereum-compatible RPC endpoint, not the WebSocket endpoint.

### Deployment Output

The command will output:
```
Deployer: 0x0A58494CD644f38219c388c032B5BfF62CC5Ea30
Deployed to: 0xeD0fDD2be363590800F86ec8562Dde951654668F
Transaction hash: 0x...
```

**Save the contract address!** You'll need it for the frontend configuration.

## Step 6: Verify Deployment

### Check Contract Bytecode

```bash
cast code 0xeD0fDD2be363590800F86ec8562Dde951654668F \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

Should return bytecode starting with `0x50564d` (PolkaVM signature).

### Check Deployer Nonce

```bash
cast nonce 0x0A58494CD644f38219c388c032B5BfF62CC5Ea30 \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

Should return `1` (or higher if you've made more transactions).

## Step 7: Update Application Configuration

Update `.env.local` in the project root:

```bash
cd ..
cat > .env.local << EOF
NEXT_PUBLIC_CONTRACT_ADDRESS=0xeD0fDD2be363590800F86ec8562Dde951654668F
NEXT_PUBLIC_RPC_ENDPOINT=https://testnet-passet-hub-eth-rpc.polkadot.io
NEXT_PUBLIC_NETWORK=passet-hub
NEXT_PUBLIC_STORACHA_GATEWAY=storacha.link
EOF
```

Replace the contract address with your actual deployed address.

## Step 8: Test Contract Functions

### Using Cast

```bash
# Get message count (should be 0 for new contract)
cast call 0xeD0fDD2be363590800F86ec8562Dde951654668F \
  "getMessageCount()(uint256)" \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

### Using the Application

1. Start your Next.js application:
```bash
npm run dev
```

2. Connect your wallet (MetaMask or Talisman)
3. Try creating a message
4. Verify the transaction on BlockScout

## Troubleshooting

### Build Errors

**Error: `forge` not found**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Error: Solidity version mismatch**
- Ensure you're using Solidity 0.8.20
- Check `foundry.toml` configuration

### Deployment Errors

**Error: Insufficient balance**
- Get more PAS tokens from https://faucet.polkadot.io/paseo
- Ensure you have at least 1 PAS for deployment

**Error: Invalid RPC endpoint**
- Use `https://testnet-passet-hub-eth-rpc.polkadot.io` (HTTP/HTTPS)
- Do NOT use `wss://testnet-passet-hub.polkadot.io` (WebSocket - Substrate RPC)

**Error: Transaction failed**
- Check network connectivity
- Verify you're using an Ethereum address (0x...)
- Try again after a few blocks

### Lost Contract Address?

If you forgot to save the contract address, you can recover it:

```bash
# Get your deployer address
cast wallet address --private-key $PRIVATE_KEY

# Get transaction count (nonce)
cast nonce YOUR_ADDRESS --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io

# Calculate contract address (nonce - 1 for deployment transaction)
cast compute-address YOUR_ADDRESS --nonce 0
```

## RPC Endpoints Reference

Passet Hub has TWO RPC endpoints:

1. **Ethereum RPC** (for Solidity contracts):
   - HTTPS: `https://testnet-passet-hub-eth-rpc.polkadot.io`
   - Use for: forge, cast, ethers.js, web3.js, MetaMask

2. **Substrate RPC** (for Substrate pallets):
   - WebSocket: `wss://testnet-passet-hub.polkadot.io`
   - Use for: Polkadot.js, substrate-api-sidecar

**For this project, always use the Ethereum RPC endpoint.**

## Explorer Links

- **BlockScout**: https://blockscout-passet-hub.parity-testnet.parity.io
- **Polkadot.js Apps**: https://polkadot.js.org/apps/?rpc=wss://testnet-passet-hub.polkadot.io

## Security Considerations

1. **Testnet Only**: This deployment is for Passet Hub testnet only
2. **No Real Value**: PAS tokens have no real-world value
3. **Public Data**: All contract data is public on the blockchain
4. **Immutable**: Contract code cannot be changed after deployment
5. **Private Keys**: Never share or commit private keys

## Production Deployment (Future)

For production deployment to Polkadot Asset Hub mainnet:

1. Audit the contract code thoroughly
2. Test extensively on testnet
3. Use a hardware wallet for deployment
4. Set up monitoring and alerting
5. Prepare incident response procedures
6. Document all deployment parameters
7. Have a rollback plan

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [pallet-revive Documentation](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/revive)
- [Paseo Faucet](https://faucet.polkadot.io/paseo)
- [BlockScout Explorer](https://blockscout-passet-hub.parity-testnet.parity.io)
- [Polkadot Wiki - Smart Contracts](https://wiki.polkadot.network/docs/build-smart-contracts)

## Contract Information Template

After deployment, document the following in `DEPLOYMENT_RECORD.md`:

```
Contract Address: 0xeD0fDD2be363590800F86ec8562Dde951654668F
Network: Passet Hub Testnet
Deployment Date: 2025-11-15
Deployer Address: 0x0A58494CD644f38219c388c032B5BfF62CC5Ea30
RPC Endpoint: https://testnet-passet-hub-eth-rpc.polkadot.io
Block Explorer: https://blockscout-passet-hub.parity-testnet.parity.io
```

Keep this information in a secure location for reference.
