# GitHub Actions Workflows

This directory contains automated workflows for FutureProof's CI/CD pipeline.

## Workflows

### 🔄 CI/CD Pipeline (`ci.yml`)
**Purpose**: Main continuous integration and deployment workflow

**Triggers**:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs**:
1. **Lint**: ESLint, TypeScript, Prettier checks
2. **Build**: Next.js application build
3. **Test**: Unit and integration tests
4. **Security**: npm audit and vulnerability scanning
5. **Deploy Preview**: Vercel preview for PRs
6. **Deploy Production**: Vercel production for main branch

### 📦 Dependency Updates (`dependency-update.yml`)
**Purpose**: Automated weekly dependency updates

**Triggers**:
- Weekly schedule (Monday 9:00 AM UTC)
- Manual dispatch

**Actions**:
- Updates npm packages
- Runs security audit
- Creates pull request for review

### 🔒 CodeQL Analysis (`codeql.yml`)
**Purpose**: Security vulnerability scanning

**Triggers**:
- Push to `main`
- Pull requests to `main`
- Weekly schedule (Wednesday 3:00 AM UTC)

**Actions**:
- Analyzes JavaScript/TypeScript code
- Detects security issues
- Reports to GitHub Security tab

## Required Secrets

Configure in: Repository Settings → Secrets and variables → Actions

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel authentication token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Smart contract address |
| `NEXT_PUBLIC_RPC_ENDPOINT` | Polkadot RPC endpoint |
| `NEXT_PUBLIC_NETWORK` | Network name (westend) |

## Quick Commands

```bash
# View workflow status
gh workflow list

# View recent runs
gh run list

# View specific run
gh run view [run-id]

# Re-run failed workflow
gh run rerun [run-id]

# Trigger manual workflow
gh workflow run dependency-update.yml
```

## Status Badges

Add to README.md:

```markdown
![CI/CD](https://github.com/USERNAME/futureproof-app/workflows/CI/CD%20Pipeline/badge.svg)
![CodeQL](https://github.com/USERNAME/futureproof-app/workflows/CodeQL%20Security%20Analysis/badge.svg)
```

## Documentation

See [CI_CD_GUIDE.md](../../CI_CD_GUIDE.md) for detailed setup and troubleshooting.
