# Branch Strategy & GitHub Configuration Guide

## 📋 Overview

This document describes the branch management strategy for Lumina Portfolio and provides step-by-step instructions for configuring GitHub repository settings.

## 🌳 Branch Structure

### Main Branches

- **`main`** - Production-ready code, protected branch
  - Only accepts merges from `develop` via Pull Requests
  - Protected with required reviews and status checks
  - Represents stable releases

- **`develop`** - Integration branch for ongoing development
  - Default branch for the repository
  - All feature branches merge here
  - Tested and stable, but may contain unreleased features

### Supporting Branches

- **`release/vX.Y.Z-beta`** - Release preparation branches
  - Created from `develop` when preparing a new release
  - Only bug fixes and documentation updates allowed
  - Merged into both `main` and `develop` when ready

- **`feature/*`** - Feature development branches
  - Created from `develop`
  - Merged back into `develop` via Pull Request
  - Deleted after merge

- **`fix/*`** - Bug fix branches
  - Created from `develop` (or `main` for hotfixes)
  - Merged back into source branch via Pull Request

- **`copilot/*`** - Automated branches created by GitHub Copilot
  - Temporary branches for AI-assisted development
  - Should be cleaned up regularly

## 🔒 GitHub Repository Configuration

### Step 1: Set Default Branch to `develop`

1. Go to your repository on GitHub: `https://github.com/groovybronx/portf84`
2. Click on **Settings** (tab at the top)
3. In the left sidebar, click on **Branches**
4. Under "Default branch", click the switch icon (⇄) next to `main`
5. Select `develop` from the dropdown
6. Click **Update**
7. Confirm by clicking **I understand, update the default branch**

### Step 2: Protect the `main` Branch

1. Still in **Settings → Branches**
2. Under "Branch protection rules", click **Add rule** (or **Add branch protection rule**)
3. In "Branch name pattern", enter: `main`
4. Enable the following options:

   **Basic Protection:**
   - ☑ **Require a pull request before merging**
     - ☑ Require approvals: Set to at least **1**
     - ☑ Dismiss stale pull request approvals when new commits are pushed
     - ☑ Require review from Code Owners (if you have a CODEOWNERS file)
   
   **Status Checks:**
   - ☑ **Require status checks to pass before merging**
     - ☑ Require branches to be up to date before merging
     - Add any CI checks (tests, builds) as required status checks
   
   **Additional Settings:**
   - ☑ **Require conversation resolution before merging**
   - ☑ **Do not allow bypassing the above settings**
   - ☑ **Restrict who can push to matching branches** (optional - admins only)
   - ☑ **Lock branch** (prevents all pushes, even with required checks passing)

5. Click **Create** or **Save changes**

### Step 3: Protect the `develop` Branch (Optional but Recommended)

1. Repeat Step 2 but with branch name pattern: `develop`
2. Use lighter protection rules:
   - ☑ Require a pull request before merging (no required approvals necessary)
   - ☑ Require status checks to pass before merging
   - ☑ Require conversation resolution before merging

### Step 4: Configure Branch Deletion

1. In **Settings → General** (left sidebar)
2. Scroll down to "Pull Requests"
3. Enable:
   - ☑ **Automatically delete head branches**

This will automatically delete feature branches after they're merged.

## 🧹 Cleaning Up Old Branches

### Identifying Branches to Delete

Run this command to see all remote branches:

```bash
git branch -r
```

**Branches that can be safely deleted:**
- Old `copilot/*` branches that have been merged
- Completed `feature/*` branches that have been merged
- Any branch with "sub-pr" in the name (temporary PR branches)

**Branches to keep:**
- `main` - production branch
- `develop` - integration branch
- `release/*` - active release branches
- Active feature branches still in development

### Deleting Remote Branches

Use the provided cleanup script or delete manually:

```bash
# Delete a single remote branch
git push origin --delete <branch-name>

# Example:
git push origin --delete copilot/old-branch-name
```

Or use the cleanup script:

```bash
./scripts/cleanup-branches.sh
```

## 🚀 Creating a New Beta Release Branch

When you're ready to prepare a new beta release:

```bash
# Make sure develop is up to date
git checkout develop
git pull origin develop

# Create the release branch
git checkout -b release/v0.2.0-beta

# Update version in package.json
# Update CHANGELOG.md with release notes

# Push the new branch
git push -u origin release/v0.2.0-beta
```

## 📝 Workflow Examples

### Creating a New Feature

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-new-feature

# Work on the feature...
git add .
git commit -m "feat: implement my new feature"

# Push and create PR to develop
git push -u origin feature/my-new-feature
```

### Releasing a New Version

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v0.2.0-beta

# Finalize version and changelog
# Run tests, fix bugs

# Merge to main via PR
# Then merge back to develop

# Tag the release
git checkout main
git pull origin main
git tag -a v0.2.0-beta -m "Release v0.2.0-beta"
git push origin v0.2.0-beta
```

### Hotfix for Production

```bash
# Start from main
git checkout main
git pull origin main
git checkout -b fix/critical-bug

# Fix the bug...
git add .
git commit -m "fix: resolve critical bug"

# Create PR to main
# After merge to main, also merge to develop
```

## 🔧 Maintenance

### Weekly Tasks

- Review and delete merged `copilot/*` branches
- Check for stale feature branches (older than 30 days)
- Ensure `develop` stays in sync with `main` after releases

### Monthly Tasks

- Audit branch protection rules
- Review and update this documentation
- Clean up old tags if necessary

## 📚 References

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Git Flow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Semantic Versioning](https://semver.org/)

---

**Last Updated:** 2026-01-01  
**Maintainer:** Repository Admins
