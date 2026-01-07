#!/usr/bin/env python3
"""
Documentation Index Builder for RAG System

This script scans all markdown files in the docs directory,
extracts metadata and content, and builds a searchable index
for the RAG documentation agent.

Usage:
    python scripts/rag/build_doc_index.py
"""

import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any


class DocumentationIndexBuilder:
	"""Builds searchable index from markdown documentation files."""

	def __init__(self, docs_root: str = "docs"):
		"""
		Initialize the index builder.

		Args:
			docs_root: Root directory containing documentation
		"""
		self.docs_root = Path(docs_root)
		self.documents: List[Dict[str, Any]] = []
		self.metadata: Dict[str, Any] = {}
		self.all_keywords: Counter = Counter()

	def should_exclude(self, file_path: Path) -> bool:
		"""
		Check if a file should be excluded from indexing.

		Args:
			file_path: Path to check

		Returns:
			True if file should be excluded
		"""
		exclude_patterns = [
			".doc-",  # Generated index files
			".tmp",
			".temp",
			".backup",
			".bak",
		]

		# Exclude files matching patterns
		for pattern in exclude_patterns:
			if pattern in str(file_path):
				return True

		# Exclude hidden files (except .github)
		if file_path.name.startswith(".") and file_path.name != ".github":
			return True

		return False

	def determine_priority(self, file_path: Path) -> str:
		"""
		Determine priority level of a document.

		Args:
			file_path: Path to the document

		Returns:
			Priority level: critical, high, normal, or archive
		"""
		path_str = str(file_path).lower()

		# Critical documents
		if any(
			pattern in path_str
			for pattern in [
				"architecture",
				"security",
				"tag_system_architecture",
			]
		):
			return "critical"

		# High priority documents
		if any(
			pattern in path_str
			for pattern in [
				"guide",
				"implementation",
				"components",
				"guides/",
			]
		):
			return "high"

		# Archive documents
		if "archives" in path_str or "old" in path_str or "deprecated" in path_str:
			return "archive"

		# Default priority
		return "normal"

	def extract_markdown_sections(self, content: str) -> List[Dict[str, Any]]:
		"""
		Extract sections from markdown content.

		Args:
			content: Markdown content

		Returns:
			List of sections with title, level, and content
		"""
		sections = []
		current_section = None

		# Split by lines
		lines = content.split("\n")

		for line in lines:
			# Check for markdown heading
			heading_match = re.match(r"^(#{1,6})\s+(.+)$", line)

			if heading_match:
				# Save previous section
				if current_section:
					sections.append(current_section)

				# Start new section
				level = len(heading_match.group(1))
				title = heading_match.group(2).strip()

				current_section = {
					"title": title,
					"level": level,
					"content": "",
					"line_start": len(sections),
				}
			elif current_section:
				# Add line to current section
				current_section["content"] += line + "\n"

		# Add last section
		if current_section:
			sections.append(current_section)

		return sections

	def extract_keywords(self, text: str, max_keywords: int = 50) -> List[str]:
		"""
		Extract keywords from text.

		Args:
			text: Text to analyze
			max_keywords: Maximum number of keywords to return

		Returns:
			List of keywords sorted by frequency
		"""
		# Remove markdown syntax
		text = re.sub(r"[#*`\[\]()]", " ", text)

		# Split into words
		words = re.findall(r"\b\w+\b", text.lower())

		# Filter out common words and short words
		stop_words = {
			"the",
			"a",
			"an",
			"and",
			"or",
			"but",
			"in",
			"on",
			"at",
			"to",
			"for",
			"of",
			"with",
			"by",
			"from",
			"as",
			"is",
			"are",
			"was",
			"were",
			"be",
			"been",
			"being",
			"have",
			"has",
			"had",
			"do",
			"does",
			"did",
			"will",
			"would",
			"should",
			"could",
			"may",
			"might",
			"can",
			"this",
			"that",
			"these",
			"those",
			"it",
			"its",
			"de",
			"la",
			"le",
			"les",
			"un",
			"une",
			"des",
			"et",
			"ou",
			"dans",
			"pour",
			"avec",
			"par",
			"sur",
		}

		filtered_words = [
			word for word in words if len(word) > 3 and word not in stop_words
		]

		# Count frequency
		word_counts = Counter(filtered_words)

		# Return top keywords
		return [word for word, _ in word_counts.most_common(max_keywords)]

	def process_document(self, file_path: Path) -> Dict[str, Any]:
		"""
		Process a single markdown document.

		Args:
			file_path: Path to the markdown file

		Returns:
			Document metadata and content
		"""
		# Read file
		try:
			with open(file_path, "r", encoding="utf-8") as f:
				content = f.read()
		except Exception as e:
			print(f"⚠️  Error reading {file_path}: {e}")
			return None

		# Get file stats
		stats = file_path.stat()

		# Extract sections
		sections = self.extract_markdown_sections(content)

		# Extract keywords
		keywords = self.extract_keywords(content, max_keywords=50)

		# Update global keywords
		self.all_keywords.update(keywords)

		# Determine priority
		priority = self.determine_priority(file_path)

		# Get relative path
		rel_path = file_path.relative_to(self.docs_root.parent)

		# Extract title (first H1 or filename)
		title = file_path.stem
		for section in sections:
			if section["level"] == 1:
				title = section["title"]
				break

		document = {
			"path": str(rel_path),
			"title": title,
			"priority": priority,
			"size": stats.st_size,
			"modified": datetime.fromtimestamp(stats.st_mtime).isoformat(),
			"sections": sections,
			"keywords": keywords,
			"word_count": len(content.split()),
			"heading_count": len(sections),
		}

		return document

	def build_index(self) -> None:
		"""Build the complete documentation index."""
		print("🔨 Building documentation index...")

		# Find all markdown files
		md_files = list(self.docs_root.rglob("*.md"))
		print(f"📁 Found {len(md_files)} markdown files")

		# Process each file
		for file_path in md_files:
			# Skip excluded files
			if self.should_exclude(file_path):
				print(f"⏭️  Skipping {file_path}")
				continue

			print(f"📄 Processing {file_path}")
			document = self.process_document(file_path)

			if document:
				self.documents.append(document)

		print(f"✅ Processed {len(self.documents)} documents")

		# Build metadata
		self.metadata = {
			"version": "1.0.0",
			"generated": datetime.now().isoformat(),
			"total_documents": len(self.documents),
			"priority_breakdown": self._count_by_priority(),
			"total_sections": sum(doc["heading_count"] for doc in self.documents),
			"total_words": sum(doc["word_count"] for doc in self.documents),
			"top_keywords": [
				word for word, _ in self.all_keywords.most_common(100)
			],
		}

	def _count_by_priority(self) -> Dict[str, int]:
		"""Count documents by priority level."""
		counts = {"critical": 0, "high": 0, "normal": 0, "archive": 0}

		for doc in self.documents:
			priority = doc.get("priority", "normal")
			counts[priority] = counts.get(priority, 0) + 1

		return counts

	def save_index(self, output_path: str = "docs/.doc-index.json") -> None:
		"""
		Save the complete index to JSON file.

		Args:
			output_path: Path to save the index
		"""
		output_file = Path(output_path)

		# Create full index
		full_index = {
			"metadata": self.metadata,
			"documents": self.documents,
		}

		# Save to file
		with open(output_file, "w", encoding="utf-8") as f:
			json.dump(full_index, f, indent=2, ensure_ascii=False)

		print(f"💾 Saved full index to {output_file}")
		print(f"📊 Size: {output_file.stat().st_size / 1024:.2f} KB")

	def save_metadata(self, output_path: str = "docs/.doc-metadata.json") -> None:
		"""
		Save simplified metadata (without full content) for version control.

		Args:
			output_path: Path to save the metadata
		"""
		output_file = Path(output_path)

		# Create simplified documents list (without section content)
		simplified_docs = []
		for doc in self.documents:
			simplified_doc = {
				"path": doc["path"],
				"title": doc["title"],
				"priority": doc["priority"],
				"modified": doc["modified"],
				"keywords": doc["keywords"][:10],  # Top 10 keywords only
				"word_count": doc["word_count"],
				"heading_count": doc["heading_count"],
				"section_titles": [s["title"] for s in doc["sections"]],
			}
			simplified_docs.append(simplified_doc)

		# Create metadata file
		metadata_output = {
			"metadata": self.metadata,
			"documents": simplified_docs,
		}

		# Save to file
		with open(output_file, "w", encoding="utf-8") as f:
			json.dump(metadata_output, f, indent=2, ensure_ascii=False)

		print(f"💾 Saved metadata to {output_file}")
		print(f"📊 Size: {output_file.stat().st_size / 1024:.2f} KB")

	def print_statistics(self) -> None:
		"""Print index statistics."""
		print("\n📊 Index Statistics:")
		print(f"  Total documents: {self.metadata['total_documents']}")
		print(f"  Total sections: {self.metadata['total_sections']}")
		print(f"  Total words: {self.metadata['total_words']:,}")
		print("\n  Priority breakdown:")
		for priority, count in self.metadata["priority_breakdown"].items():
			print(f"    {priority.capitalize()}: {count}")
		print(f"\n  Top 10 keywords:")
		for i, keyword in enumerate(self.metadata["top_keywords"][:10], 1):
			print(f"    {i}. {keyword}")


def main():
	"""Main entry point."""
	print("🤖 Documentation Index Builder - Lumina Portfolio RAG System\n")

	# Create builder
	builder = DocumentationIndexBuilder(docs_root="docs")

	# Build index
	builder.build_index()

	# Save files
	builder.save_index()
	builder.save_metadata()

	# Print statistics
	builder.print_statistics()

	print("\n✅ Index building complete!")


if __name__ == "__main__":
	main()
