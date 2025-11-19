# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Lockdrop, please report it by emailing [your-email] or creating a private security advisory on GitHub.

**Please do not report security vulnerabilities through public GitHub issues.**

## Known Issues

### Development Dependencies

#### glob CLI Command Injection (GHSA-5j98-mcp5-4vw2)
- **Severity**: High (in theory), Low (in practice)
- **Status**: Acknowledged, monitoring for fix
- **Impact**: Dev dependency only (eslint-config-next → glob)
- **Risk Assessment**: Minimal
  - Only affects glob CLI tool (not library)
  - Not used directly in our codebase
  - Requires attacker control of CLI flags
  - Only present during development, not in production
- **Mitigation**: 
  - Vulnerability is in dev dependencies only
  - Production build does not include affected code
  - Waiting for Next.js team to update eslint-config-next
- **Tracking**: Will be resolved when Next.js updates their ESLint config dependencies

## Security Best Practices

### For Users

1. **Wallet Security**
   - Never share your wallet seed phrase
   - Back up your seed phrase securely offline
   - Use hardware wallets for large amounts

2. **Message Security**
   - Verify recipient addresses before sending
   - Use strong passphrases for redeem packages (12+ characters)
   - Share claim links and passphrases through different channels

3. **Browser Security**
   - Keep your browser updated
   - Only use trusted browser extensions
   - Clear browser cache after viewing sensitive messages

### For Developers

1. **Dependency Management**
   - Run `npm audit` regularly
   - Update dependencies monthly
   - Review security advisories

2. **Environment Variables**
   - Never commit `.env.local` to git
   - Use different keys for dev/staging/production
   - Rotate keys periodically

3. **Smart Contract**
   - Contract is immutable once deployed
   - Audit contract code before mainnet deployment
   - Test thoroughly on testnet first

## Security Features

### Client-Side Encryption
- AES-256-GCM encryption
- Unique IV per message
- 128-bit authentication tags
- Secure memory cleanup

### Blockchain Security
- Time-locks enforced by consensus
- Immutable message metadata
- Transparent on-chain verification

### Storage Security
- Encrypted blobs on IPFS
- Content addressing (CIDs)
- Decentralized redundancy

## Audit History

- **2025-11**: Initial security review (internal)
- **Pending**: External smart contract audit before mainnet

## Contact

For security concerns, contact:
- GitHub: [@radebe49](https://github.com/radebe49)
- Repository: [Lockdrop](https://github.com/radebe49/Lockdrop)

---

**Last Updated**: November 19, 2025
