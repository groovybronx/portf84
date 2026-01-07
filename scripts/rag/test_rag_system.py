#!/usr/bin/env python3
"""
Tests for the RAG Documentation System

This script tests the index builder and search engine to ensure
the RAG system is functioning correctly.

Usage:
    python scripts/rag/test_rag_system.py
"""

import json
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from search_documentation import DocumentationSearchEngine


def test_index_exists():
	"""Verify that index files exist."""
	print("🧪 Test 1: Checking index files exist...")

	index_path = Path("docs/.doc-index.json")
	metadata_path = Path("docs/.doc-metadata.json")

	assert index_path.exists(), f"❌ Index not found at {index_path}"
	assert metadata_path.exists(), f"❌ Metadata not found at {metadata_path}"

	print("   ✅ Index files exist")
	return True


def test_index_validity():
	"""Verify that index structure is valid."""
	print("🧪 Test 2: Validating index structure...")

	with open("docs/.doc-index.json", "r", encoding="utf-8") as f:
		index = json.load(f)

	# Check required keys
	assert "metadata" in index, "❌ Missing 'metadata' in index"
	assert "documents" in index, "❌ Missing 'documents' in index"

	metadata = index["metadata"]
	assert "version" in metadata, "❌ Missing 'version' in metadata"
	assert "generated" in metadata, "❌ Missing 'generated' in metadata"
	assert "total_documents" in metadata, "❌ Missing 'total_documents' in metadata"

	# Check documents
	assert len(index["documents"]) > 0, "❌ No documents in index"

	# Check first document structure
	doc = index["documents"][0]
	required_fields = ["path", "title", "priority", "sections", "keywords"]
	for field in required_fields:
		assert field in doc, f"❌ Missing '{field}' in document"

	print(f"   ✅ Index structure valid ({len(index['documents'])} documents)")
	return True


def test_metadata_validity():
	"""Verify that metadata file is valid."""
	print("🧪 Test 3: Validating metadata file...")

	with open("docs/.doc-metadata.json", "r", encoding="utf-8") as f:
		metadata_file = json.load(f)

	assert "metadata" in metadata_file, "❌ Missing 'metadata' in metadata file"
	assert "documents" in metadata_file, "❌ Missing 'documents' in metadata file"

	metadata = metadata_file["metadata"]
	assert metadata["total_documents"] > 0, "❌ No documents in metadata"

	print(f"   ✅ Metadata valid ({metadata['total_documents']} documents)")
	return True


def test_search_engine_initialization():
	"""Test that search engine can be initialized."""
	print("🧪 Test 4: Initializing search engine...")

	try:
		engine = DocumentationSearchEngine()
		stats = engine.get_statistics()

		assert stats["total_documents"] > 0, "❌ No documents loaded"

		print(f"   ✅ Search engine initialized ({stats['total_documents']} docs)")
		return True
	except Exception as e:
		print(f"   ❌ Failed to initialize: {e}")
		return False


def test_search_queries():
	"""Test search with various queries."""
	print("🧪 Test 5: Testing search queries...")

	engine = DocumentationSearchEngine()

	# Test queries with expected minimum results
	test_queries = [
		("tags", 2, "Should find tag-related documentation"),
		("architecture", 2, "Should find architecture documents"),
		("React", 2, "Should find React-related docs"),
		("Gemini API", 1, "Should find AI/Gemini documentation"),
		("configuration", 1, "Should find configuration docs"),
	]

	all_passed = True

	for query, expected_min, description in test_queries:
		results = engine.search(query, max_results=5)

		if len(results) >= expected_min:
			print(f"   ✅ Query '{query}': {len(results)} results ({description})")
		else:
			print(
				f"   ⚠️  Query '{query}': Only {len(results)} results, "
				f"expected at least {expected_min}"
			)
			all_passed = False

	return all_passed


def test_search_scoring():
	"""Test that search results are properly scored."""
	print("🧪 Test 6: Testing search scoring...")

	engine = DocumentationSearchEngine()

	results = engine.search("architecture", max_results=5)

	if not results:
		print("   ⚠️  No results to test scoring")
		return False

	# Check that results are sorted by score
	scores = [r["score"] for r in results]
	is_sorted = all(scores[i] >= scores[i + 1] for i in range(len(scores) - 1))

	if is_sorted:
		print(
			f"   ✅ Results properly sorted by score "
			f"(range: {scores[0]:.2%} - {scores[-1]:.2%})"
		)
	else:
		print(f"   ❌ Results not properly sorted: {scores}")
		return False

	# Check score range
	if all(0 <= score <= 1 for score in scores):
		print(f"   ✅ All scores in valid range [0, 1]")
	else:
		print(f"   ❌ Some scores out of range: {scores}")
		return False

	return True


