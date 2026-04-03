# Processed Corpus Schema

## Overview
This directory contains the legal source corpus produced by `processed/processor.py`.
It is built from files in `inbox/` and designed for hallucination-resistant retrieval by AI agents.

## How to Use (Quick Start for AI Agents)

1. **Start here**: Read `processed/manifest.json`
   - Contains the canonical index of all processed files
   - Lists file IDs, source families, segment counts, and segment file paths

2. **Retrieve a file's segments**: Read `processed/segments/{file_id}.jsonl`
   - Each line is a JSON object (one segment)
   - Fields: `id`, `title`, `text`, `segment_type`, `source_locator`, `extraction_confidence`

3. **Get file metadata**: Read `processed/records/{file_id}.json`
   - Contains: original path, hash, size, status, extraction method, diagnostics

4. **Find by keyword**: Search segment files for the relevant term
   - `grep -r "fiduciary" processed/segments/`

5. **Verify a quotation**: Match `text` field + `source_locator` to confirm origin

## Manifest Fields (`manifest.json`)

| Field | Description |
|-------|-------------|
| `schema_version` | Corpus schema version (currently "1.0") |
| `last_run` | ISO timestamp of last processor invocation |
| `total_segments` | Total retrieval units across all files |
| `files` | Dict mapping `file_id` → summary (name, family, status, segment_count) |
| `retrieval_guide` | Quick lookup for common retrieval tasks |
| `source_families` | Definitions of case/casebook/statute/unknown families |

## File Record Fields (`records/{file_id}.json`)

| Field | Description |
|-------|-------------|
| `file_id` | Stable identifier derived from filename |
| `original_path` | Relative path from repo root |
| `content_hash` | SHA-256 of the raw file (for change detection) |
| `status` | success / partial / unsupported / error / skipped-as-unchanged |
| `source_family` | case / casebook / statute / unknown |
| `segment_count` | Number of extracted segments |
| `extraction_method` | Python function used (e.g., extract_markdown) |
| `diagnostics` | List of warnings/errors from extraction |
| `unchanged_since_prior_run` | True if file hash matches prior run |

## Segment Fields (`segments/{file_id}.jsonl`)

| Field | Description |
|-------|-------------|
| `id` | Stable segment identifier: `{file_id}:{index}:{slug}` |
| `parent_file_id` | Links back to the file record |
| `segment_type` | case-part / statute / section / chapter / paragraph / etc. |
| `title` | Heading or title of the segment |
| `text` | Exact extracted text |
| `source_locator` | Human-readable source location (e.g., `page:42`, `heading:"Facts"`) |
| `page_number` | Page number (PDF only) |
| `extraction_confidence` | high / medium / low |
| `segmentation_confidence` | high / medium / low |
| `content_hash` | SHA-256 prefix of segment text (for deduplication) |

## Segment Types

| Type | Description |
|------|-------------|
| `case` | Full court opinion |
| `case-part` | Section of a court opinion (Facts, Analysis, Holding, etc.) |
| `statute` | Statutory provision |
| `section` | Generic section of a legal document |
| `chapter` | Casebook chapter |
| `paragraph` | Standalone paragraph |
| `unknown-structured-chunk` | Conservative large chunk; structure unclear |

## Learning Artifacts (`learning/`)

| File | Description |
|------|-------------|
| `heuristics.json` | Parser preferences, chunking rules, fallback strategies |
| `patterns.json` | Citation patterns, file naming conventions, known sources |
| `failure_ledger.json` | Unresolved failures, unsupported formats, weak confidence items |
| `improvement_log.json` | Per-run lessons learned and improvement tracking |

## Run History (`run_history.jsonl`)
One JSON line per run. Fields: `run_start`, `run_end`, `stats` (files processed/skipped/failed).

## How to Extend the System Safely

1. Add a new extractor function in `processor.py` following the signature:
   `(path: Path, file_id: str, source_family: str) -> tuple[list[dict], list[str]]`
2. Register it in `EXTRACTOR_MAP` with the appropriate file extension
3. Add heuristics for the new file type in `learning/heuristics.json`
4. Rerun `python3 processed/processor.py`

## Confidence Interpretation

- **high**: Text extracted from structured source (Markdown headings, DOCX styles, XML tags)
- **medium**: Text extracted but structure uncertain (PDF pages, large XML blocks)
- **low**: Fallback extraction; segment boundaries may be imprecise
