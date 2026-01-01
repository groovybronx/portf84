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
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fetch latest from remote
echo "📡 Fetching latest from remote..."
git fetch origin --prune

echo ""
echo "📊 Current branch status:"
git branch -r | wc -l | xargs echo "  Remote branches:"
git branch -l | wc -l | xargs echo "  Local branches:"

echo ""
echo "🔍 Analyzing branches..."
echo ""

# Protected branches (never delete)
PROTECTED_BRANCHES=(
	"main"
	"develop"
	"refactor"
	"release/v0.2.0-beta.1"
)

# Branches with work merged elsewhere (safe to delete)
OBSOLETE_BRANCHES=(
	"fix/themesettingspersistence"
)

# Old completed branches from previous cleanups
OLD_BRANCHES=(
	"copilot/add-tag-merge-history-component"
	"copilot/check-develop-main-sync"
	"copilot/create-specific-copilot-agents"
	"copilot/resolve-merge-conflicts-pr17"
	"copilot/set-up-copilot-instructions"
	"copilot/sub-pr-12"
	"copilot/sub-pr-17"
	"copilot/sub-pr-17-again"
	"copilot/sub-pr-28-again"
	"feat/app-development"
	"feat/raw-file-support"
	"feat/theme-system-v4"
	"feature/dynamic-configuration"
	"feature/knowledge-doc-8019855004813516228"
)

# Combine all branches to check for deletion
ALL_CLEANUP_BRANCHES=("${OBSOLETE_BRANCHES[@]}" "${OLD_BRANCHES[@]}")

# Display protected branches
echo -e "${GREEN}🛡️  Protected Branches (will NOT be deleted):${NC}"
for branch in "${PROTECTED_BRANCHES[@]}"; do
	if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
		echo -e "  ${GREEN}✓${NC} $branch"
	fi
done

echo ""
echo -e "${YELLOW}📋 Branches with Unmerged Work (should be reviewed, NOT deleted):${NC}"
UNMERGED_BRANCHES=(
	"copilot/execute-ui-audit-simplification"
	"copilot/sub-pr-43"
	"copilot/sub-pr-43-again"
	"copilot/resolve-conflicts-refactor-50"
)

for branch in "${UNMERGED_BRANCHES[@]}"; do
	if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
		# Get the number of unique commits not in develop or refactor
		unique_commits=$(git log origin/develop..origin/"$branch" --oneline 2>/dev/null | wc -l)
		echo -e "  ${CYAN}ℹ${NC} $branch (${unique_commits} unique commits)"
	fi
done

echo ""
echo -e "${RED}🗑️  Obsolete Branches (safe to delete):${NC}"

# Check which branches actually exist
EXISTING_BRANCHES=()
for branch in "${ALL_CLEANUP_BRANCHES[@]}"; do
	if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
		EXISTING_BRANCHES+=("$branch")
		# Check why it's obsolete - compare against main, develop, and refactor
		unique_from_main=$(git log origin/main..origin/"$branch" --oneline 2>/dev/null | wc -l)
		unique_from_develop=$(git log origin/develop..origin/"$branch" --oneline 2>/dev/null | wc -l)
		unique_from_refactor=$(git log origin/refactor..origin/"$branch" --oneline 2>/dev/null | wc -l)
		
		if [ "$unique_from_main" -eq 0 ]; then
			echo -e "  ${GREEN}✓${NC} $branch (all commits in main)"
		elif [ "$unique_from_develop" -eq 0 ]; then
			echo -e "  ${GREEN}✓${NC} $branch (all commits in develop)"
		elif [ "$unique_from_refactor" -eq 0 ]; then
			echo -e "  ${GREEN}✓${NC} $branch (all commits in refactor)"
		else
			echo -e "  ${YELLOW}⚠${NC} $branch (${unique_from_refactor} unique commits vs refactor - verify manually)"
		fi
	fi
done

if [ ${#EXISTING_BRANCHES[@]} -eq 0 ]; then
	echo -e "  ${GREEN}✅ No obsolete branches found!${NC}"
	echo ""
	exit 0
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${RED}⚠️  WARNING: This will permanently delete ${#EXISTING_BRANCHES[@]} remote branches!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo "Branches to be deleted:"
for branch in "${EXISTING_BRANCHES[@]}"; do
	echo "  - $branch"
done
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
echo -e "  ${GREEN}Successfully deleted: $DELETED_COUNT${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
	echo -e "  ${RED}Failed to delete: $FAILED_COUNT${NC}"
fi

echo ""
echo "✨ Cleanup complete!"
echo ""
echo -e "${CYAN}💡 Tips:${NC}"
echo "  • Run 'git remote prune origin' to clean up local references"
echo "  • Review branches with unmerged work before deleting them"
echo "  • Check if any PRs need to be closed manually on GitHub"
