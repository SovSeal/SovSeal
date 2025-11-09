# Deployment Checklist

Use this checklist to ensure proper deployment setup for FutureProof.

## Pre-Deployment

### Code Quality
- [ ] All linting errors resolved (`npm run lint`)
- [ ] TypeScript type checking passes (`npx tsc --noEmit`)
- [ ] Code formatted with Prettier (`npm run format`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console errors in development mode

### Testing
- [ ] Wallet connection tested with Talisman
- [ ] Media recording/upload tested
- [ ] Encryption/decryption flow verified
- [ ] Message creation end-to-end tested
- [ ] Dashboard displays messages correctly
- [ ] Unlock flow tested (with demo mode)
- [ ] Error handling verified
- [ ] Tested on Chrome, Firefox, Safari

### Documentation
- [ ] README.md updated with deployment URL
- [ ] Environment variables documented
- [ ] Setup instructions verified
- [ ] API documentation current
- [ ] User guide complete

## GitHub Setup

### Repository Configuration
- [ ] Repository created on GitHub
- [ ] Repository set to public
- [ ] Code pushed to `main` branch
- [ ] `.gitignore` configured correctly
- [ ] LICENSE file added (MIT)
- [ ] README.md includes project overview
- [ ] CONTRIBUTING.md added

### Branch Protection
- [ ] Branch protection enabled for `main`
- [ ] Require pull request reviews
- [ ] Require status checks to pass
- [ ] Require branches to be up to date

### GitHub Actions
- [ ] Workflows added to `.github/workflows/`
- [ ] GitHub Actions enabled in settings
- [ ] Workflow permissions set correctly
- [ ] Status checks configured

### Secrets Configuration
- [ ] `VERCEL_TOKEN` added
- [ ] `VERCEL_ORG_ID` added
- [ ] `VERCEL_PROJECT_ID` added
- [ ] `NEXT_PUBLIC_CONTRACT_ADDRESS` added
- [ ] `NEXT_PUBLIC_RPC_ENDPOINT` added
- [ ] `NEXT_PUBLIC_NETWORK` added
- [ ] Optional: `NEXT_PUBLIC_PINATA_API_KEY` added
- [ ] Optional: `NEXT_PUBLIC_PINATA_SECRET` added

## Vercel Setup

### Project Configuration
- [ ] Vercel account created
- [ ] Project created/imported from GitHub
- [ ] Framework preset: Next.js
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm install`

### Environment Variables
- [ ] Production environment variables set
- [ ] Preview environment variables set
- [ ] `NEXT_PUBLIC_DEMO_MODE=false` for production
- [ ] All required variables configured

### Domain Configuration
- [ ] Custom domain added (optional)
- [ ] DNS configured correctly
- [ ] HTTPS certificate active
- [ ] Domain verified

### Deployment Settings
- [ ] Auto-deploy from `main` enabled
- [ ] Preview deployments for PRs enabled
- [ ] Build & Development Settings verified
- [ ] Root directory set correctly

## First Deployment

### Initial Deploy
- [ ] Push to `main` branch
- [ ] GitHub Actions workflow triggered
- [ ] All CI checks pass (lint, build, test)
- [ ] Vercel deployment succeeds
- [ ] Deployment URL accessible

### Verification
- [ ] Homepage loads correctly
- [ ] Wallet connection works
- [ ] Media recording/upload functional
- [ ] IPFS uploads working
- [ ] Blockchain connection established
- [ ] Dashboard displays correctly
- [ ] No console errors
- [ ] HTTPS enabled and working

### Performance
- [ ] Page load time acceptable (< 3s)
- [ ] Lighthouse score reviewed
- [ ] Core Web Vitals checked
- [ ] Mobile responsiveness verified

## Post-Deployment

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (optional)
- [ ] Deployment notifications set up
- [ ] Logs reviewed for errors

### Documentation Updates
- [ ] README updated with live URL
- [ ] Deployment guide verified
- [ ] User guide reflects production
- [ ] Known issues documented

### Security
- [ ] Environment variables secured
- [ ] No secrets in code
- [ ] HTTPS enforced
- [ ] CSP headers configured (optional)
- [ ] Security audit passed

### Communication
- [ ] Deployment announced to team
- [ ] User documentation shared
- [ ] Feedback channels established
- [ ] Support process defined

## Ongoing Maintenance

### Weekly
- [ ] Review Dependabot alerts
- [ ] Check deployment logs
- [ ] Monitor error rates
- [ ] Review user feedback

### Monthly
- [ ] Update dependencies
- [ ] Review security scans
- [ ] Check performance metrics
- [ ] Update documentation

### As Needed
- [ ] Respond to issues
- [ ] Deploy bug fixes
- [ ] Release new features
- [ ] Rotate API keys/tokens

## Rollback Plan

If deployment fails:

1. [ ] Check Vercel deployment logs
2. [ ] Review GitHub Actions logs
3. [ ] Identify failing component
4. [ ] Fix locally and test
5. [ ] Push fix or rollback to previous version
6. [ ] Verify rollback successful
7. [ ] Document issue and resolution

## Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **GitHub Support**: https://support.github.com
- **Polkadot Support**: https://support.polkadot.network
- **Web3.Storage Support**: https://web3.storage/docs/

## Success Criteria

Deployment is successful when:

- ✅ Application accessible at production URL
- ✅ All core features functional
- ✅ No critical errors in logs
- ✅ Performance metrics acceptable
- ✅ Security checks passed
- ✅ Documentation complete
- ✅ CI/CD pipeline operational
- ✅ Monitoring in place

## Notes

- Keep this checklist updated as deployment process evolves
- Document any issues encountered and their solutions
- Share learnings with team
- Celebrate successful deployments! 🎉
