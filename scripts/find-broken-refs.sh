#!/bin/bash

# Script de recherche des références aux anciens chemins de documentation
# Aide à identifier les liens qui doivent être mis à jour

set -e

echo "🔍 Searching for references to old documentation paths..."
echo ""

found=0

# Function to search and display results
search_pattern() {
	local pattern="$1"
	local replacement="$2"
	local description="$3"
	
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	echo "📁 $description"
	echo "   Pattern: $pattern"
	echo "   Should be: $replacement"
	echo ""
	
	# Search excluding audit/cleanup docs and archives
	local results=$(grep -r "$pattern" . --include="*.md" \
		| grep -v "AUDIT" \
		| grep -v "CLEANUP" \
		| grep -v "MIGRATION" \
		| grep -v "ARCHIVES" \
		| grep -v "$replacement" \
		|| true)
	
	if [ -n "$results" ]; then
		echo "$results" | while IFS= read -r line; do
			echo "  ❌ $line"
			found=$((found + 1))
		done
		echo ""
	else
		echo "  ✅ No references found"
		echo ""
	fi
}

# Search for old documentation paths
search_pattern \
	"docs/architecture" \
	"docs/guides/architecture" \
	"References to OLD architecture path"

search_pattern \
	"docs/features" \
	"docs/guides/features" \
	"References to OLD features path"

search_pattern \
	"docs/project" \
	"docs/guides/project" \
	"References to OLD project path"

# Search for references to deleted files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 Checking for references to potentially deleted files"
echo ""

deleted_files=(
	"docs/architecture/"
	"docs/features/"
	"docs/project/"
)

for path in "${deleted_files[@]}"; do
	results=$(grep -r "$path" . --include="*.md" \
		| grep -v "AUDIT" \
		| grep -v "CLEANUP" \
		| grep -v "MIGRATION" \
		| grep -v "ARCHIVES" \
		|| true)
	
	if [ -n "$results" ]; then
		echo "  Found references to: $path"
		found=$((found + 1))
	fi
done

echo ""
echo "================================================"
echo "📊 Summary:"
if [ $found -eq 0 ]; then
	echo "  ✅ No old references found!"
else
	echo "  ❌ Found references to old paths"
	echo "  📝 These should be updated to new paths"
fi
echo "================================================"
echo ""

if [ $found -eq 0 ]; then
	echo "✅ All references are up to date!"
	exit 0
else
	echo "💡 Next steps:"
	echo "   1. Review the references above"
	echo "   2. Update them to new paths in docs/guides/"
	echo "   3. See docs/DOCUMENTATION_MIGRATION_GUIDE.md for mapping"
	exit 1
fi
