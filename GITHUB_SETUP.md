# GitHub Repository Setup Guide

This guide covers setting up the GitHub repository for FutureProof and establishing best practices for version control.

## Initial Repository Setup

### 1. Create GitHub Repository

#### Via GitHub Web Interface

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Configure repository:
   - **Name**: `futureproof-app` (or your preferred name)
   - **Description**: "Decentralized time-capsule application with client-side encryption and blockchain-enforced unlocking"
   - **Visibility**: Public (required for open-source verification)
   - **Initialize**: Do NOT initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

#### Via GitHub CLI (Alternative)

```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh
# Login
gh auth login

# Create repository
gh repo create futureproof-app --public --description "Decentralized time-capsule application with client-side encryption and blockchain-enforced unlocking"
```

### 2. Connect Local Repository to GitHub

```bash
# Add remote origin (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/futureproof-app.git

# Or use SSH (recommended if you have SSH keys set up)
git remote add origin git@github.com:USERNAME/futureproof-app.git

# Verify remote
git remote -v
```

### 3. Prepare Initial Commit

```bash
# Check current status
git status

# Stage all files
git add .

# Review what will be committed
git status

# Create initial commit
git commit -m "Initial commit: FutureProof decentralized time-capsule app

- Next.js 14 with TypeScript and App Router
- Talisman wallet integration for Polkadot
- Client-side AES-256-GCM encryption
- IPFS storage via Web3.Storage
- Smart contract integration on Westend testnet
- Complete UI with media recording and playback
- Comprehensive error handling and network resilience
- Documentation and deployment configuration"
```

### 4. Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main

# Verify on GitHub
# Visit: https://github.com/USERNAME/futureproof-app
```

## Branch Strategy

### Main Branch Protection

Recommended settings for `main` branch:

1. Go to Repository Settings → Branches
2. Add branch protection rule for `main`:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators (optional)

### Branch Naming Convention

```
feature/description    # New features
fix/description       # Bug fixes
docs/description      # Documentation updates
refactor/description  # Code refactoring
test/description      # Test additions/updates
chore/description     # Maintenance tasks
```

Examples:
```bash
git checkout -b feature/add-message-export
git checkout -b fix/wallet-connection-timeout
git checkout -b docs/update-deployment-guide
```

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates

### Examples

```bash
# Feature
git commit -m "feat(wallet): add multi-account selection support"

# Bug fix
git commit -m "fix(encryption): resolve memory leak in key cleanup"

# Documentation
git commit -m "docs(readme): add troubleshooting section for IPFS uploads"

# With body
git commit -m "feat(dashboard): add message export functionality

- Add export button to message cards
- Support JSON and CSV formats
- Include encrypted CIDs and metadata
- Requirements: 7.6"
```

## Repository Structure

### Essential Files

Ensure these files are in the repository:

- ✅ `README.md` - Project overview and setup instructions
- ✅ `LICENSE` - Open source license (MIT recommended)
- ✅ `.gitignore` - Files to exclude from version control
- ✅ `package.json` - Dependencies and scripts
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `next.config.mjs` - Next.js configuration
- ✅ `tailwind.config.ts` - Tailwind CSS configuration
- ✅ `.eslintrc.json` - ESLint rules
- ✅ `.prettierrc` - Prettier configuration
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `DEPLOYMENT.md` - Deployment guide
- ✅ `CONTRIBUTING.md` - Contribution guidelines (optional)

### Documentation Structure

```
docs/
├── developer-guide.md      # Developer documentation
├── user-guide.md          # User documentation
├── ERROR_HANDLING_IMPLEMENTATION.md
├── NETWORK_RESILIENCE.md
└── EDGE_CASE_TESTING.md
```

## GitHub Repository Settings

### 1. About Section

Add to repository homepage:

- **Description**: "Decentralized time-capsule application with client-side encryption and blockchain-enforced unlocking"
- **Website**: Your Vercel deployment URL
- **Topics**: `polkadot`, `ipfs`, `encryption`, `web3`, `nextjs`, `typescript`, `decentralized`, `time-capsule`, `blockchain`

### 2. Features

Enable these features:

- ✅ Issues (for bug tracking and feature requests)
- ✅ Discussions (for community Q&A)
- ✅ Projects (for roadmap tracking)
- ✅ Wiki (optional, for extended documentation)

### 3. Security

1. Go to Settings → Security
2. Enable:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning (if available)

### 4. Add LICENSE

Create a `LICENSE` file:

```bash
# MIT License (recommended for open source)
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

git add LICENSE
git commit -m "docs: add MIT license"
git push
```

## Pull Request Workflow

### Creating a Pull Request

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push -u origin feature/new-feature

# Create PR via GitHub web interface or CLI
gh pr create --title "Add new feature" --body "Description of changes"
```

### PR Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] No console errors

## Requirements
References requirements: [list requirement numbers]

## Screenshots (if applicable)
Add screenshots for UI changes
```

## Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report a bug or issue
title: '[BUG] '
labels: bug
---

## Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14]
- Wallet: [e.g., Talisman 1.0]
```

## Maintenance Tasks

### Regular Updates

```bash
# Update dependencies
npm update
npm audit fix

# Commit updates
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push
```

### Tagging Releases

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0

- Initial public release
- Full feature set implemented
- Deployed to production"

# Push tag to GitHub
git push origin v1.0.0

# Create GitHub release from tag
gh release create v1.0.0 --title "v1.0.0" --notes "Release notes here"
```

## Collaboration Guidelines

### For Contributors

1. Fork the repository
2. Create a feature branch
3. Make changes with clear commits
4. Push to your fork
5. Create a pull request
6. Respond to review feedback

### For Maintainers

1. Review PRs promptly
2. Provide constructive feedback
3. Ensure tests pass
4. Verify documentation is updated
5. Merge when approved
6. Delete merged branches

## GitHub Actions Integration

The CI/CD pipeline (task 14.3) will automatically:

- Run on every push and PR
- Execute linting and type checking
- Build the application
- Deploy to Vercel
- Report status back to GitHub

## Useful Git Commands

```bash
# View commit history
git log --oneline --graph --all

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View changes
git diff

# Stash changes
git stash
git stash pop

# Clean untracked files
git clean -fd

# Update from remote
git pull origin main

# View remote info
git remote show origin
```

## Troubleshooting

### Issue: Large files rejected

```bash
# GitHub has 100MB file size limit
# Solution: Use Git LFS for large files
git lfs install
git lfs track "*.mp4"
git add .gitattributes
```

### Issue: Merge conflicts

```bash
# Update your branch
git fetch origin
git merge origin/main

# Resolve conflicts in files
# Then:
git add .
git commit -m "fix: resolve merge conflicts"
```

### Issue: Accidentally committed secrets

```bash
# Remove from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (use with caution)
git push origin --force --all

# Rotate compromised secrets immediately!
```

## Next Steps

After GitHub setup:

1. ✅ Verify repository is public
2. ✅ Add comprehensive README
3. ✅ Configure branch protection
4. ✅ Enable security features
5. ✅ Add LICENSE file
6. ✅ Create issue templates
7. ✅ Set up CI/CD (task 14.3)
8. ✅ Connect to Vercel
9. ✅ Share repository URL
10. ✅ Accept contributions!

## Additional Resources

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub CLI](https://cli.github.com)
- [Conventional Commits](https://www.conventionalcommits.org)
