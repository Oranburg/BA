#!/usr/bin/env python3
"""
Inbox Processor — Business Associations: Law of the Firm
========================================================
Manual invocation only. Run from the repository root:

    python3 processed/processor.py

Processes all files in inbox/ and produces a retrieval-optimized legal corpus
under processed/ with per-file records, JSONL segment stores, and learning
artifacts. Safe to rerun; unchanged files are skipped.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import traceback
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).parent.parent.resolve()
INBOX = REPO_ROOT / "inbox"
PROCESSED = REPO_ROOT / "processed"
RECORDS_DIR = PROCESSED / "records"
SEGMENTS_DIR = PROCESSED / "segments"
LEARNING_DIR = PROCESSED / "learning"

MANIFEST_PATH = PROCESSED / "manifest.json"
RUN_HISTORY_PATH = PROCESSED / "run_history.jsonl"
HEURISTICS_PATH = LEARNING_DIR / "heuristics.json"
PATTERNS_PATH = LEARNING_DIR / "patterns.json"
FAILURE_LEDGER_PATH = LEARNING_DIR / "failure_ledger.json"
IMPROVEMENT_LOG_PATH = LEARNING_DIR / "improvement_log.json"

SCHEMA_PATH = PROCESSED / "schema.md"

# ---------------------------------------------------------------------------
# Segment type taxonomy
# ---------------------------------------------------------------------------
SEG_CASE = "case"
SEG_CASE_PART = "case-part"
SEG_STATUTE = "statute"
SEG_SECTION = "section"
SEG_CHAPTER = "chapter"
SEG_PARAGRAPH = "paragraph"
SEG_SLIDE = "slide"
SEG_CHUNK = "unknown-structured-chunk"

# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(65536), b""):
            h.update(block)
    return h.hexdigest()


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def stable_id(file_id: str, segment_index: int, heading: str = "") -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", heading.lower()).strip("-")[:40]
    return f"{file_id}:{segment_index:04d}" + (f":{slug}" if slug else "")


def file_id_from_path(path: Path) -> str:
    stem = re.sub(r"[^a-z0-9]+", "-", path.stem.lower()).strip("-")
    return stem[:60]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_json(path: Path, default: Any = None) -> Any:
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default


def save_json(path: Path, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def append_jsonl(path: Path, record: dict) -> None:
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


# ---------------------------------------------------------------------------
# Markdown extractor
# ---------------------------------------------------------------------------

def _infer_segment_type(heading: str, text: str, parent_family: str) -> str:
    if parent_family in ("case", "caselaw"):
        return SEG_CASE_PART
    h = heading.lower()
    if re.search(r"\bchapter\b|\bch\b\s*\d", h):
        return SEG_CHAPTER
    if re.search(r"§|\bsection\b|\bsec\b\s*\d|\bart\b\s*\d", h):
        return SEG_STATUTE
    return SEG_SECTION


# ---------------------------------------------------------------------------
# Citation extraction
# ---------------------------------------------------------------------------

CITATION_PATTERNS: list[re.Pattern[str]] = [
    # Case citations: 457 A.2d 701 / 493 A.3d 946 / 506 A.2d 173
    re.compile(r"\d+\s+[A-Z]\.\d[a-z]*\s+\d+"),
    # US Supreme Court: 123 U.S. 456
    re.compile(r"\d+\s+U\.S\.\s+\d+"),
    # Federal reporters: 123 F.2d 456 / 123 F.3d 456 / 123 F.Supp. 456
    re.compile(r"\d+\s+F\.\d?[A-Za-z]*\.?\s+\d+"),
    # Statutory section refs: § 8.30 / § 202 / § 141(a)
    re.compile(r"§\s*\d+[\w.()\-]*"),
    # Named statute with section: DGCL § 141 / MBCA § 8.30 / RUPA § 202
    re.compile(r"(?:DGCL|MBCA|RUPA|RULLCA|UVTA|RSA)\s+§\s*[\d\w.()\-]+"),
    # Restatement refs: RSA § 1.01 / Restatement (Third) of Agency § 2.01
    re.compile(r"Restatement\s+\(\w+\)\s+of\s+\w+\s+§\s*[\d\w.()\-]+"),
    # Public Law: Pub. L. No. 119-27
    re.compile(r"Pub\.\s*L\.\s*No\.\s*\d+-\d+"),
    # Year-only Delaware case pattern: Del. 1985
    re.compile(r"Del\.\s+\d{4}"),
    # N.W.2d, N.E.2d etc.
    re.compile(r"\d+\s+[A-Z]\.[A-Z]\.?\d*[a-z]*\s+\d+"),
]


def extract_citations(text: str) -> list[str]:
    """Extract unique legal citations from text using known patterns."""
    seen: set[str] = set()
    results: list[str] = []
    for pattern in CITATION_PATTERNS:
        for m in pattern.finditer(text):
            citation = m.group(0).strip()
            norm = re.sub(r"\s+", " ", citation)
            if norm not in seen:
                seen.add(norm)
                results.append(norm)
    return results


# ---------------------------------------------------------------------------
# Body-text section numbering detection
# ---------------------------------------------------------------------------

# Patterns that indicate structural section breaks within body text
BODY_SECTION_RE = re.compile(
    r"^"
    r"("
    r"\d{1,3}\.\s"                  # "1. " "12. "
    r"|[A-Z]\.\s"                    # "A. " "B. "
    r"|\([a-z]\)\s"                  # "(a) " "(b) "
    r"|\([0-9]{1,2}\)\s"             # "(1) " "(12) "
    r"|[IVXivx]+\.\s"                # "I. " "II. " "iv. "
    r"|§\s*\d"                       # "§ 1" "§ 202"
    r")"
    r".{10,}",                       # must have substantial text after marker
    re.MULTILINE,
)


def detect_body_sections(text: str) -> list[tuple[str, str]]:
    """
    Detect numbered / lettered section breaks in body text.
    Returns list of (marker, full_line) tuples.
    """
    results: list[tuple[str, str]] = []
    for line in text.splitlines():
        m = BODY_SECTION_RE.match(line.strip())
        if m:
            results.append((m.group(1).strip(), line.strip()))
    return results


def extract_markdown(path: Path, file_id: str, source_family: str) -> tuple[list[dict], list[str]]:
    """
    Segment a Markdown file by heading levels (H1–H6).
    Also extracts citations and detects body-text section numbering.
    Returns (segments, diagnostics).
    """
    diagnostics: list[str] = []
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return [], [f"Read error: {e}"]

    lines = raw.splitlines()
    segments: list[dict] = []
    current_heading = ""
    current_level = 0
    current_lines: list[str] = []
    seg_index = 0
    h1_count = 0

    def flush(heading: str, level: int, body_lines: list[str]) -> None:
        nonlocal seg_index
        text = "\n".join(body_lines).strip()
        if not text and not heading:
            return
        stype = _infer_segment_type(heading, text, source_family)
        if level == 1 or (level == 0 and h1_count == 0):
            stype = SEG_CHAPTER if source_family == "casebook" else stype
        citations = extract_citations(text)
        body_sections = detect_body_sections(text)
        seg: dict = {
            "id": stable_id(file_id, seg_index, heading),
            "parent_file_id": file_id,
            "segment_type": stype,
            "title": heading,
            "text": text,
            "source_locator": f"heading:{repr(heading)}" if heading else "preamble",
            "extraction_confidence": "high",
            "segmentation_confidence": "high",
            "content_hash": content_hash(text),
        }
        if citations:
            seg["citations"] = citations
        if body_sections:
            seg["body_section_markers"] = [m for m, _ in body_sections]
            seg["body_section_count"] = len(body_sections)
        segments.append(seg)
        seg_index += 1

    HEADING_RE = re.compile(r"^(#{1,6})\s+(.+)$")
    for line in lines:
        m = HEADING_RE.match(line)
        if m:
            level = len(m.group(1))
            heading_text = m.group(2).strip().strip("*").strip()
            if level == 1:
                h1_count += 1
            flush(current_heading, current_level, current_lines)
            current_heading = heading_text
            current_level = level
            current_lines = []
        else:
            current_lines.append(line)

    flush(current_heading, current_level, current_lines)

    # Fallback: if no heading-based segments, split on body section numbering with deduplication
    if not segments:
        diagnostics.append("No headings found; attempting body-section-number fallback")
        text = raw.strip()
        fallback_segs = _fallback_regex_split(text, file_id, source_family)
        if fallback_segs:
            seen_hashes: set[str] = set()
            for seg in fallback_segs:
                ch = seg["content_hash"]
                if ch not in seen_hashes:
                    seen_hashes.add(ch)
                    segments.append(seg)
            diagnostics.append(
                f"Fallback split produced {len(segments)} unique segments "
                f"(deduped from {len(fallback_segs)})"
            )
        else:
            diagnostics.append("Fallback found no section markers; file returned as single chunk")
            citations = extract_citations(text)
            seg: dict = {
                "id": stable_id(file_id, 0, ""),
                "parent_file_id": file_id,
                "segment_type": SEG_CHUNK,
                "title": path.stem,
                "text": text,
                "source_locator": "full-document",
                "extraction_confidence": "medium",
                "segmentation_confidence": "low",
                "content_hash": content_hash(text),
            }
            if citations:
                seg["citations"] = citations
            segments.append(seg)

    return segments, diagnostics


def _fallback_regex_split(text: str, file_id: str, source_family: str) -> list[dict]:
    """
    Split text on body-section numbering patterns when no markdown headings exist.
    Returns segments (caller is responsible for deduplication).
    """
    SPLIT_RE = re.compile(
        r"(?m)^(?:\d{1,3}\.\s|[A-Z]\.\s|\([a-z0-9]{1,2}\)\s"
        r"|[IVXivx]+\.\s|§\s*\d).{10,}$"
    )
    matches = list(SPLIT_RE.finditer(text))
    if not matches:
        return []

    segments: list[dict] = []
    boundaries = [m.start() for m in matches] + [len(text)]
    for i, start in enumerate(boundaries[:-1]):
        end = boundaries[i + 1]
        chunk = text[start:end].strip()
        if len(chunk) < 20:
            continue
        heading = matches[i].group(0)[:80].strip()
        seg: dict = {
            "id": stable_id(file_id, i, heading),
            "parent_file_id": file_id,
            "segment_type": _infer_segment_type(heading, chunk, source_family),
            "title": heading,
            "text": chunk,
            "source_locator": f"body-section:{i}",
            "extraction_confidence": "medium",
            "segmentation_confidence": "medium",
            "content_hash": content_hash(chunk),
        }
        citations = extract_citations(chunk)
        if citations:
            seg["citations"] = citations
        segments.append(seg)
    return segments


# ---------------------------------------------------------------------------
# PDF extractor
# ---------------------------------------------------------------------------

# Heuristic: lines shorter than this that look like headings are treated as section titles in PDFs
_PDF_HEADING_MAX_CHARS = 120
_PDF_SECTION_HEADING_RE = re.compile(
    r"^(?:"
    r"(?:PART|CHAPTER|SECTION|ARTICLE|SUBCHAPTER)\s+[IVXLCDM\d]"  # PART I / CHAPTER 1
    r"|§\s*\d[\w.()\-]*\s"                                          # § 141(a)
    r"|\d{1,3}\.\d{0,3}\s+[A-Z]"                                   # 8.30 Director Standards
    r"|[A-Z][A-Z\s]{3,}$"                                           # ALL-CAPS HEADING
    r")",
    re.IGNORECASE,
)


def _is_pdf_section_heading(line: str) -> bool:
    """Heuristic: short lines that match known heading patterns in legal PDFs."""
    stripped = line.strip()
    if not stripped or len(stripped) > _PDF_HEADING_MAX_CHARS:
        return False
    return bool(_PDF_SECTION_HEADING_RE.match(stripped))


def extract_pdf(path: Path, file_id: str, source_family: str) -> tuple[list[dict], list[str]]:
    """
    Extract text from PDF using pdfminer.six.
    Attempts section-heading detection within pages; falls back to page-level segments.
    Also extracts citations from each segment.
    Returns (segments, diagnostics).
    """
    diagnostics: list[str] = []
    segments: list[dict] = []
    try:
        from pdfminer.high_level import extract_pages
        from pdfminer.layout import LTTextContainer, LTChar, LTAnon
    except ImportError:
        return [], ["pdfminer.six not installed; PDF skipped"]

    try:
        # Collect all page text with page-number metadata
        pages: list[tuple[int, str]] = []
        page_num = 0
        for page_layout in extract_pages(str(path)):
            page_num += 1
            page_text_parts = []
            for element in page_layout:
                if isinstance(element, LTTextContainer):
                    page_text_parts.append(element.get_text())
            page_text = "".join(page_text_parts).strip()
            if page_text:
                pages.append((page_num, page_text))

        if not pages:
            diagnostics.append("No extractable text found in PDF (possibly scanned/image-only)")
            return segments, diagnostics

        # Try to merge all pages and split by detected section headings
        full_text = "\n\n".join(text for _, text in pages)
        section_segs = _pdf_split_by_sections(full_text, file_id, source_family)

        if len(section_segs) >= 2:
            # Section detection worked — use section-level segments
            segments = section_segs
            diagnostics.append(f"PDF section detection: {len(segments)} sections found")
        else:
            # Fall back to page-level segments
            for pn, ptext in pages:
                citations = extract_citations(ptext)
                seg: dict = {
                    "id": stable_id(file_id, pn - 1, f"page-{pn}"),
                    "parent_file_id": file_id,
                    "segment_type": SEG_SECTION,
                    "title": f"Page {pn}",
                    "text": ptext,
                    "page_number": pn,
                    "source_locator": f"page:{pn}",
                    "extraction_confidence": "medium",
                    "segmentation_confidence": "medium",
                    "content_hash": content_hash(ptext),
                }
                if citations:
                    seg["citations"] = citations
                segments.append(seg)

    except Exception as e:
        diagnostics.append(f"PDF extraction error: {e}")
        tb = traceback.format_exc()
        diagnostics.append(tb[:500])

    return segments, diagnostics


def _pdf_split_by_sections(text: str, file_id: str, source_family: str) -> list[dict]:
    """
    Split merged PDF text into sections based on heading heuristics.
    """
    lines = text.splitlines()
    segments: list[dict] = []
    seg_index = 0
    current_heading = ""
    current_lines: list[str] = []

    def flush_pdf(heading: str, body_lines: list[str]) -> None:
        nonlocal seg_index
        body = "\n".join(body_lines).strip()
        if not body and not heading:
            return
        stype = _infer_segment_type(heading, body, source_family)
        citations = extract_citations(body)
        seg: dict = {
            "id": stable_id(file_id, seg_index, heading),
            "parent_file_id": file_id,
            "segment_type": stype,
            "title": heading,
            "text": body,
            "source_locator": f"pdf-section:{seg_index}",
            "extraction_confidence": "medium",
            "segmentation_confidence": "medium",
            "content_hash": content_hash(body),
        }
        if citations:
            seg["citations"] = citations
        segments.append(seg)
        seg_index += 1

    for line in lines:
        if _is_pdf_section_heading(line):
            flush_pdf(current_heading, current_lines)
            current_heading = line.strip()
            current_lines = []
        else:
            current_lines.append(line)

    flush_pdf(current_heading, current_lines)
    return segments


# ---------------------------------------------------------------------------
# DOCX extractor
# ---------------------------------------------------------------------------

def extract_docx(path: Path, file_id: str, source_family: str) -> tuple[list[dict], list[str]]:
    """
    Extract text from DOCX by heading-delimited sections using python-docx.
    Returns (segments, diagnostics).
    """
    diagnostics: list[str] = []
    segments: list[dict] = []
    try:
        import docx  # python-docx
    except ImportError:
        return [], ["python-docx not installed; DOCX skipped"]

    try:
        doc = docx.Document(str(path))
    except Exception as e:
        return [], [f"DOCX open error: {e}"]

    current_heading = ""
    current_lines: list[str] = []
    seg_index = 0

    def flush(heading: str, body: list[str]) -> None:
        nonlocal seg_index
        text = "\n".join(body).strip()
        if not text and not heading:
            return
        stype = _infer_segment_type(heading, text, source_family)
        seg = {
            "id": stable_id(file_id, seg_index, heading),
            "parent_file_id": file_id,
            "segment_type": stype,
            "title": heading,
            "text": text,
            "source_locator": f"heading:{repr(heading)}",
            "extraction_confidence": "high",
            "segmentation_confidence": "high",
            "content_hash": content_hash(text),
        }
        segments.append(seg)
        seg_index += 1

    for para in doc.paragraphs:
        style_name = para.style.name if para.style else ""
        text = para.text.strip()
        if not text:
            continue
        if style_name.startswith("Heading"):
            flush(current_heading, current_lines)
            current_heading = text
            current_lines = []
        else:
            current_lines.append(text)

    flush(current_heading, current_lines)

    if not segments:
        diagnostics.append("No content extracted from DOCX")

    return segments, diagnostics


# ---------------------------------------------------------------------------
# XML extractor (USLM legislative XML)
# ---------------------------------------------------------------------------

def extract_xml(path: Path, file_id: str, source_family: str) -> tuple[list[dict], list[str]]:
    """
    Extract legislative sections from USLM-format XML.
    Returns (segments, diagnostics).
    """
    diagnostics: list[str] = []
    segments: list[dict] = []

    try:
        tree = ET.parse(str(path))
        root = tree.getroot()
    except ET.ParseError as e:
        return [], [f"XML parse error: {e}"]

    # Strip namespace for easier tag matching
    def strip_ns(tag: str) -> str:
        return re.sub(r"\{[^}]+\}", "", tag)

    def get_text(elem: ET.Element) -> str:
        return " ".join(elem.itertext()).strip()

    # Try to find section-level elements
    NS_TAGS = {"section", "subsection", "paragraph", "article", "division"}
    seg_index = 0

    def walk(elem: ET.Element, depth: int = 0) -> None:
        nonlocal seg_index
        tag = strip_ns(elem.tag)
        if tag.lower() in NS_TAGS:
            # Try to extract heading/num
            heading = ""
            for child in elem:
                ct = strip_ns(child.tag).lower()
                if ct in ("heading", "num", "chapeau"):
                    heading = get_text(child)
                    if heading:
                        break
            text = get_text(elem)
            if text and len(text) > 20:
                seg = {
                    "id": stable_id(file_id, seg_index, heading),
                    "parent_file_id": file_id,
                    "segment_type": SEG_STATUTE,
                    "title": heading,
                    "text": text,
                    "source_locator": f"xml-tag:{tag}:{seg_index}",
                    "extraction_confidence": "high",
                    "segmentation_confidence": "medium",
                    "content_hash": content_hash(text),
                }
                segments.append(seg)
                seg_index += 1
        else:
            for child in elem:
                walk(child, depth + 1)

    # Try section-based walk first
    walk(root)

    if not segments:
        diagnostics.append("No legislative sections found; using full text fallback")
        full_text = get_text(root).strip()
        if full_text:
            segments.append({
                "id": stable_id(file_id, 0, ""),
                "parent_file_id": file_id,
                "segment_type": SEG_CHUNK,
                "title": path.stem,
                "text": full_text,
                "source_locator": "full-document",
                "extraction_confidence": "medium",
                "segmentation_confidence": "low",
                "content_hash": content_hash(full_text),
            })
        else:
            diagnostics.append("XML contained no extractable text")

    return segments, diagnostics


# ---------------------------------------------------------------------------
# Source family classifier
# ---------------------------------------------------------------------------

CASE_NAMES = {
    "air products", "corwin", "lyondell", "magnetar", "match group",
    "revlon", "unocal", "weinberger",
}
CASEBOOK_NAMES = {"bacg", "lotf", "law of the firm"}
STATUTE_NAMES = {"dgcl", "mbca", "upa", "ullca", "securities act", "exchange act", "plaw", "restat"}


def classify_family(path: Path) -> str:
    name = path.stem.lower()
    for k in CASE_NAMES:
        if k in name:
            return "case"
    for k in CASEBOOK_NAMES:
        if k in name:
            return "casebook"
    for k in STATUTE_NAMES:
        if k in name:
            return "statute"
    return "unknown"


# ---------------------------------------------------------------------------
# Per-file processor dispatcher
# ---------------------------------------------------------------------------

EXTRACTOR_MAP = {
    ".md": extract_markdown,
    ".pdf": extract_pdf,
    ".docx": extract_docx,
    ".xml": extract_xml,
}


def process_file(
    path: Path, prior_records: dict[str, dict]
) -> tuple[dict, list[dict], list[str]]:
    """
    Process a single inbox file. Returns (file_record, segments, diagnostics).
    """
    file_id = file_id_from_path(path)
    ext = path.suffix.lower()
    size = path.stat().st_size
    file_hash = sha256(path)
    source_family = classify_family(path)

    prior = prior_records.get(file_id, {})
    unchanged = prior.get("content_hash") == file_hash

    base_record: dict = {
        "file_id": file_id,
        "original_path": str(path.relative_to(REPO_ROOT)),
        "original_name": path.name,
        "extension": ext,
        "size_bytes": size,
        "content_hash": file_hash,
        "source_family": source_family,
        "last_processed": now_iso(),
    }

    if unchanged and prior.get("status") == "success":
        record = {**prior, "last_processed": now_iso(), "unchanged_since_prior_run": True}
        return record, [], []

    base_record["unchanged_since_prior_run"] = False

    extractor = EXTRACTOR_MAP.get(ext)
    if extractor is None:
        record = {
            **base_record,
            "status": "unsupported",
            "processing_status": "unsupported",
            "extraction_method": "none",
            "diagnostics": [f"Unsupported file type: {ext}"],
            "segment_count": 0,
        }
        return record, [], [f"Unsupported: {path.name} ({ext})"]

    try:
        segments, diagnostics = extractor(path, file_id, source_family)
    except Exception as e:
        tb = traceback.format_exc()
        record = {
            **base_record,
            "status": "error",
            "processing_status": "error",
            "extraction_method": extractor.__name__,
            "diagnostics": [f"Exception: {e}", tb[:800]],
            "segment_count": 0,
        }
        return record, [], [f"Error: {path.name}: {e}"]

    status = "success" if segments and not any("error" in d.lower() for d in diagnostics) else (
        "partial" if segments else "error"
    )

    record = {
        **base_record,
        "status": status,
        "processing_status": status,
        "extraction_method": extractor.__name__,
        "segmentation_strategy": "heading-based" if ext == ".md" else "page-based" if ext == ".pdf" else "style-based" if ext == ".docx" else "xml-section",
        "segment_count": len(segments),
        "segment_ids": [s["id"] for s in segments],
        "diagnostics": diagnostics,
        "ocr_required": False,
    }
    return record, segments, diagnostics


# ---------------------------------------------------------------------------
# Learning artifact helpers
# ---------------------------------------------------------------------------

def load_or_default_heuristics() -> dict:
    default = {
        "version": 1,
        "file_type_preferences": {
            ".md": {"extractor": "extract_markdown", "confidence": "high", "notes": "Best format; heading-based segmentation works well"},
            ".pdf": {"extractor": "extract_pdf", "confidence": "medium", "notes": "pdfminer.six page-level extraction; quality varies by PDF"},
            ".docx": {"extractor": "extract_docx", "confidence": "high", "notes": "python-docx heading-style segmentation"},
            ".xml": {"extractor": "extract_xml", "confidence": "medium", "notes": "USLM legislative XML; section-level walk"},
        },
        "source_family_rules": {
            "case": "Segment by heading (Introduction, Facts, Analysis, Holding, etc.)",
            "casebook": "Segment by chapter heading (H1) then by subheading (H2/H3)",
            "statute": "Segment by section/article heading",
            "unknown": "Conservative chunk; flag for review",
        },
        "chunking": {
            "prefer_heading_boundaries": True,
            "min_segment_chars": 50,
            "max_segment_chars": 8000,
            "notes": "Prefer smallest authoritative unit; preserve legal meaning",
        },
        "fallback_order": ["heading-based", "page-based", "full-document"],
        "last_updated": now_iso(),
    }
    return load_json(HEURISTICS_PATH, default)


def load_or_default_patterns() -> dict:
    default = {
        "version": 1,
        "citation_patterns": [
            r"\d+\s+[A-Z]\.\d[a-z]*\s+\d+",
            r"\d+\s+U\.S\.\s+\d+",
            r"§\s*\d+[\w.]*",
            r"DGCL\s+§\s*\d+",
            r"Del\.\s+\d{4}",
        ],
        "file_naming_conventions": {
            "BACG - Ch ##": "Business Associations casebook chapter",
            "LotF": "Law of the Firm main text",
            "DGCL": "Delaware General Corporation Law",
            "MBCA": "Model Business Corporation Act",
            "UPA": "Uniform Partnership Act",
            "ULLCA": "Uniform LLC Act",
            "PLAW": "Public Law (US Congress)",
            "Restat": "Restatement (Third) of Agency",
        },
        "known_source_families": {
            "Air Products": "Delaware Court of Chancery, 2011, poison pill case",
            "Revlon": "Delaware Supreme Court, 1986, M&A duties case",
            "Unocal": "Delaware Supreme Court, 1985, enhanced scrutiny",
            "Weinberger": "Delaware Supreme Court, 1983, entire fairness",
            "Corwin": "Delaware Supreme Court, 2015, stockholder ratification",
            "Lyondell": "Delaware Supreme Court, 2009, Revlon duties",
            "Magnetar": "Delaware Supreme Court, appraisal",
            "Match Group": "Delaware Supreme Court, 2024, MFW",
        },
        "last_updated": now_iso(),
    }
    return load_json(PATTERNS_PATH, default)


def load_or_default_failure_ledger() -> dict:
    default = {
        "version": 1,
        "unresolved_failures": [],
        "unsupported_formats": [],
        "weak_confidence_items": [],
        "last_updated": now_iso(),
    }
    return load_json(FAILURE_LEDGER_PATH, default)


def load_or_default_improvement_log() -> dict:
    default = {
        "version": 1,
        "entries": [],
        "last_updated": now_iso(),
    }
    return load_json(IMPROVEMENT_LOG_PATH, default)


# ---------------------------------------------------------------------------
# Main run
# ---------------------------------------------------------------------------

def run() -> None:
    run_start = now_iso()
    print(f"[inbox-processor] Starting run at {run_start}")
    print(f"[inbox-processor] Inbox: {INBOX}")
    print(f"[inbox-processor] Output: {PROCESSED}")

    # Ensure directories exist
    for d in [RECORDS_DIR, SEGMENTS_DIR, LEARNING_DIR]:
        d.mkdir(parents=True, exist_ok=True)

    # Load prior manifest and records
    prior_manifest = load_json(MANIFEST_PATH, {})
    prior_records: dict[str, dict] = {}
    for f in RECORDS_DIR.glob("*.json"):
        rec = load_json(f, {})
        if rec.get("file_id"):
            prior_records[rec["file_id"]] = rec

    # Load learning artifacts
    heuristics = load_or_default_heuristics()
    patterns = load_or_default_patterns()
    failure_ledger = load_or_default_failure_ledger()
    improvement_log = load_or_default_improvement_log()

    # Enumerate inbox files
    inbox_files = sorted(INBOX.iterdir()) if INBOX.exists() else []
    inbox_files = [f for f in inbox_files if f.is_file()]
    print(f"[inbox-processor] Found {len(inbox_files)} files in inbox/")

    # Track run statistics
    run_stats = {
        "run_start": run_start,
        "inbox_file_count": len(inbox_files),
        "processed": [],
        "skipped_unchanged": [],
        "failed": [],
        "unsupported": [],
        "total_segments": 0,
    }

    all_file_ids: list[str] = []
    new_failures: list[dict] = []
    new_unsupported: list[str] = []

    for path in inbox_files:
        print(f"  Processing: {path.name} ...", end=" ", flush=True)
        try:
            record, segments, diagnostics = process_file(path, prior_records)
        except Exception as e:
            print(f"FATAL ERROR: {e}")
            run_stats["failed"].append({"file": path.name, "error": str(e)})
            continue

        file_id = record["file_id"]
        all_file_ids.append(file_id)
        status = record.get("status", "error")

        if record.get("unchanged_since_prior_run") and status == "success":
            print("skipped (unchanged)")
            run_stats["skipped_unchanged"].append(path.name)
            # Still track the segment count for manifest
            run_stats["total_segments"] += record.get("segment_count", 0)
        else:
            print(f"{status} ({record.get('segment_count', 0)} segments)")
            if status in ("success", "partial"):
                run_stats["processed"].append(path.name)
                run_stats["total_segments"] += len(segments)
            elif status == "error":
                run_stats["failed"].append({"file": path.name, "diagnostics": diagnostics})
                new_failures.append({"file": path.name, "diagnostics": diagnostics, "timestamp": now_iso()})
            elif status == "unsupported":
                run_stats["unsupported"].append(path.name)
                if path.name not in [x.get("file") for x in failure_ledger.get("unsupported_formats", [])]:
                    new_unsupported.append(path.name)

        # Save record
        save_json(RECORDS_DIR / f"{file_id}.json", record)

        # Save segments (overwrite if changed)
        seg_path = SEGMENTS_DIR / f"{file_id}.jsonl"
        if segments:
            with open(seg_path, "w", encoding="utf-8") as f:
                for seg in segments:
                    f.write(json.dumps(seg, ensure_ascii=False) + "\n")

    # Update failure ledger
    if new_failures:
        failure_ledger.setdefault("unresolved_failures", []).extend(new_failures)
    if new_unsupported:
        for fname in new_unsupported:
            failure_ledger.setdefault("unsupported_formats", []).append({
                "file": fname, "timestamp": now_iso(),
                "recommendation": "Add extractor or convert to supported format"
            })
    failure_ledger["last_updated"] = now_iso()
    save_json(FAILURE_LEDGER_PATH, failure_ledger)

    # Update improvement log
    run_entry = {
        "run_start": run_start,
        "run_end": now_iso(),
        "files_processed": len(run_stats["processed"]),
        "files_skipped": len(run_stats["skipped_unchanged"]),
        "files_failed": len(run_stats["failed"]),
        "files_unsupported": len(run_stats["unsupported"]),
        "total_segments": run_stats["total_segments"],
        "lessons": [],
    }
    if new_failures:
        run_entry["lessons"].append(f"{len(new_failures)} new failures recorded in failure_ledger")
    if not new_failures and not new_unsupported:
        run_entry["lessons"].append("Clean run: all files processed or skipped as unchanged")
    improvement_log.setdefault("entries", []).append(run_entry)
    improvement_log["last_updated"] = now_iso()
    save_json(IMPROVEMENT_LOG_PATH, improvement_log)

    # Update heuristics with observed performance
    heuristics["last_updated"] = now_iso()
    save_json(HEURISTICS_PATH, heuristics)

    # Update patterns
    patterns["last_updated"] = now_iso()
    save_json(PATTERNS_PATH, patterns)

    # Build canonical manifest
    manifest = {
        "schema_version": "1.0",
        "corpus_name": "Business Associations: Law of the Firm — Source Corpus",
        "description": (
            "Retrieval-optimized legal corpus built from inbox/ files. "
            "See schema.md for retrieval instructions."
        ),
        "entrypoint": "processed/manifest.json",
        "last_run": run_start,
        "run_end": now_iso(),
        "inbox_file_count": len(inbox_files),
        "total_segments": run_stats["total_segments"],
        "files": {},
        "retrieval_guide": {
            "find_segment": "Read processed/segments/{file_id}.jsonl — each line is a JSON segment",
            "find_record": "Read processed/records/{file_id}.json for file metadata",
            "list_all_files": "Read processed/manifest.json — 'files' key maps file_id to summary",
            "schema": "Read processed/schema.md for field definitions",
            "learning": "Read processed/learning/ for heuristics, patterns, and run history",
        },
        "source_families": {
            "case": "Delaware court opinions (segmented by case part)",
            "casebook": "Business Associations textbook chapters",
            "statute": "Statutory texts (DGCL, MBCA, UPA, ULLCA, Restatement)",
            "unknown": "Unclassified; review manually",
        },
    }

    for f in RECORDS_DIR.glob("*.json"):
        rec = load_json(f, {})
        fid = rec.get("file_id", "")
        if fid:
            manifest["files"][fid] = {
                "name": rec.get("original_name"),
                "family": rec.get("source_family"),
                "status": rec.get("status"),
                "segment_count": rec.get("segment_count", 0),
                "segments_file": f"processed/segments/{fid}.jsonl",
            }

    save_json(MANIFEST_PATH, manifest)

    # Append to run history
    append_jsonl(RUN_HISTORY_PATH, {
        "run_start": run_start,
        "run_end": now_iso(),
        "stats": run_stats,
    })

    # Write / update schema doc
    _write_schema()

    # Print run summary
    print()
    print("=" * 60)
    print("RUN SUMMARY")
    print("=" * 60)
    print(f"  Files in inbox:     {len(inbox_files)}")
    print(f"  Processed (new):    {len(run_stats['processed'])}")
    print(f"  Skipped (unchanged):{len(run_stats['skipped_unchanged'])}")
    print(f"  Failed:             {len(run_stats['failed'])}")
    print(f"  Unsupported:        {len(run_stats['unsupported'])}")
    print(f"  Total segments:     {run_stats['total_segments']}")
    print(f"  Output root:        {MANIFEST_PATH.relative_to(REPO_ROOT)}")
    print("=" * 60)

    if run_stats["failed"]:
        print("\nFAILURES:")
        for f in run_stats["failed"]:
            print(f"  - {f}")

    if run_stats["unsupported"]:
        print("\nUNSUPPORTED:")
        for f in run_stats["unsupported"]:
            print(f"  - {f}")

    print("\nDone.")


# ---------------------------------------------------------------------------
# Schema documentation
# ---------------------------------------------------------------------------

def _write_schema() -> None:
    text = """# Processed Corpus Schema

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
"""
    with open(SCHEMA_PATH, "w", encoding="utf-8") as f:
        f.write(text)


if __name__ == "__main__":
    run()
