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

# Parse version components
IFS='.-' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"
PRERELEASE="${VERSION_PARTS[3]}"

# Suggest next version
NEXT_MINOR=$((MINOR + 1))
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

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
	echo "❌ Operation cancelled."
	exit 0
fi

# Make sure we're on develop and up to date
echo "📡 Updating develop branch..."
git checkout develop
git pull origin develop

# Create release branch
BRANCH_NAME="release/v$NEW_VERSION"
echo "🌱 Creating branch: $BRANCH_NAME..."
git checkout -b "$BRANCH_NAME"

# Update version in package.json
echo "📝 Updating version in package.json..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
rm package.json.bak 2>/dev/null || true

# Stage the version change
git add package.json

# Commit version bump
echo "💾 Committing version bump..."
git commit -m "chore: Bump version to $NEW_VERSION"

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