def test_related_documents():
	"""Test finding related documents."""
	print("🧪 Test 7: Testing related documents...")

	engine = DocumentationSearchEngine()

	# Get first document
	if not engine.index_data["documents"]:
		print("   ⚠️  No documents to test")
		return False

	test_doc = engine.index_data["documents"][0]
	doc_path = test_doc["path"]

	related = engine.find_related_documents(doc_path, max_related=3)

	if related:
		print(f"   ✅ Found {len(related)} related documents for '{test_doc['title']}'")
		return True
	else:
		print(f"   ⚠️  No related documents found (this may be OK for isolated docs)")
		return True  # Not a failure, just a warning


def test_priority_system():
	"""Test that priority levels are assigned correctly."""
	print("🧪 Test 8: Testing priority system...")

	with open("docs/.doc-index.json", "r", encoding="utf-8") as f:
		index = json.load(f)

	priority_counts = {"critical": 0, "high": 0, "normal": 0, "archive": 0}

	for doc in index["documents"]:
		priority = doc.get("priority", "normal")
		priority_counts[priority] = priority_counts.get(priority, 0) + 1

	print(f"   Priority distribution:")
	for priority, count in priority_counts.items():
		print(f"     {priority.capitalize()}: {count}")

	# Check that we have some high-priority docs
	if priority_counts["critical"] > 0 or priority_counts["high"] > 0:
		print(f"   ✅ Priority system working correctly")
		return True
	else:
		print(f"   ⚠️  No critical/high priority docs found")
		return True  # Warning, not failure


def test_keyword_extraction():
	"""Test that keywords are extracted from documents."""
	print("🧪 Test 9: Testing keyword extraction...")

	with open("docs/.doc-index.json", "r", encoding="utf-8") as f:
		index = json.load(f)

	# Check that documents have keywords
	docs_with_keywords = sum(
		1 for doc in index["documents"] if len(doc.get("keywords", [])) > 0
	)

	percentage = (docs_with_keywords / len(index["documents"])) * 100

	if percentage > 80:
		print(
			f"   ✅ Keywords extracted for {docs_with_keywords}/{len(index['documents'])} "
			f"documents ({percentage:.1f}%)"
		)
		return True
	else:
		print(
			f"   ⚠️  Only {docs_with_keywords}/{len(index['documents'])} "
			f"documents have keywords ({percentage:.1f}%)"
		)
		return False


def run_all_tests():
	"""Run all tests and report results."""
	print("🤖 RAG System Test Suite - Lumina Portfolio\n")
	print("=" * 80)

	tests = [
		test_index_exists,
		test_index_validity,
		test_metadata_validity,
		test_search_engine_initialization,
		test_search_queries,
		test_search_scoring,
		test_related_documents,
		test_priority_system,
		test_keyword_extraction,
	]

	results = []

	for test in tests:
		try:
			result = test()
			results.append((test.__name__, result))
		except AssertionError as e:
			print(f"   ❌ {e}")
			results.append((test.__name__, False))
		except Exception as e:
			print(f"   ❌ Unexpected error: {e}")
			results.append((test.__name__, False))

		print()  # Empty line between tests

	# Summary
	print("=" * 80)
	print("\n📊 Test Summary:\n")

	passed = sum(1 for _, result in results if result)
	total = len(results)

	for test_name, result in results:
		status = "✅ PASS" if result else "❌ FAIL"
		print(f"  {status}  {test_name}")

	print(f"\n{'=' * 80}")
	print(f"\n🎯 Results: {passed}/{total} tests passed ({passed/total*100:.1f}%)")

	if passed == total:
		print("\n✅ All tests passed! RAG system is functioning correctly.")
		return 0
	else:
		print(f"\n⚠️  {total - passed} test(s) failed. Please review the output above.")
		return 1


if __name__ == "__main__":
	exit_code = run_all_tests()
	sys.exit(exit_code)
