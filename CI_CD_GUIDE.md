# CI/CD Pipeline Guide

This guide explains the Continuous Integration and Continuous Deployment (CI/CD) pipeline for FutureProof.

## Overview

The CI/CD pipeline automatically:
- Lints and type-checks code
- Builds the application
- Runs tests
- Performs security audits
- Deploys to Vercel (preview and production)

## GitHub Actions Workflows

### 1. Main CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Lint and Type Check
- Runs ESLint to check code quality
- Runs TypeScript compiler for type checking
- Checks code formatting with Prettier

#### Build
- Installs dependencies
- Builds Next.js application
- Uploads build artifacts for inspection

#### Test
- Runs unit tests (if available)
- Runs integration tests (if available)
- Continues even if tests fail (for now)

#### Security Audit
- Runs `npm audit` to check for vulnerabilities
- Uses `audit-ci` for stricter vulnerability checking
- Continues even if moderate vulnerabilities found

#### Deploy Preview
- Triggers on pull requests
- Deploys to Vercel preview environment
- Comments on PR with deployment status

#### Deploy Production
- Triggers on push to `main` branch
- Deploys to Vercel production environment
- Only runs if all previous jobs pass

### 2. Dependency Updates (`dependency-update.yml`)

**Triggers:**
- Weekly schedule (Monday 9:00 AM UTC)
- Manual trigger via GitHub Actions UI

**Actions:**
- Updates npm dependencies to latest compatible versions
- Runs security audit and applies fixes
- Creates pull request with changes
- Requires manual review before merging

### 3. CodeQL Security Analysis (`codeql.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Weekly schedule (Wednesday 3:00 AM UTC)

**Actions:**
- Analyzes JavaScript and TypeScript code
- Detects security vulnerabilities
- Reports findings in GitHub Security tab

## Setup Instructions

### 1. GitHub Secrets Configuration

Add these secrets in GitHub repository settings (Settings → Secrets and variables → Actions):

#### Required Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | [Vercel Account Settings](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | Run `vercel link` locally, check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Vercel project ID | Run `vercel link` locally, check `.vercel/project.json` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Smart contract address | Your deployed contract on Westend |
| `NEXT_PUBLIC_RPC_ENDPOINT` | Polkadot RPC endpoint | `wss://westend-rpc.polkadot.io` |
| `NEXT_PUBLIC_NETWORK` | Network name | `westend` |

#### Optional Secrets

| Secret Name | Description |
|------------|-------------|
| `NEXT_PUBLIC_PINATA_API_KEY` | Pinata API key for IPFS fallback |
| `NEXT_PUBLIC_PINATA_SECRET` | Pinata secret key |

### 2. Get Vercel Credentials

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (run in project root)
vercel link

# Get org and project IDs
cat .vercel/project.json
```

The output will show:
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

### 3. Create Vercel Token

1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Set scope to your account/team
5. Set expiration (recommend 1 year)
6. Copy the token (you won't see it again!)
7. Add to GitHub Secrets as `VERCEL_TOKEN`

### 4. Enable GitHub Actions

1. Go to repository Settings → Actions → General
2. Under "Actions permissions", select "Allow all actions and reusable workflows"
3. Under "Workflow permissions", select "Read and write permissions"
4. Check "Allow GitHub Actions to create and approve pull requests"
5. Save changes

### 5. Enable CodeQL (Optional)

1. Go to repository Settings → Security → Code security and analysis
2. Enable "CodeQL analysis"
3. GitHub will automatically run security scans

## Workflow Behavior

### On Pull Request

```
1. Lint and Type Check → 2. Build → 3. Test → 4. Security Audit
                                                        ↓
                                                5. Deploy Preview
                                                        ↓
                                                6. Comment on PR
```

**Result**: Preview deployment URL in PR comments

### On Push to Main

```
1. Lint and Type Check → 2. Build → 3. Test → 4. Security Audit
                                                        ↓
                                                5. Deploy Production
                                                        ↓
                                                6. Notification
