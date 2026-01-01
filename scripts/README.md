# Scripts Directory

This directory contains utility scripts for repository management and maintenance.

## Available Scripts

### 🧹 `cleanup-branches.sh`

Identifies and deletes old or merged branches from the remote repository.

**What it does:**
- Fetches latest branch information
- Lists branches marked for deletion (old copilot branches, merged features)
- Prompts for confirmation before deletion
- Deletes specified branches from remote
- Provides summary of operations

**Usage:**
```bash
./scripts/cleanup-branches.sh
```

**Branches targeted for cleanup:**
- Old `copilot/*` branches that have been merged
- Completed `feature/*` branches
- Temporary sub-PR branches

**Safety features:**
- Requires explicit "yes" confirmation
- Shows list of branches before deletion
- Reports success/failure for each deletion

---

### 🚀 `create-release-branch.sh`

Creates a new release branch from `develop` with proper versioning.

**What it does:**
- Reads current version from package.json
- Suggests next version number
- Creates a new release branch
- Updates version in package.json
- Commits and pushes the new branch
- Provides next steps guidance

**Usage:**
```bash
./scripts/create-release-branch.sh
```

**Example flow:**
```
📦 Current version: 0.1.0-beta.1
💡 Suggested next version: 0.2.0-beta.1

Enter the new version (or press Enter to use suggested): [Enter]

📋 Creating release branch for version: 0.2.0-beta.1
Continue? (yes/no): yes

✅ Release branch created successfully!
📌 Branch: release/v0.2.0-beta.1
```

**Next steps after running:**
1. Update CHANGELOG.md with release notes
2. Test the release thoroughly
3. Fix any bugs found during testing
4. Create PR to merge into `main`
5. After merging to main, merge back to `develop`
6. Tag the release

---

## Prerequisites

All scripts require:
- Git installed and configured
- Bash shell (Linux/macOS/WSL on Windows)
- Proper permissions to push to the remote repository
- Node.js (for version parsing in create-release-branch.sh)

## Branch Management Strategy

For a complete overview of the branch management strategy, see:
- [Branch Strategy Documentation](../docs/BRANCH_STRATEGY.md)

## Contributing

When adding new scripts:
1. Follow the same structure and style
2. Include colored output for better UX
3. Always confirm destructive operations
4. Provide helpful error messages
5. Document the script in this README
6. Make scripts executable: `chmod +x script-name.sh`

## Maintenance

These scripts should be reviewed and updated when:
- Branch naming conventions change
- New types of automated branches are created
- Versioning strategy changes
- Workflow processes are modified
