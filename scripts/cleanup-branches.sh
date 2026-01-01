#!/bin/bash

# Branch Cleanup Script for Lumina Portfolio
# This script helps identify and delete old/merged branches

set -e

echo "🧹 Branch Cleanup Script"
echo "========================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fetch latest from remote
echo "📡 Fetching latest from remote..."
git fetch origin --prune

echo ""
echo "📊 Current branch status:"
git branch -r | wc -l | xargs echo "  Remote branches:"
git branch -l | wc -l | xargs echo "  Local branches:"

echo ""
echo "🔍 Identifying branches to clean up..."
echo ""

# List of branches to delete (old copilot branches and sub-pr branches)
BRANCHES_TO_DELETE=(
	"copilot/add-tag-merge-history-component"
	"copilot/check-develop-main-sync"
	"copilot/create-specific-copilot-agents"
	"copilot/resolve-merge-conflicts-pr17"
	"copilot/set-up-copilot-instructions"
	"copilot/sub-pr-12"
	"copilot/sub-pr-17"
	"copilot/sub-pr-17-again"
	"copilot/sub-pr-28-again"
)

# Merged feature branches (already in develop)
MERGED_FEATURES=(
	"feat/app-development"
	"feat/raw-file-support"
	"feat/theme-system-v4"
	"feature/dynamic-configuration"
	"feature/knowledge-doc-8019855004813516228"
)

echo "${YELLOW}Branches marked for deletion:${NC}"
echo ""

# Check which branches actually exist
EXISTING_BRANCHES=()
for branch in "${BRANCHES_TO_DELETE[@]}" "${MERGED_FEATURES[@]}"; do
	if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
		EXISTING_BRANCHES+=("$branch")
		echo "  - $branch"
	fi
done

if [ ${#EXISTING_BRANCHES[@]} -eq 0 ]; then
	echo "${GREEN}✅ No branches to clean up!${NC}"
	exit 0
fi

echo ""
echo "${RED}WARNING: This will permanently delete ${#EXISTING_BRANCHES[@]} remote branches!${NC}"
echo ""
read -p "Do you want to proceed with deletion? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy]([Ee][Ss])?$ ]]; then
	echo "❌ Cleanup cancelled."
	exit 0
fi

# Delete branches
echo "🗑️  Deleting branches..."
echo ""

DELETED_COUNT=0
FAILED_COUNT=0

for branch in "${EXISTING_BRANCHES[@]}"; do
	echo -n "  Deleting $branch... "
	if git push origin --delete "$branch" 2>/dev/null; then
		echo -e "${GREEN}✓${NC}"
		DELETED_COUNT=$((DELETED_COUNT + 1))
	else
		echo -e "${RED}✗${NC}"
		FAILED_COUNT=$((FAILED_COUNT + 1))
	fi
done

echo ""
echo "📈 Summary:"
echo "  ${GREEN}Deleted: $DELETED_COUNT${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
	echo "  ${RED}Failed: $FAILED_COUNT${NC}"
fi

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "💡 Tip: Run 'git remote prune origin' to clean up local references to deleted branches"
