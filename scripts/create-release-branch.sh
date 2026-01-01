#!/bin/bash

# Create New Beta Release Branch Script
# This script helps create a new release branch from develop

set -e

echo "🚀 Create New Beta Release Branch"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: ${BLUE}$CURRENT_VERSION${NC}"

# Validate and parse version components (expected: MAJOR.MINOR.PATCH-PRERELEASE.NUM, e.g., 0.1.0-beta.1)
if [[ ! "$CURRENT_VERSION" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)-([0-9A-Za-z]+)\.([0-9]+)$ ]]; then
	echo "❌ Unsupported version format: $CURRENT_VERSION"
	echo "   Expected format: MAJOR.MINOR.PATCH-PRERELEASE.NUM (e.g., 0.1.0-beta.1)"
	exit 1
fi

MAJOR="${BASH_REMATCH[1]}"
MINOR="${BASH_REMATCH[2]}"
PATCH="${BASH_REMATCH[3]}"
PRERELEASE="${BASH_REMATCH[4]}"
PRERELEASE_NUM="${BASH_REMATCH[5]}"

# Suggest next version
NEXT_MINOR=$((10#$MINOR + 1))
SUGGESTED_VERSION="$MAJOR.$NEXT_MINOR.0-beta.1"

echo ""
echo "💡 Suggested next version: ${GREEN}$SUGGESTED_VERSION${NC}"
echo ""
read -p "Enter the new version (or press Enter to use suggested): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
	NEW_VERSION="$SUGGESTED_VERSION"
fi

echo ""
echo "📋 Creating release branch for version: ${GREEN}$NEW_VERSION${NC}"
echo ""

# Confirm
read -p "Continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy]([Ee][Ss])?$ ]]; then
	echo "❌ Operation cancelled."
	exit 0
fi

# Ensure working tree is clean before switching branches
if [ -n "$(git status --porcelain)" ]; then
	echo "❌ Your working directory has uncommitted changes."
	echo "   Please commit or stash your changes before running this script."
	exit 1
fi

# Make sure we're on develop and up to date
echo "📡 Updating develop branch..."

# Switch to develop with explicit error handling
if ! git checkout develop; then
	echo "❌ Failed to switch to 'develop' branch."
	echo "   Make sure the 'develop' branch exists and resolve any issues, then try again."
	exit 1
fi

# Update develop from origin with explicit error handling
if ! git pull origin develop; then
	echo "❌ Failed to pull latest changes for 'develop' from 'origin'."
	echo "   Check your network connection and resolve any merge conflicts, then try again."
	exit 1
fi

# Create release branch
BRANCH_NAME="release/v$NEW_VERSION"
echo "🌱 Creating branch: $BRANCH_NAME..."
git checkout -b "$BRANCH_NAME"

# Update version, create commit, but don't create a tag
echo "📝 Bumping version and committing..."
npm version "$NEW_VERSION" --no-git-tag-version --message "chore: Bump version to %s"
# Push the new branch
echo "📤 Pushing branch to remote..."
git push -u origin "$BRANCH_NAME"

echo ""
echo "${GREEN}✅ Release branch created successfully!${NC}"
echo ""
echo "📌 Branch: $BRANCH_NAME"
echo "📦 Version: $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Update CHANGELOG.md with release notes"
echo "  2. Test the release thoroughly"
echo "  3. Fix any bugs found during testing"
echo "  4. Create a Pull Request to merge into 'main'"
echo "  5. After merging to main, merge back to 'develop'"
echo "  6. Tag the release: git tag -a v$NEW_VERSION -m 'Release v$NEW_VERSION'"
echo ""
