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

# Cache remote branch list for performance
echo "📋 Caching remote branch list..."
REMOTE_BRANCHES=$(git ls-remote --heads origin | awk '{print $2}' | sed 's|refs/heads/||')

echo ""
echo "📊 Current branch status:"
echo "$REMOTE_BRANCHES" | wc -l | xargs echo "  Remote branches:"
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

# Function to check if branch exists in remote
branch_exists() {
	echo "$REMOTE_BRANCHES" | grep -qx "$1"
}

# Display protected branches
echo -e "${GREEN}🛡️  Protected Branches (will NOT be deleted):${NC}"
for branch in "${PROTECTED_BRANCHES[@]}"; do
	if branch_exists "$branch"; then
		echo -e "  ${GREEN}✓${NC} $branch"
	fi
done

# Function to get unique commit info for a branch
# Sets global variables: unique_from_main, unique_from_develop, unique_from_refactor
get_unique_commits() {
	local branch=$1
	# Use variables that will be set in caller's scope
	unique_from_main=$(git log origin/main..origin/"$branch" --oneline 2>/dev/null | wc -l)
	unique_from_develop=$(git log origin/develop..origin/"$branch" --oneline 2>/dev/null | wc -l)
	unique_from_refactor=$(git log origin/refactor..origin/"$branch" --oneline 2>/dev/null | wc -l)
}

# Function to find minimum unique commits and comparison base
# Requires: unique_from_main, unique_from_develop, unique_from_refactor to be set
# Sets: min_unique, compared_to
find_min_unique() {
	min_unique=$unique_from_main
	compared_to="main"
	if [ "$unique_from_develop" -lt "$min_unique" ]; then
		min_unique=$unique_from_develop
		compared_to="develop"
	fi
	if [ "$unique_from_refactor" -lt "$min_unique" ]; then
		min_unique=$unique_from_refactor
		compared_to="refactor"
	fi
}

echo ""
echo -e "${YELLOW}📋 Branches with Unmerged Work (should be reviewed, NOT deleted):${NC}"
UNMERGED_BRANCHES=(
	"copilot/execute-ui-audit-simplification"
	"copilot/sub-pr-43"
	"copilot/sub-pr-43-again"
	"copilot/reorganize-documentation-structure"
)

for branch in "${UNMERGED_BRANCHES[@]}"; do
	if branch_exists "$branch"; then
		# Get the minimum number of unique commits across main, develop, and refactor
		get_unique_commits "$branch"
		find_min_unique
		
		echo -e "  ${CYAN}ℹ${NC} $branch (${min_unique} unique commits vs ${compared_to})"
	fi
done

echo ""
echo -e "${RED}🗑️  Obsolete Branches (safe to delete):${NC}"

# Check which branches actually exist
EXISTING_BRANCHES=()
for branch in "${ALL_CLEANUP_BRANCHES[@]}"; do
	if branch_exists "$branch"; then
		EXISTING_BRANCHES+=("$branch")
		# Check why it's obsolete - compare against main, develop, and refactor
		get_unique_commits "$branch"
		find_min_unique
		
		if [ "$unique_from_main" -eq 0 ]; then
			echo -e "  ${GREEN}✓${NC} $branch (all commits in main)"
		elif [ "$unique_from_develop" -eq 0 ]; then
			echo -e "  ${GREEN}✓${NC} $branch (all commits in develop)"
		elif [ "$unique_from_refactor" -eq 0 ]; then
			echo -e "  ${GREEN}✓${NC} $branch (all commits in refactor)"
		else
			echo -e "  ${YELLOW}⚠${NC} $branch (${min_unique} unique commits vs ${compared_to} - verify manually)"
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
