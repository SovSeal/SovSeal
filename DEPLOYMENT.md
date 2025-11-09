# Deployment Guide

This guide covers deploying FutureProof to Vercel with CI/CD integration.

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier is sufficient)
- Environment variable values ready

## Vercel Deployment

### 1. Create Vercel Project

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration
5. Configure environment variables (see below)
6. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts to link/create project
```

### 2. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

#### Required Variables

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Your contract address on Westend | Production, Preview, Development |
| `NEXT_PUBLIC_RPC_ENDPOINT` | `wss://westend-rpc.polkadot.io` | Production, Preview, Development |
| `NEXT_PUBLIC_NETWORK` | `westend` | Production, Preview, Development |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Production |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Preview, Development (optional) |

#### Optional Variables (IPFS Fallback)

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_PINATA_API_KEY` | Your Pinata API key | Production, Preview |
| `NEXT_PUBLIC_PINATA_SECRET` | Your Pinata secret | Production, Preview |

**Note**: Web3.Storage (w3up-client) uses email-based authentication, so no API token is needed for the primary IPFS provider.

### 3. Build Settings

Vercel auto-detects Next.js projects. Default settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

These are configured in `vercel.json` but Vercel's auto-detection usually works without it.

### 4. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel provides automatic HTTPS via Let's Encrypt

## Deployment Workflow

### Automatic Deployments

Once connected to GitHub:

- **Production**: Pushes to `main` branch trigger production deployments
- **Preview**: Pull requests trigger preview deployments
- **Development**: Pushes to other branches trigger development deployments

### Manual Deployments

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## Environment-Specific Configuration

### Production
- `NEXT_PUBLIC_DEMO_MODE=false` (enforces timestamp verification)
- Use production contract address
- Enable error logging/monitoring

### Preview/Staging
- `NEXT_PUBLIC_DEMO_MODE=true` (optional, for testing)
- Can use same contract or separate test contract
- Useful for testing before production

### Development
- Local `.env.local` file
- Can use demo mode for faster iteration
- Mock IPFS service available in demo mode

## Vercel CLI Commands

```bash
# Link local project to Vercel
vercel link

# Pull environment variables
vercel env pull

# View deployment logs
vercel logs [deployment-url]

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

## Monitoring and Logs

### View Logs
1. Go to Vercel Dashboard → Project → Deployments
2. Click on a deployment
3. View "Build Logs" and "Function Logs"

### Analytics
- Vercel provides built-in analytics
- Enable in Project Settings → Analytics

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance monitoring

## Troubleshooting

### Build Failures

**Issue**: Build fails with TypeScript errors
```bash
# Solution: Run locally first
npm run build
npm run lint
```

**Issue**: Missing environment variables
```bash
# Solution: Check all required variables are set in Vercel
# Verify with: vercel env ls
```

**Issue**: Dependency installation fails
```bash
# Solution: Clear cache and redeploy
# In Vercel Dashboard: Deployments → ... → Redeploy
```

### Runtime Errors

**Issue**: "Contract not found" error
- Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` is correct
- Check RPC endpoint is accessible
- Ensure contract is deployed on specified network

**Issue**: IPFS upload failures
- Check Web3.Storage authentication
- Verify Pinata credentials if using fallback
- Check network connectivity

**Issue**: Wallet connection fails
- Ensure Talisman extension is installed
- Check browser compatibility
- Verify HTTPS is enabled (required for Web Crypto API)

## Security Considerations

### Environment Variables
- Never commit `.env.local` to Git
- Use Vercel's encrypted environment variables
- Rotate API keys regularly
- Use different keys for production/preview

### HTTPS
- Vercel provides automatic HTTPS
- Required for Web Crypto API and wallet extensions
- Custom domains get automatic SSL certificates

### Content Security Policy
Consider adding CSP headers in `next.config.mjs`:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss://westend-rpc.polkadot.io https://*.ipfs.w3s.link https://api.pinata.cloud;"
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

## Performance Optimization

### Edge Functions
- Vercel automatically optimizes Next.js for edge deployment
- API routes run on Vercel's edge network
- Static pages are cached globally

### Image Optimization
- Use Next.js `<Image>` component
- Vercel automatically optimizes images
- Supports WebP and AVIF formats

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
# Check .next/analyze/ for bundle report
```

## Rollback Procedure

If a deployment causes issues:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Or use CLI: `vercel rollback [deployment-url]`

## Cost Considerations

### Vercel Free Tier Includes:
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Analytics (basic)

### Paid Features:
- Increased bandwidth
- Team collaboration
- Advanced analytics
- Password protection
- Custom deployment regions

## Next Steps

After deployment:

1. ✅ Verify all pages load correctly
2. ✅ Test wallet connection
3. ✅ Test message creation flow
4. ✅ Test message unlocking
5. ✅ Check error handling
6. ✅ Monitor logs for issues
7. ✅ Set up custom domain (optional)
8. ✅ Configure analytics/monitoring
9. ✅ Document deployment URL in README
10. ✅ Announce to users!

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
