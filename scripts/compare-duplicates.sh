#!/bin/bash

# Script de comparaison des fichiers dupliqués
# Compare les fichiers dans docs/ avec ceux dans docs/guides/

set -e

echo "🔍 Comparing duplicate documentation files..."
echo ""

total_files=0
identical=0
different=0
missing=0

# Function to compare two files
compare_files() {
	local file1="$1"
	local file2="$2"
	local label="$3"
	
	total_files=$((total_files + 1))
	
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	echo "📄 $label"
	echo "   Old: $file1"
	echo "   New: $file2"
	
	if [ ! -f "$file1" ]; then
		echo "  ⚠️  Old file doesn't exist (already deleted?)"
		missing=$((missing + 1))
		echo ""
		return
	fi
	
	if [ ! -f "$file2" ]; then
		echo "  ⚠️  New file doesn't exist"
		missing=$((missing + 1))
		echo ""
		return
	fi
	
	if diff -q "$file1" "$file2" > /dev/null 2>&1; then
		echo "  ✅ IDENTICAL (safe to delete old)"
		identical=$((identical + 1))
	else
		echo "  ⚠️  DIFFERENT (need to review!)"
		echo "     Size old: $(wc -c < "$file1") bytes"
		echo "     Size new: $(wc -c < "$file2") bytes"
		echo "     Last modified old: $(stat -c %y "$file1" 2>/dev/null || stat -f %Sm "$file1" 2>/dev/null)"
		echo "     Last modified new: $(stat -c %y "$file2" 2>/dev/null || stat -f %Sm "$file2" 2>/dev/null)"
		different=$((different + 1))
	fi
	echo ""
}

# Compare architecture files
echo "🏗️  ARCHITECTURE FILES"
echo "════════════════════════════════════════════════════"
echo ""

if [ -d "docs/architecture" ]; then
	for file in docs/architecture/*.md; do
		if [ -f "$file" ]; then
			basename_file=$(basename "$file")
			compare_files "$file" "docs/guides/architecture/$basename_file" "$basename_file"
		fi
	done
else
	echo "  ℹ️  docs/architecture/ doesn't exist (already cleaned?)"
	echo ""
fi

# Compare features files
echo "✨ FEATURES FILES"
echo "════════════════════════════════════════════════════"
echo ""

if [ -d "docs/features" ]; then
	for file in docs/features/*.md; do
		if [ -f "$file" ]; then
			basename_file=$(basename "$file")
			if [ -f "docs/guides/features/$basename_file" ]; then
				compare_files "$file" "docs/guides/features/$basename_file" "$basename_file"
			else
				echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
				echo "📄 $basename_file"
				echo "  📦 UNIQUE FILE (needs to be moved to guides/features/)"
				echo "     File: $file"
				total_files=$((total_files + 1))
				echo ""
			fi
		fi
	done
else
	echo "  ℹ️  docs/features/ doesn't exist (already cleaned?)"
	echo ""
fi

# Compare project files
echo "📁 PROJECT FILES"
echo "════════════════════════════════════════════════════"
echo ""

if [ -d "docs/project" ]; then
	for file in docs/project/*.md; do
		if [ -f "$file" ]; then
			basename_file=$(basename "$file")
			if [ -f "docs/guides/project/$basename_file" ]; then
				compare_files "$file" "docs/guides/project/$basename_file" "$basename_file"
			else
				echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
				echo "📄 $basename_file"
				echo "  📦 UNIQUE FILE (needs to be moved to guides/project/)"
				echo "     File: $file"
				total_files=$((total_files + 1))
				echo ""
			fi
		fi
	done
	
	# Check KnowledgeBase
	if [ -d "docs/project/KnowledgeBase" ]; then
		echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
		echo "📚 KnowledgeBase Directory"
		kb_count=$(find docs/project/KnowledgeBase -name "*.md" | wc -l)
		echo "  Found $kb_count files in docs/project/KnowledgeBase/"
		
		if [ -d "docs/guides/project/KnowledgeBase" ]; then
			guides_kb_count=$(find docs/guides/project/KnowledgeBase -name "*.md" | wc -l)
			echo "  Found $guides_kb_count files in docs/guides/project/KnowledgeBase/"
			
			if [ "$kb_count" -eq "$guides_kb_count" ]; then
				echo "  ✅ Same number of files (likely duplicates)"
			else
				echo "  ⚠️  Different number of files!"
			fi
		fi
		echo ""
	fi
else
	echo "  ℹ️  docs/project/ doesn't exist (already cleaned?)"
	echo ""
fi

# Summary
echo "════════════════════════════════════════════════════"
echo "📊 SUMMARY"
echo "════════════════════════════════════════════════════"
echo "Total files compared: $total_files"
echo "  ✅ Identical: $identical (safe to delete old)"
echo "  ⚠️  Different: $different (review needed!)"
echo "  ❓ Missing: $missing"
echo ""

if [ $different -gt 0 ]; then
	echo "⚠️  WARNING: Found $different file(s) with differences!"
	echo "   Review these files before deleting the old versions"
	echo "   The newer version should be kept"
	echo ""
fi

if [ $identical -gt 0 ]; then
	echo "✅ $identical file(s) are identical and safe to delete"
	echo ""
fi

if [ $missing -eq $total_files ]; then
	echo "🎉 All old files have been cleaned up!"
	exit 0
elif [ $different -eq 0 ]; then
	echo "✅ All compared files are identical - safe to proceed with cleanup"
	exit 0
else
	echo "⚠️  Review needed before cleanup"
	exit 1
fi
