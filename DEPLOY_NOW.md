# 🚀 Ready to Deploy - Quick Start Guide

## Current Status

✅ Contract rewritten in Solidity  
✅ All tests passing (5/5)  
✅ Compiled successfully  
✅ Documentation complete  
✅ Ready for Passet Hub deployment  

## Deploy in 5 Steps

### Step 1: Get Testnet Tokens (5 minutes)

1. Visit the Paseo faucet: https://faucet.polkadot.io/paseo
2. Connect your Talisman wallet
3. Request PAS tokens
4. Wait for confirmation (usually instant)

### Step 2: Set Up Deployment Environment (2 minutes)

```bash
cd contract

# Create .env file with your private key
cat > .env << 'EOF'
PRIVATE_KEY=country agree license nephew waste route settle tilt screen always replace cargo
PASSET_HUB_RPC=wss://testnet-passet-hub.polkadot.io
EOF

# Make sure dependencies are installed
npm install
```

**⚠️ Security Note:** Never commit your `.env` file! It's already in `.gitignore`.

### Step 3: Deploy Contract (1 minute)

```bash
npx hardhat run scripts/deploy.js --network passetHub
```

You should see output like:
```
Deploying FutureProof contract...
Deploying with account: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Account balance: 10.0 tokens
FutureProof deployed to: 0xABCDEF1234567890...
Initial message count: 0

✅ Deployment successful!

Update your .env.local with:
NEXT_PUBLIC_CONTRACT_ADDRESS=0xABCDEF1234567890...
```

**📝 Copy the contract address!**

### Step 4: Update Frontend Configuration (1 minute)

Edit `.env.local` in the project root:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=<paste_your_deployed_address>
NEXT_PUBLIC_RPC_ENDPOINT=wss://testnet-passet-hub.polkadot.io
NEXT_PUBLIC_NETWORK=passet-hub
NEXT_PUBLIC_STORACHA_GATEWAY=storacha.link
```

### Step 5: Test the Deployment (2 minutes)

```bash
# Verify contract is working
npx hardhat console --network passetHub
```

In the console:
```javascript
const FutureProof = await ethers.getContractFactory("FutureProof");
const contract = FutureProof.attach("YOUR_CONTRACT_ADDRESS");
const count = await contract.getMessageCount();
console.log("Message count:", count.toString()); // Should be 0
```

Press `Ctrl+C` to exit.

## Verify Everything Works

### Test Frontend Integration

1. Start your dev server:
```bash
npm run dev
```

2. Open http://localhost:3000

3. Connect your wallet (should connect to Passet Hub)

4. Try creating a test message

5. Check if it appears in "Sent Messages"

## Troubleshooting

### "Insufficient funds"
- Go back to Step 1 and request more tokens
- Check you're on the correct network in your wallet

### "Network error"
- Verify RPC endpoint: `wss://testnet-passet-hub.polkadot.io`
- Check your internet connection
- Try again in a few minutes

### "Contract deployment failed"
- Check your private key is correct in `.env`
- Ensure you have enough PAS tokens
- Verify the contract compiles: `npx hardhat compile`

### "Cannot connect wallet"
- Make sure Talisman is installed
- Switch network to Paseo in Talisman
- Refresh the page

## What Changed from Before

| Before | After |
|--------|-------|
| ink! v5 (Rust) | Solidity 0.8.20 |
| Shibuya testnet | Passet Hub (Polkadot) |
| SS58 addresses | Ethereum addresses (0x...) |
| cargo-contract | Hardhat |
| Outside Polkadot | Inside Polkadot ecosystem ✅ |

## Next Steps After Deployment

1. **Document the deployment**
   - Update `contract/DEPLOYMENT_RECORD.md`
   - Save contract address
   - Note transaction hash

2. **Test all features**
   - Create messages
   - Query sent messages
   - Query received messages
   - Verify unlock timestamps

3. **Share with team**
   - Contract address
   - Network details
   - Testing instructions

4. **Monitor the contract**
   - Check for any errors
   - Gather user feedback
   - Plan improvements

## Important Files

- **Contract:** `contract/contracts/FutureProof.sol`
- **Tests:** `contract/test/FutureProof.test.js`
- **Deploy Script:** `contract/scripts/deploy.js`
- **Config:** `contract/hardhat.config.js`
- **Full Guide:** `contract/SOLIDITY_DEPLOYMENT_GUIDE.md`
- **Checklist:** `contract/DEPLOYMENT_CHECKLIST.md`

## Quick Commands Reference

```bash
# Compile contract
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Passet Hub
npx hardhat run scripts/deploy.js --network passetHub

# Open console
npx hardhat console --network passetHub

# Clean build artifacts
npx hardhat clean
```

## Support Resources

- **Paseo Faucet:** https://faucet.polkadot.io/paseo
- **Polkadot.js Apps:** https://polkadot.js.org/apps/?rpc=wss://testnet-passet-hub.polkadot.io
- **Hardhat Docs:** https://hardhat.org/docs
- **Polkadot Wiki:** https://wiki.polkadot.com/learn/learn-smart-contracts/

## Success Checklist

- [ ] Got PAS tokens from faucet
- [ ] Created `.env` file with private key
- [ ] Deployed contract successfully
- [ ] Copied contract address
- [ ] Updated `.env.local`
- [ ] Tested contract in console
- [ ] Frontend connects to wallet
- [ ] Can create test messages
- [ ] Messages appear in queries
- [ ] Documented deployment

---

**Ready?** Start with Step 1! 🚀

**Questions?** Check `contract/SOLIDITY_DEPLOYMENT_GUIDE.md` for detailed explanations.

**Issues?** See the Troubleshooting section above.
