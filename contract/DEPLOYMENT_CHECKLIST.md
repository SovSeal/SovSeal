# Deployment Checklist - Passet Hub

## Pre-Deployment

- [ ] Contract compiled successfully (`forge build --use solc:0.8.20`)
- [ ] All tests passing (`forge test`)
- [ ] Wallet has PAS testnet tokens
- [ ] Private key added to `.env` file
- [ ] RPC endpoint verified: `https://testnet-passet-hub-eth-rpc.polkadot.io`

## Deployment Steps

### 1. Get Testnet Tokens

```bash
# Visit faucet
open https://faucet.polkadot.io/paseo

# Request tokens for your address
# Wait for confirmation
```

### 2. Set Environment Variables

```bash
cd contract
cat > .env << EOF
PRIVATE_KEY=your_private_key_without_0x_prefix
PASSET_HUB_RPC=wss://testnet-passet-hub.polkadot.io
EOF
```

### 3. Deploy Contract

```bash
forge create --resolc \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io \
  --private-key $PRIVATE_KEY \
  contracts/Lockdrop.sol:Lockdrop
```

### 4. Save Contract Address

```bash
# Copy the deployed address from output
# Example: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

## Post-Deployment

### 1. Update Frontend Configuration

```bash
# Edit .env.local in project root
NEXT_PUBLIC_CONTRACT_ADDRESS=<your_deployed_address>
NEXT_PUBLIC_RPC_ENDPOINT=wss://testnet-passet-hub.polkadot.io
NEXT_PUBLIC_NETWORK=passet-hub
```

### 2. Verify Deployment

```bash
# Check contract bytecode exists
cast code YOUR_CONTRACT_ADDRESS \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io

# Query message count
cast call YOUR_CONTRACT_ADDRESS \
  "getMessageCount()(uint256)" \
  --rpc-url https://testnet-passet-hub-eth-rpc.polkadot.io
```

### 3. Update Documentation

- [ ] Update `contract/DEPLOYMENT_RECORD.md` with new address
- [ ] Update `README.md` with deployment info
- [ ] Commit changes to git

### 4. Test Frontend Integration

- [ ] Connect wallet to Passet Hub
- [ ] Create a test message
- [ ] Query sent messages
- [ ] Query received messages
- [ ] Verify on block explorer

## Troubleshooting

### "Insufficient funds"

- Check wallet balance on Passet Hub
- Request more tokens from faucet
- Verify you're on correct network

### "Invalid network"

- Verify RPC endpoint in hardhat.config.js
- Check network connectivity
- Try alternative RPC if available

### "Nonce too high"

- Reset account in MetaMask/Talisman
- Clear transaction history
- Try again

### "Contract deployment failed"

- Check gas limits in hardhat.config.js
- Verify contract compiles without errors
- Check for sufficient balance

## Verification Commands

```bash
# Check contract exists
npx hardhat verify --network passetHub <CONTRACT_ADDRESS>

# Query message count
npx hardhat run scripts/query.js --network passetHub

# Test store message
npx hardhat run scripts/test-store.js --network passetHub
```

## Rollback Plan

If deployment fails:

1. Keep old Shibuya deployment active
2. Debug issues on local network first
3. Redeploy to Passet Hub when fixed
4. Update frontend only after successful deployment

## Success Criteria

- [ ] Contract deployed successfully
- [ ] Contract address saved
- [ ] Frontend updated with new address
- [ ] Wallet connects to Passet Hub
- [ ] Can store messages
- [ ] Can query messages
- [ ] Events are emitted correctly
- [ ] Documentation updated

## Next Steps After Deployment

1. Monitor contract for any issues
2. Test all user flows
3. Gather feedback from testers
4. Plan for mainnet deployment (Asset Hub)
5. Consider contract upgrades if needed

---

**Deployment Date:** **\*\***\_**\*\***  
**Contract Address:** **\*\***\_**\*\***  
**Deployer Address:** **\*\***\_**\*\***  
**Gas Used:** **\*\***\_**\*\***  
**Transaction Hash:** **\*\***\_**\*\***
