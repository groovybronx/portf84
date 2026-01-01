#!/bin/bash

# GitHub Configuration Maintenance Script
# This script validates and maintains .github configuration files
#
# Usage:
#   ./maintain-github-config.sh           # Validation mode (default)
#   ./maintain-github-config.sh --check   # Same as default
#   ./maintain-github-config.sh --fix     # Interactive fix mode
#   ./maintain-github-config.sh --help    # Show help

# Don't exit on error immediately - we want to collect all issues
set +e

# Parse command line arguments
MODE="check"
if [ "$#" -gt 0 ]; then
	case "$1" in
		--check)
			MODE="check"
			;;
		--fix)
			MODE="fix"
			;;
		--help|-h)
			echo "GitHub Configuration Maintenance Script"
			echo ""
			echo "Usage:"
			echo "  $0              # Validation mode (default)"
			echo "  $0 --check      # Same as default"
			echo "  $0 --fix        # Interactive fix mode"
			echo "  $0 --help       # Show this help"
			echo ""
			exit 0
			;;
		*)
			echo "Unknown option: $1"
			echo "Use --help for usage information"
			exit 1
			;;
	esac
fi

echo "🔧 GitHub Configuration Maintenance"
if [ "$MODE" = "fix" ]; then
	echo "    (Interactive Fix Mode)"
fi
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Counters for reporting
WARNINGS=0
ERRORS=0
CHECKS=0

# Helper functions
offer_fix() {
	local description="$1"
	local fix_command="$2"
	
	if [ "$MODE" = "fix" ]; then
		echo ""
		read -p "  Would you like to fix this? (y/n): " -r
		if [[ $REPLY =~ ^[Yy]$ ]]; then
			# Capture both stdout and stderr from the fix command for better diagnostics
			local fix_output
			fix_output=$(eval "$fix_command" 2>&1)
			local fix_status=$?
			if [ "$fix_status" -eq 0 ]; then
				echo -e "  ${GREEN}✓${NC} Fixed: $description"
			else
				echo -e "  ${RED}✗${NC} Failed to fix: $description (exit code: $fix_status)"
				if [ -n "$fix_output" ]; then
					echo "    Command: $fix_command"
					echo "    Output:"
					# Indent the captured output for readability
					printf '      %s\n' "$fix_output"
				fi
			fi
		fi
	fi
}

check_passed() {
	echo -e "  ${GREEN}✓${NC} $1"
	((CHECKS++))
}

check_warning() {
	echo -e "  ${YELLOW}⚠${NC} $1"
	((WARNINGS++))
	((CHECKS++))
}

check_error() {
	echo -e "  ${RED}✗${NC} $1"
	((ERRORS++))
	((CHECKS++))
}

