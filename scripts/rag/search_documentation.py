#!/usr/bin/env python3
"""
Documentation Search Engine for RAG System

This script provides search functionality over the documentation index,
implementing lexical keyword search with word boundary detection and
multi-factor ranking.

Current implementation: Lexical keyword matching only
Future enhancement: Semantic search with embeddings (planned for v1.1)

Usage:
    python scripts/rag/search_documentation.py "your query here"
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Any
from collections import Counter


class DocumentationSearchEngine:
	"""Search engine for documentation with lexical keyword matching and priority-based ranking."""

	def __init__(self, index_path: str = "docs/.doc-index.json"):
		"""
		Initialize the search engine.

		Args:
			index_path: Path to the documentation index
		"""
		self.index_path = Path(index_path)
		self.index_data = None
		self.load_index()

	def load_index(self) -> None:
		"""Load the documentation index from file."""
		if not self.index_path.exists():
			raise FileNotFoundError(
				f"Index not found at {self.index_path}. "
				"Run 'python scripts/rag/build_doc_index.py' first."
			)

		with open(self.index_path, "r", encoding="utf-8") as f:
			self.index_data = json.load(f)

		# Be defensive about potentially missing metadata in the index file
		total_documents = 0
		if isinstance(self.index_data, dict):
			metadata = self.index_data.get("metadata")
			if isinstance(metadata, dict):
				total_documents = metadata.get("total_documents", 0)
			# Fallback: count documents array if metadata is missing
			if total_documents == 0:
				documents = self.index_data.get("documents", [])
				if isinstance(documents, list):
					total_documents = len(documents)

		print(f"📚 Loaded index with {total_documents} documents")

	def extract_query_keywords(self, query: str) -> List[str]:
		"""
		Extract keywords from a search query.

		Args:
			query: Search query string

		Returns:
			List of keywords
		"""
		# Remove special characters
		query = re.sub(r"[^\w\s]", " ", query.lower())

		# Split into words
		words = query.split()

		# Filter short words
		keywords = [word for word in words if len(word) > 2]

		return keywords

	def calculate_relevance_score(
		self, document: Dict[str, Any], query_keywords: List[str]
	) -> float:
		"""
		Calculate relevance score for a document using lexical keyword matching.

		Args:
			document: Document to score
			query_keywords: Keywords from the query

		Returns:
			Relevance score (0-1)
		"""
		if not query_keywords:
			return 0.0

		# Get document text for matching
		doc_title = document.get("title", "").lower()
		doc_keywords = [k.lower() for k in document.get("keywords", [])]
		doc_sections = document.get("sections", [])

		# 1. Title matching with word boundaries (weight: 0.3)
		title_matches = 0
		for kw in query_keywords:
			# Use word boundary regex to avoid partial matches
			if re.search(r'\b' + re.escape(kw) + r'\b', doc_title):
				title_matches += 1
		title_score = (title_matches / len(query_keywords)) * 0.3

		# 2. Keyword matching with word boundaries (weight: 0.3)
		keyword_matches = 0
		doc_keywords_text = " ".join(doc_keywords)
		for kw in query_keywords:
			if re.search(r'\b' + re.escape(kw) + r'\b', doc_keywords_text):
				keyword_matches += 1
		keyword_score = (keyword_matches / len(query_keywords)) * 0.3

		# 3. Section content matching with word boundaries (weight: 0.2)
		section_matches = 0
		for section in doc_sections:
			section_text = (
				section.get("title", "") + " " + section.get("content", "")
			).lower()
			for kw in query_keywords:
				if re.search(r'\b' + re.escape(kw) + r'\b', section_text):
					section_matches += 1

		max_possible_section_matches = len(query_keywords) * len(doc_sections)
		if max_possible_section_matches > 0:
			section_score = min(section_matches / max_possible_section_matches, 1.0) * 0.2
		else:
			section_score = 0.0

		# 4. Priority boost (weight: 0.2, normalized so critical = 0.2 max)
		priority_multipliers = {
			"critical": 2.0,
			"high": 1.5,
			"normal": 1.0,
			"archive": 0.3,
		}
		priority = document.get("priority", "normal")
		# Normalize by dividing by 2.0 so critical documents get full 0.2 weight
		priority_score = priority_multipliers.get(priority, 1.0) * 0.2 / 2.0

		# Calculate total score
		score = title_score + keyword_score + section_score + priority_score

		return min(score, 1.0)  # Cap at 1.0

	def find_matching_sections(
		self, document: Dict[str, Any], query_keywords: List[str], max_sections: int = 3
	) -> List[Dict[str, Any]]:
		"""
		Find the most relevant sections in a document.

		Args:
			document: Document to search
			query_keywords: Keywords from the query
			max_sections: Maximum number of sections to return

		Returns:
			List of matching sections with scores
		"""
		sections = document.get("sections", [])
		scored_sections = []

		for section in sections:
			section_text = (
				section.get("title", "") + " " + section.get("content", "")
			).lower()

			# Count keyword matches
			matches = sum(1 for kw in query_keywords if kw in section_text)

			if matches > 0:
				score = matches / len(query_keywords)
				scored_sections.append(
					{
						"section": section,
						"score": score,
						"matches": matches,
					}
				)

		# Sort by score
		scored_sections.sort(key=lambda x: x["score"], reverse=True)

		return scored_sections[:max_sections]

	def search(
		self, query: str, max_results: int = 5, min_score: float = 0.3
	) -> List[Dict[str, Any]]:
		"""
		Search the documentation index.

		Args:
			query: Search query string
			max_results: Maximum number of results to return
			min_score: Minimum relevance score threshold

		Returns:
			List of search results with scores
		"""
		# Extract keywords from query
		query_keywords = self.extract_query_keywords(query)

		if not query_keywords:
			print("⚠️  No valid keywords in query")
			return []

		print(f"🔍 Searching for: {', '.join(query_keywords)}")

		# Score all documents
		results = []
		for document in self.index_data["documents"]:
			score = self.calculate_relevance_score(document, query_keywords)

			if score >= min_score:
				# Find best matching sections
				matching_sections = self.find_matching_sections(
					document, query_keywords
				)

				results.append(
					{
						"document": document,
						"score": score,
						"matching_sections": matching_sections,
					}
				)

		# Sort by score
		results.sort(key=lambda x: x["score"], reverse=True)

		return results[:max_results]

	def find_related_documents(
		self, document_path: str, max_related: int = 3
	) -> List[Dict[str, Any]]:
		"""
		Find documents related to a given document.

		Args:
			document_path: Path to the reference document
			max_related: Maximum number of related documents

		Returns:
			List of related documents
		"""
		# Find the reference document
		ref_doc = None
		for doc in self.index_data["documents"]:
			if doc["path"] == document_path:
				ref_doc = doc
				break

		if not ref_doc:
			print(f"⚠️  Document not found: {document_path}")
			return []

		# Use document keywords to find related docs
		ref_keywords = ref_doc.get("keywords", [])[:10]  # Top 10 keywords

		# Search using reference keywords
		related = self.search(" ".join(ref_keywords), max_results=max_related + 1)

		# Remove the reference document itself
		related = [r for r in related if r["document"]["path"] != document_path]

		return related[:max_related]

	def format_result(self, result: Dict[str, Any]) -> str:
		"""
		Format a search result for display.

		Args:
			result: Search result to format

		Returns:
			Formatted string
		"""
		doc = result["document"]
		score = result["score"]
		sections = result["matching_sections"]

		output = []
		output.append(f"\n{'='*80}")
		output.append(f"📄 {doc['title']}")
		output.append(f"   Path: {doc['path']}")
		output.append(f"   Priority: {doc['priority'].upper()}")
		output.append(f"   Score: {score:.2%}")

		if sections:
			output.append(f"\n   Matching Sections:")
			for i, section_info in enumerate(sections, 1):
				section = section_info["section"]
				output.append(
					f"   {i}. {section['title']} (Level {section['level']}) - "
					f"{section_info['matches']} matches"
				)

				# Add excerpt
				content = section["content"][:150].strip()
				if content:
					output.append(f"      \"{content}...\"")

		return "\n".join(output)

	def get_statistics(self) -> Dict[str, Any]:
		"""
		Get index statistics.

		Returns:
			Dictionary with statistics
		"""
		if not self.index_data:
			return {}

		return self.index_data.get("metadata", {})


def main():
	"""Main entry point for command-line usage."""
	print("🔍 Documentation Search Engine - Lumina Portfolio RAG System\n")

	# Check for query argument
	if len(sys.argv) < 2:
		print("Usage: python search_documentation.py \"your search query\"")
		print("\nExample searches:")
		print("  python search_documentation.py \"tags system\"")
		print("  python search_documentation.py \"architecture\"")
		print("  python search_documentation.py \"Gemini API\"")
		sys.exit(1)

	query = " ".join(sys.argv[1:])

	try:
		# Create search engine
		engine = DocumentationSearchEngine()

		# Perform search
		results = engine.search(query, max_results=5)

		# Display results
		if not results:
			print(f"\n❌ No results found for: {query}")
			print("\nTry:")
			print("  - Using different keywords")
			print("  - Checking spelling")
			print("  - Using more general terms")
		else:
			print(f"\n✅ Found {len(results)} results:\n")

			for result in results:
				print(engine.format_result(result))

			# Show related documents for top result
			if results:
				top_doc_path = results[0]["document"]["path"]
				print(f"\n\n🔗 Related documents to '{results[0]['document']['title']}':")

				related = engine.find_related_documents(top_doc_path, max_related=3)
				for i, rel in enumerate(related, 1):
					rel_doc = rel["document"]
					print(
						f"  {i}. {rel_doc['title']} ({rel_doc['path']}) - "
						f"Score: {rel['score']:.2%}"
					)

	except FileNotFoundError as e:
		print(f"\n❌ Error: {e}")
		sys.exit(1)
	except Exception as e:
		print(f"\n❌ Unexpected error: {e}")
		import traceback

		traceback.print_exc()
		sys.exit(1)


if __name__ == "__main__":
	main()
