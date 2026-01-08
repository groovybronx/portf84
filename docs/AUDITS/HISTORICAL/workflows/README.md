# 🔄 Git & GitHub Workflows

This directory contains all documentation related to Git workflows, GitHub configuration, and branch management strategies for Lumina Portfolio.

---

## 📋 Table of Contents

1. [Branch Strategy](#branch-strategy)
2. [GitHub Configuration](#github-configuration)
3. [Release Management](#release-management)
4. [Quick Reference](#quick-reference)

---

## 🌳 Branch Strategy

**[BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md)** - Complete branch management guide

- **Main Branches**: `main` (production) and `develop` (integration)
- **Supporting Branches**: `release/*`, `feature/*`, `hotfix/*`
- **Workflow**: Feature → Develop → Release → Main
- **Protection Rules**: Required reviews, status checks, conversation resolution

**Topics Covered:**
- Branch structure and naming conventions
- GitHub repository configuration
- Pull request workflow
- Merge strategies

---

## ⚙️ GitHub Configuration

### Quick Start (10 minutes)
**[QUICK_START.md](../getting-started/QUICK_START.md)** - Rapid setup guide
- Set `develop` as default branch
- Protect the `main` branch
- Clean up obsolete branches
- Create release branch

### Detailed Configuration (French)
**[CONFIGURATION_GITHUB_FR.md](./CONFIGURATION_GITHUB_FR.md)** - Comprehensive step-by-step guide in French
- Detailed instructions for GitHub settings
- Branch protection rules
- Default branch configuration
- Best practices

### Configuration Summary
**[GITHUB_SETUP_SUMMARY.md](./GITHUB_SETUP_SUMMARY.md)** - Overview of all completed work
- Documentation created
- Scripts developed
- Configuration checklist
- Validation steps

---

## 🚀 Release Management

**[CREATE_RELEASE_BRANCH_INSTRUCTIONS.md](./CREATE_RELEASE_BRANCH_INSTRUCTIONS.md)** - Release branch creation guide
- Step-by-step release preparation
- Version numbering (semantic versioning)
- Testing and validation
- Merge process

**Release Workflow:**
```bash
# Create a release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v2.0.0-beta
git push -u origin release/v2.0.0-beta

# After testing, merge into main and develop
# See the guide for detailed instructions
```

---

## 📖 Quick Reference

### Common Git Commands

#### Feature Development
```bash
# Create a feature branch
git checkout develop
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/my-feature
```

#### Keeping Branches Updated
```bash
# Update develop from main
git checkout develop
git pull origin main
git push origin develop

# Rebase feature on develop
git checkout feature/my-feature
git rebase develop
```

#### Hotfix
```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/fix-critical-bug

# After fix, merge to both main and develop
git checkout main
git merge --no-ff hotfix/fix-critical-bug
git checkout develop
git merge --no-ff hotfix/fix-critical-bug
```

### Branch Protection Settings

For `main` branch:
- ✅ Require pull request before merging (1 approval)
- ✅ Require status checks to pass
- ✅ Require conversation resolution
- ✅ Require linear history (optional)
- ✅ Do not allow bypassing the above settings

---

## 🔧 Utility Scripts

The repository includes utility scripts for branch management:

- **[cleanup-branches.sh](../../scripts/cleanup-branches.sh)** - Clean obsolete branches
- **[create-release-branch.sh](../../scripts/create-release-branch.sh)** - Create release branches
- **[maintain-github-config.sh](../../scripts/maintain-github-config.sh)** - Validate GitHub configuration

See [scripts/README.md](../../scripts/README.md) for more details.

---

## 🎯 Best Practices

### Commit Messages
Follow conventional commits:
```
feat: add new feature
fix: correct bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

### Pull Requests
- Clear, descriptive title
- Reference related issues (#123)
- Include screenshots for UI changes
- Update documentation if needed
- Ensure tests pass
- Request review from team members

### Code Review
- Review code thoroughly
- Test functionality locally
- Check for security issues
- Verify documentation updates
- Approve only when satisfied

---

## 📚 Additional Resources

- **[Architecture Guide](../guides/architecture/ARCHITECTURE.md)** - Technical architecture
- **[Developer Guide](../guides/project/KnowledgeBase/07_Developer_Guide.md)** - Development practices
- **[Git Workflow (Architecture)](../guides/architecture/GIT_WORKFLOW.md)** - Detailed Git workflow documentation
- **[Main Documentation](../README.md)** - Return to documentation hub

---

## 🆘 Need Help?

- **Questions**: Open a [GitHub Discussion](https://github.com/groovybronx/portf84/discussions)
- **Issues**: Report on [GitHub Issues](https://github.com/groovybronx/portf84/issues)
- **Team**: Contact the development team

---

**Keep the repository clean and organized! 🎯**
