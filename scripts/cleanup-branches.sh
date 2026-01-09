#!/bin/bash

# Branch Cleanup Script for Lumina Portfolio
# This script dynamically identifies and deletes branches merged into develop

set -e

echo "🧹 Branch Cleanup Script (Dynamic)"
echo "=================================="
echo ""

# Configuration
TARGET_BRANCH="origin/develop"
PROTECTED_BRANCHES=("main" "master" "develop" "dev" "HEAD" "origin/main" "origin/master" "origin/develop" "origin/HEAD")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to check if a branch is protected
is_protected() {
    local branch="$1"
    for protected in "${PROTECTED_BRANCHES[@]}"; do
        if [[ "$branch" == *"$protected" ]]; then
            return 0
        fi
    done
    return 1
}

# Fetch latest from remote to ensure accurate status
echo -e "${BLUE}📡 Fetching latest from remote...${NC}"
git fetch origin --prune
echo ""

echo -e "${BLUE}🔍 Identifying branches merged into ${TARGET_BRANCH}...${NC}"
echo ""

# Find merged remote branches
# 1. Get remote branches merged into target
# 2. Clean up output (remove indentation)
# 3. Filter out protected branches
MERGED_BRANCHES=()
while IFS= read -r branch; do
    # Remove leading spaces/tabs and 'origin/' prefix for display if desired,
    # but for `git push delete` we need the full remote refs usually or just the name.
    # `git branch -r` returns "origin/branchname".
    cleaned_branch=$(echo "$branch" | sed 's/^[[:space:]]*//')

    if ! is_protected "$cleaned_branch"; then
        MERGED_BRANCHES+=("$cleaned_branch")
    fi
done < <(git branch -r --merged "$TARGET_BRANCH")

if [ ${#MERGED_BRANCHES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ No obsolete merged branches found!${NC}"
    exit 0
fi

echo -e "${YELLOW}Found ${#MERGED_BRANCHES[@]} branches that can be safely deleted:${NC}"
for branch in "${MERGED_BRANCHES[@]}"; do
    echo "  - $branch"
done

echo ""
echo -e "${RED}WARNING: This will permanently delete these ${#MERGED_BRANCHES[@]} remote branches!${NC}"
=======
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
>>>>>>> origin/main
echo ""
read -p "Do you want to proceed with deletion? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy]([Ee][Ss])?$ ]]; then
<<<<<<< HEAD
    echo "❌ Cleanup cancelled."
    exit 0
fi

# Delete branches
echo -e "${BLUE}🗑️  Deleting branches...${NC}"
=======
	echo "❌ Cleanup cancelled."
	exit 0
fi

# Delete branches
echo "🗑️  Deleting branches..."
>>>>>>> origin/main
echo ""

DELETED_COUNT=0
FAILED_COUNT=0

<<<<<<< HEAD
for branch in "${MERGED_BRANCHES[@]}"; do
    # Strip 'origin/' component for the actual push delete command which finds ref by name
    # or use the full refspec. usually `git push origin --delete branch_name` works.
    branch_name=${branch#origin/}

    echo -n "  Deleting $branch_name... "
    if git push origin --delete "$branch_name" 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    else
        echo -e "${RED}✗${NC}"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
=======
for branch in "${EXISTING_BRANCHES[@]}"; do
	echo -n "  Deleting $branch... "
	if git push origin --delete "$branch" 2>/dev/null; then
		echo -e "${GREEN}✓${NC}"
		DELETED_COUNT=$((DELETED_COUNT + 1))
	else
		echo -e "${RED}✗${NC}"
		FAILED_COUNT=$((FAILED_COUNT + 1))
	fi
>>>>>>> origin/main
done

echo ""
echo "📈 Summary:"
<<<<<<< HEAD
echo -e "  ${GREEN}Deleted: $DELETED_COUNT${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "  ${RED}Failed: $FAILED_COUNT${NC}"
=======
echo "  ${GREEN}Deleted: $DELETED_COUNT${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
	echo "  ${RED}Failed: $FAILED_COUNT${NC}"
>>>>>>> origin/main
fi

echo ""
echo "✨ Cleanup complete!"
echo ""
<<<<<<< HEAD
echo "💡 Tip: Run 'git remote prune origin' to clean up any remaining stale references."
=======
echo "💡 Tip: Run 'git remote prune origin' to clean up local references to deleted branches"
>>>>>>> origin/main
