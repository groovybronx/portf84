#!/bin/bash

# Script de validation des liens de documentation
# Vérifie que tous les liens relatifs dans les fichiers Markdown sont valides

set -e

echo "📋 Validating documentation links..."
echo ""

errors=0
checked=0

# Fonction pour résoudre les chemins relatifs
resolve_path() {
	local base_dir="$1"
	local link="$2"
	
	# Remove anchor
	link="${link%%#*}"
	
	# If empty after removing anchor, it's an anchor-only link
	if [ -z "$link" ]; then
		return 0
	fi
	
	# Resolve relative path
	local target="$base_dir/$link"
	
	# Normalize path
	if command -v realpath &> /dev/null; then
		target=$(realpath -m "$target" 2>/dev/null || echo "$target")
	else
		# Fallback for systems without realpath
		target=$(cd "$(/usr/bin/dirname "$target")" 2>/dev/null && pwd)/$(/usr/bin/basename "$target") || echo "$target"
	fi
	
	echo "$target"
}

# Find all markdown files (excluding ARCHIVES and some AUDIT files)
while IFS= read -r -d '' file; do
	# Skip certain directories
	if [[ $file == *"/ARCHIVES/"* ]] || [[ $file == *"/AUDIT/archive"* ]]; then
		continue
	fi
	
	echo "Checking $file..."
	
	# Extract markdown links [text](path)
	while IFS= read -r link; do
		checked=$((checked + 1))
		
		# Skip external links, mailto, and anchor-only links
		if [[ $link == http* ]] || [[ $link == mailto:* ]]; then
			continue
		fi
		
		# Skip anchor-only links (starting with #)
		if [[ $link == \#* ]]; then
			continue
		fi
		
		# Remove anchor to get file path
		link_path="${link%%#*}"
		
		# If empty after removing anchor, skip
		if [ -z "$link_path" ]; then
			continue
		fi
		
		# Resolve relative path
		dir=$(/usr/bin/dirname "$file")
		target=$(resolve_path "$dir" "$link_path")
		
		# Check if target exists
		if [[ ! -e "$target" ]]; then
			echo "  ❌ BROKEN: $link"
			echo "     File: $file"
			echo "     Target: $target"
			errors=$((errors + 1))
		fi
	done < <(/usr/bin/perl -ne 'while (/\[.*?\]\(([^)]+)\)/g) { print "$1\n" }' "$file")
	
done < <(/usr/bin/find . -type d \( -name "node_modules" -o -name ".gemini" -o -name ".git" \) -prune -o -name "*.md" -type f -print0 2>/dev/null)

echo ""
echo "================================================"
echo "📊 Summary:"
echo "  Links checked: $checked"
echo "  Broken links: $errors"
echo "================================================"
echo ""

if [ $errors -eq 0 ]; then
	echo "✅ All links are valid!"
	exit 0
else
	echo "❌ Found $errors broken link(s)"
	echo ""
	echo "💡 Tip: Check the audit document for migration guide:"
	echo "   docs/DOCUMENTATION_MIGRATION_GUIDE.md"
	exit 1
fi