section_header() {
	echo ""
	echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
	echo -e "${PURPLE}$1${NC}"
	echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Change to repository root
cd "$(git rev-parse --show-toplevel)" || exit 1

# Check if .github directory exists
if [ ! -d ".github" ]; then
	echo -e "${RED}✗ Error: .github directory not found!${NC}"
	exit 1
fi

section_header "1️⃣  Checking Core Configuration Files"

# Check copilot-instructions.md
if [ -f ".github/copilot-instructions.md" ]; then
	check_passed "copilot-instructions.md exists"
	
	# Check file size (should be substantial)
	FILE_SIZE=$(wc -c < ".github/copilot-instructions.md")
	if [ "$FILE_SIZE" -lt 1000 ]; then
		check_warning "copilot-instructions.md seems too small ($FILE_SIZE bytes)"
	else
		check_passed "copilot-instructions.md has adequate content ($FILE_SIZE bytes)"
	fi
else
	check_error "copilot-instructions.md is missing"
fi

# Check copilot-rules.json
if [ -f ".github/copilot-rules.json" ]; then
	check_passed "copilot-rules.json exists"
	
	# Validate JSON syntax
	if jq empty .github/copilot-rules.json 2>/dev/null; then
		check_passed "copilot-rules.json has valid JSON syntax"
		
		# Check for required fields
		if jq -e '.rules' .github/copilot-rules.json >/dev/null 2>&1; then
			RULE_COUNT=$(jq '.rules | length' .github/copilot-rules.json)
			check_passed "copilot-rules.json has $RULE_COUNT rule(s) defined"
		else
			check_error "copilot-rules.json missing 'rules' field"
		fi
	else
		check_error "copilot-rules.json has invalid JSON syntax"
	fi
else
	check_error "copilot-rules.json is missing"
fi

# Check copilot-settings.json
if [ -f ".github/copilot-settings.json" ]; then
	check_passed "copilot-settings.json exists"
	
	# Validate JSON syntax
	if jq empty .github/copilot-settings.json 2>/dev/null; then
		check_passed "copilot-settings.json has valid JSON syntax"
	else
		check_error "copilot-settings.json has invalid JSON syntax"
	fi
else
	check_error "copilot-settings.json is missing"
fi

section_header "2️⃣  Checking Agents Directory"

# Check agents directory
if [ -d ".github/agents" ]; then
	check_passed "agents directory exists"
	
	# List agent files
	AGENT_FILES=$(find .github/agents -name "*.md" -type f | wc -l)
	check_passed "Found $AGENT_FILES agent file(s)"
	
	# Check for README
	if [ -f ".github/agents/README.md" ]; then
		check_passed "agents/README.md exists"
	else
		check_warning "agents/README.md is missing"
	fi
	
	# List all agent files
	echo ""
	echo "  Agent files:"
	find .github/agents -name "*.md" -type f | while read -r file; do
		BASENAME=$(basename "$file")
		SIZE=$(wc -c < "$file")
		if [ "$SIZE" -lt 500 ]; then
			echo -e "    ${YELLOW}⚠${NC} $BASENAME (${SIZE} bytes - possibly incomplete)"
		else
			echo -e "    ${GREEN}✓${NC} $BASENAME (${SIZE} bytes)"
		fi
	done
else
	check_error "agents directory is missing"
fi

section_header "3️⃣  Checking Copilot Rules Directory"

# Check copilot directory
if [ -d ".github/copilot" ]; then
	check_passed "copilot directory exists"
	
	# List rule files
	RULE_FILES=$(find .github/copilot -name "*.md" -type f | wc -l)
	check_passed "Found $RULE_FILES rule file(s)"
	
	# Check for README
	if [ -f ".github/copilot/README.md" ]; then
		check_passed "copilot/README.md exists"
	else
		check_warning "copilot/README.md is missing"
	fi
	
	# List all rule files
	echo ""
	echo "  Rule files:"
	find .github/copilot -name "*.md" -type f | while read -r file; do
		BASENAME=$(basename "$file")
		SIZE=$(wc -c < "$file")
		if [ "$SIZE" -lt 500 ]; then
			echo -e "    ${YELLOW}⚠${NC} $BASENAME (${SIZE} bytes - possibly incomplete)"
		else
			echo -e "    ${GREEN}✓${NC} $BASENAME (${SIZE} bytes)"
		fi
	done
else
	check_error "copilot directory is missing"
fi

section_header "4️⃣  Checking Workflows Directory"

# Check workflows directory
if [ -d ".github/workflows" ]; then
	check_passed "workflows directory exists"
	
	# List workflow files
	WORKFLOW_FILES=$(find .github/workflows -name "*.yml" -o -name "*.yaml" | wc -l)
	check_passed "Found $WORKFLOW_FILES workflow file(s)"
	
	# Check each workflow for syntax
	echo ""
	echo "  Workflow files:"
	find .github/workflows \( -name "*.yml" -o -name "*.yaml" \) -type f | while read -r file; do
		BASENAME=$(basename "$file")
		
		# Basic YAML validation (check for 'name:' field)
		if grep -q "^name:" "$file"; then
			echo -e "    ${GREEN}✓${NC} $BASENAME"
		else
			echo -e "    ${YELLOW}⚠${NC} $BASENAME (missing 'name:' field)"
		fi
	done
else
	check_warning "workflows directory is missing"
fi

section_header "5️⃣  Checking Additional Configuration"

# Check for other important files
if [ -f ".github/CODEOWNERS" ]; then
	check_passed "CODEOWNERS file exists"
else
	check_warning "CODEOWNERS file is missing"
fi

if [ -f ".github/PULL_REQUEST_TEMPLATE.md" ]; then
	check_passed "PULL_REQUEST_TEMPLATE.md exists"
else
	check_warning "PULL_REQUEST_TEMPLATE.md is missing"
fi

if [ -d ".github/ISSUE_TEMPLATE" ]; then
	check_passed "ISSUE_TEMPLATE directory exists"
	ISSUE_TEMPLATES=$(find .github/ISSUE_TEMPLATE -name "*.md" -type f | wc -l)
	check_passed "Found $ISSUE_TEMPLATES issue template(s)"
else
	check_warning "ISSUE_TEMPLATE directory is missing"
fi

section_header "6️⃣  Consistency Checks"

# Check if copilot-instructions.md references exist in copilot-rules.json
if [ -f ".github/copilot-instructions.md" ] && [ -f ".github/copilot-rules.json" ]; then
	# Extract rule names from JSON
	RULE_NAMES=$(jq -r '.rules[].name' .github/copilot-rules.json 2>/dev/null || echo "")
	
	if [ -n "$RULE_NAMES" ]; then
		check_passed "Successfully extracted rule names from copilot-rules.json"
		
		# Check if key terms from instructions exist in rules (case-insensitive)
		if grep -qi "TypeScript" .github/copilot-instructions.md && echo "$RULE_NAMES" | grep -qi "typescript"; then
			check_passed "TypeScript conventions are documented in both files"
		fi
		
		if grep -qi "Rust" .github/copilot-instructions.md && echo "$RULE_NAMES" | grep -qi "rust"; then
			check_passed "Rust conventions are documented in both files"
		fi
	fi
fi

# Check if agent files are referenced in agents/README.md
if [ -f ".github/agents/README.md" ]; then
	while IFS= read -r -d '' agent_file; do
		BASENAME=$(basename "$agent_file")
		if grep -q "$BASENAME" .github/agents/README.md; then
			check_passed "Agent $BASENAME is documented in README"
		else
			check_warning "Agent $BASENAME is not referenced in README"
		fi
	done < <(find .github/agents -name "*.md" -not -name "README.md" -type f -print0)
fi

# Summary Report
section_header "📊 Summary Report"

echo ""
echo "  Total checks performed: ${BLUE}$CHECKS${NC}"
echo "  Errors found:          ${RED}$ERRORS${NC}"
echo "  Warnings found:        ${YELLOW}$WARNINGS${NC}"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
	echo -e "${GREEN}✅ All checks passed! GitHub configuration is healthy.${NC}"
	exit 0
elif [ "$ERRORS" -eq 0 ]; then
	echo -e "${YELLOW}⚠️  Configuration is functional but has $WARNINGS warning(s).${NC}"
	echo "   Consider addressing these for optimal configuration."
	exit 0
else
	echo -e "${RED}❌ Configuration has $ERRORS error(s) that should be addressed.${NC}"
	exit 1
fi