```

**Result**: Production deployment at your Vercel URL

## Status Badges

Add these badges to your README.md:

```markdown
![CI/CD](https://github.com/USERNAME/futureproof-app/workflows/CI/CD%20Pipeline/badge.svg)
![CodeQL](https://github.com/USERNAME/futureproof-app/workflows/CodeQL%20Security%20Analysis/badge.svg)
![Deployment](https://img.shields.io/badge/deployment-vercel-black)
```

Replace `USERNAME` with your GitHub username.

## Monitoring Workflows

### View Workflow Runs

1. Go to repository → Actions tab
2. See all workflow runs and their status
3. Click on a run to see detailed logs

### Workflow Status

- ✅ Green checkmark: All jobs passed
- ❌ Red X: One or more jobs failed
- 🟡 Yellow dot: Workflow in progress
- ⚪ Gray circle: Workflow queued

### Debugging Failed Workflows

1. Click on the failed workflow run
2. Click on the failed job
3. Expand the failed step
4. Review error logs
5. Fix the issue locally
6. Push changes to trigger re-run

## Local Testing

Before pushing, test locally:

```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Check formatting
npx prettier --check .

# Fix formatting
npm run format

# Build application
npm run build

# Run tests (if available)
npm test
```

## Customizing Workflows

### Modify Triggers

Edit `.github/workflows/ci.yml`:

```yaml
on:
  push:
    branches: [main, develop, feature/*]  # Add more branches
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Run daily at midnight
```

### Add New Jobs

```yaml
jobs:
  my-custom-job:
    name: My Custom Job
    runs-on: ubuntu-latest
    needs: [lint, build]  # Run after these jobs
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run custom script
        run: npm run my-script
```

### Add Environment Variables

```yaml
- name: Build with custom env
  run: npm run build
  env:
    MY_CUSTOM_VAR: ${{ secrets.MY_SECRET }}
    NODE_ENV: production
```

## Best Practices

### 1. Keep Secrets Secure
- Never commit secrets to Git
- Rotate tokens regularly
- Use different tokens for different environments
- Limit token permissions to minimum required

### 2. Fast Feedback
- Keep workflows fast (< 5 minutes ideal)
- Use caching for dependencies
- Run expensive jobs only when needed
- Parallelize independent jobs

### 3. Fail Fast
- Run quick checks (lint, type check) first
- Fail early on critical errors
- Use `continue-on-error` for non-critical checks

### 4. Clear Notifications
- Use descriptive job names
- Add comments to PRs with deployment URLs
- Send notifications on production deployments

### 5. Version Control
- Keep workflow files in version control
- Review workflow changes in PRs
- Test workflow changes on feature branches

## Troubleshooting

### Issue: Workflow not triggering

**Solution:**
- Check workflow file syntax (YAML is sensitive to indentation)
- Verify triggers match your branch names
- Ensure GitHub Actions is enabled in repository settings

### Issue: Build fails with "Module not found"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Vercel deployment fails

**Solution:**
- Verify `VERCEL_TOKEN` is valid and not expired
- Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
- Ensure environment variables are set in GitHub Secrets
- Check Vercel dashboard for deployment logs

### Issue: Type check fails in CI but passes locally

**Solution:**
```bash
# Use exact same TypeScript version as CI
npm ci  # Instead of npm install
npx tsc --noEmit
```

### Issue: Security audit fails

**Solution:**
```bash
# Update vulnerable packages
npm audit fix

# If auto-fix doesn't work, update manually
npm update [package-name]

# For breaking changes, review and test
npm audit
```

## Performance Optimization

### Caching Dependencies

Already configured in workflows:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'  # Caches node_modules
```

### Conditional Jobs

Run jobs only when needed:

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'  # Only on main branch
```

### Matrix Builds

Test on multiple Node versions:

```yaml
strategy:
  matrix:
    node-version: [18, 20]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

## Advanced Features

### Manual Workflow Dispatch

Trigger workflows manually:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
```

### Reusable Workflows

Create shared workflows:

```yaml
# .github/workflows/reusable-build.yml
on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
```

### Deployment Environments

Configure in GitHub Settings → Environments:

```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://futureproof-app.vercel.app
```

## Next Steps

After CI/CD setup:

1. ✅ Verify all workflows run successfully
2. ✅ Test pull request preview deployments
3. ✅ Test production deployment on merge to main
4. ✅ Set up branch protection rules
5. ✅ Configure required status checks
6. ✅ Add status badges to README
7. ✅ Document deployment process for team
8. ✅ Set up monitoring and alerts
9. ✅ Review security scan results
10. ✅ Celebrate automated deployments! 🎉

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
