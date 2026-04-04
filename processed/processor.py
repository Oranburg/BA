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
from html import unescape
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
SCHEMA_JSON_PATH = PROCESSED / "schema.json"
AUDIT_REPORT_JSON_PATH = PROCESSED / "audit_report.json"
AUDIT_REPORT_MD_PATH = PROCESSED / "audit_report.md"
QA_REPORT_PATH = PROCESSED / "qa_report.json"
ERRORS_PATH = PROCESSED / "errors.json"
FINAL_REPORT_PATH = PROCESSED / "final_report.md"
CANONICAL_DIR = PROCESSED / "canonical"

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
# TXT / HTML extractors
# ---------------------------------------------------------------------------

def extract_txt(path: Path, file_id: str, source_family: str) -> tuple[list[dict], list[str]]:
    diagnostics: list[str] = []
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return [], [f"Read error: {e}"]
    text = raw.strip()
    if not text:
        return [], ["Text file was empty"]
    seg = {
        "id": stable_id(file_id, 0, path.stem),
        "parent_file_id": file_id,
        "segment_type": SEG_SECTION if source_family != "unknown" else SEG_CHUNK,
        "title": path.stem,
        "text": text,
        "source_locator": "full-document",
        "extraction_confidence": "high",
        "segmentation_confidence": "medium",
        "content_hash": content_hash(text),
    }
    citations = extract_citations(text)
    if citations:
        seg["citations"] = citations
    return [seg], diagnostics


def extract_html(path: Path, file_id: str, source_family: str) -> tuple[list[dict], list[str]]:
    diagnostics: list[str] = []
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return [], [f"Read error: {e}"]
    title_match = re.search(r"<title[^>]*>(.*?)</title>", raw, flags=re.IGNORECASE | re.DOTALL)
    title = unescape(title_match.group(1).strip()) if title_match else path.stem
    text = re.sub(r"(?is)<script[^>]*>.*?</script>", " ", raw)
    text = re.sub(r"(?is)<style[^>]*>.*?</style>", " ", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = unescape(re.sub(r"\s+", " ", text)).strip()
    if not text:
        return [], ["No extractable text in HTML"]
    seg = {
        "id": stable_id(file_id, 0, title),
        "parent_file_id": file_id,
        "segment_type": SEG_SECTION if source_family != "unknown" else SEG_CHUNK,
        "title": title,
        "text": text,
        "source_locator": "full-document",
        "extraction_confidence": "medium",
        "segmentation_confidence": "low",
        "content_hash": content_hash(text),
    }
    citations = extract_citations(text)
    if citations:
        seg["citations"] = citations
    return [seg], diagnostics


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
    ".txt": extract_txt,
    ".html": extract_html,
    ".htm": extract_html,
}

AUDIT_SUPPORTED_EXTENSIONS = {".md", ".pdf", ".docx", ".xml", ".txt", ".html", ".htm"}
IGNORE_SOURCE_NAMES = {"read.me"}
SKIP_DIR_MARKERS = {"__pycache__"}


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
# Audit / validation helpers
# ---------------------------------------------------------------------------

def iso_from_ts(ts: float) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


def source_type_from_path(path: Path) -> str:
    ext = path.suffix.lower()
    if ext:
        return ext.lstrip(".")
    return "no-extension"


def is_ignored_source(path: Path) -> bool:
    lower_parts = {p.lower() for p in path.parts}
    if any(marker in lower_parts for marker in SKIP_DIR_MARKERS):
        return True
    return path.name.lower() in IGNORE_SOURCE_NAMES


def validate_record_fields(record: dict) -> list[str]:
    required = [
        "file_id",
        "original_path",
        "original_name",
        "extension",
        "content_hash",
        "source_family",
        "status",
        "segment_count",
    ]
    return [f"missing_record_field:{k}" for k in required if k not in record]


def validate_segment_fields(seg: dict) -> list[str]:
    required = [
        "id",
        "parent_file_id",
        "segment_type",
        "title",
        "text",
        "source_locator",
        "content_hash",
    ]
    return [f"missing_segment_field:{k}" for k in required if k not in seg]


def load_segments_jsonl(path: Path) -> tuple[list[dict], list[str]]:
    diagnostics: list[str] = []
    segments: list[dict] = []
    if not path.exists():
        return segments, ["segments_file_missing"]
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return [], [f"segments_read_error:{e}"]
    if not raw.strip():
        return [], ["segments_file_empty"]
    for idx, line in enumerate(raw.splitlines(), start=1):
        if not line.strip():
            continue
        try:
            seg = json.loads(line)
        except Exception as e:
            diagnostics.append(f"segments_parse_error:line:{idx}:{e}")
            continue
        diagnostics.extend(validate_segment_fields(seg))
        if isinstance(seg.get("text"), str) and not seg["text"].strip():
            diagnostics.append(f"segment_empty_text:line:{idx}")
        segments.append(seg)
    return segments, diagnostics


def resolve_file_id(path: Path, prior_by_path: dict[str, dict], used_file_ids: set[str]) -> str:
    rel = str(path.relative_to(REPO_ROOT).as_posix())
    prior = prior_by_path.get(rel, {})
    prior_fid = prior.get("file_id")
    if prior_fid:
        used_file_ids.add(prior_fid)
        return prior_fid
    base = file_id_from_path(path)
    fid = base
    if fid in used_file_ids:
        suffix = hashlib.sha256(rel.encode("utf-8")).hexdigest()[:8]
        fid = f"{base}-{suffix}"
    used_file_ids.add(fid)
    return fid


def build_canonical_document(record: dict, segments: list[dict]) -> dict:
    source_path = record.get("original_path", "")
    checksum = record.get("content_hash", "")
    canonical_id = hashlib.sha256(f"{source_path}|{checksum}".encode("utf-8")).hexdigest()[:32]
    blocks = []
    for seg in segments:
        block = {
            "id": seg.get("id"),
            "type": seg.get("segment_type"),
            "title": seg.get("title"),
            "text": seg.get("text", ""),
            "source_locator": seg.get("source_locator"),
            "page_number": seg.get("page_number"),
            "content_hash": seg.get("content_hash"),
        }
        blocks.append(block)
    raw_text = "\n\n".join([b["text"] for b in blocks if isinstance(b.get("text"), str)])
    confidence_values = [s.get("extraction_confidence", "medium") for s in segments]
    fidelity_level = "high" if confidence_values and all(c == "high" for c in confidence_values) else (
        "medium" if segments else "low"
    )
    return {
        "id": canonical_id,
        "source": {
            "path": source_path,
            "type": record.get("extension", "").lstrip("."),
            "checksum": checksum,
            "file_id": record.get("file_id"),
        },
        "metadata": {
            "title": Path(record.get("original_name", "")).stem or record.get("file_id"),
            "created_at": None,
            "participants_authors": [],
            "language": "unknown",
            "source_family": record.get("source_family"),
            "size_bytes": record.get("size_bytes"),
        },
        "content": {
            "raw_text": raw_text,
            "blocks": blocks,
            "segment_count": len(blocks),
        },
        "relations": {
            "thread_parent_id": None,
            "references": [],
        },
        "provenance": {
            "parser_name": record.get("extraction_method", "unknown"),
            "parser_version": "processor.py-schema-2.0",
            "parsed_at": record.get("last_processed"),
            "warnings": record.get("diagnostics", []),
        },
        "fidelity": {
            "level": fidelity_level,
            "extraction_confidence": confidence_values or ["low"],
        },
    }


def build_schema_json() -> dict:
    return {
        "schema_version": "2.0",
        "record_type": "canonical-source-document",
        "required_top_level_fields": [
            "id",
            "source",
            "metadata",
            "content",
            "relations",
            "provenance",
            "fidelity",
        ],
        "source_required_fields": ["path", "type", "checksum", "file_id"],
        "metadata_required_fields": ["title", "source_family"],
        "content_required_fields": ["raw_text", "blocks", "segment_count"],
        "block_required_fields": ["id", "type", "text", "source_locator", "content_hash"],
        "provenance_required_fields": ["parser_name", "parser_version", "parsed_at", "warnings"],
        "fidelity_required_fields": ["level", "extraction_confidence"],
        "notes": [
            "IDs must be deterministic from source path + checksum.",
            "Timestamps should be ISO-8601 where available.",
            "All extracted fields should preserve source locators for traceability.",
        ],
    }


def validate_canonical_document(doc: dict, schema: dict) -> list[str]:
    diagnostics: list[str] = []
    for field in schema.get("required_top_level_fields", []):
        if field not in doc:
            diagnostics.append(f"missing_canonical_field:{field}")
    for field in schema.get("source_required_fields", []):
        if field not in doc.get("source", {}):
            diagnostics.append(f"missing_canonical_source_field:{field}")
    for field in schema.get("metadata_required_fields", []):
        if field not in doc.get("metadata", {}):
            diagnostics.append(f"missing_canonical_metadata_field:{field}")
    for field in schema.get("content_required_fields", []):
        if field not in doc.get("content", {}):
            diagnostics.append(f"missing_canonical_content_field:{field}")
    blocks = doc.get("content", {}).get("blocks", [])
    for idx, block in enumerate(blocks):
        for field in schema.get("block_required_fields", []):
            if field not in block:
                diagnostics.append(f"missing_canonical_block_field:{idx}:{field}")
    for field in schema.get("provenance_required_fields", []):
        if field not in doc.get("provenance", {}):
            diagnostics.append(f"missing_canonical_provenance_field:{field}")
    for field in schema.get("fidelity_required_fields", []):
        if field not in doc.get("fidelity", {}):
            diagnostics.append(f"missing_canonical_fidelity_field:{field}")
    if not isinstance(doc.get("content", {}).get("raw_text", ""), str):
        diagnostics.append("canonical_raw_text_not_string")
    return diagnostics


def load_existing_records() -> tuple[dict[str, dict], dict[str, dict], list[dict]]:
    by_id: dict[str, dict] = {}
    by_path: dict[str, dict] = {}
    parse_errors: list[dict] = []
    for rpath in sorted(RECORDS_DIR.glob("*.json")):
        try:
            rec = load_json(rpath, {})
        except Exception as e:
            parse_errors.append({"record_file": str(rpath.relative_to(REPO_ROOT)), "error": str(e)})
            continue
        fid = rec.get("file_id")
        rel = rec.get("original_path")
        if fid:
            by_id[fid] = rec
        if rel:
            by_path[rel] = rec
    return by_id, by_path, parse_errors


def build_audit_report(source_files: list[Path], prior_by_path: dict[str, dict], planned_file_ids: dict[str, str]) -> dict:
    schema = load_json(SCHEMA_JSON_PATH, build_schema_json())
    rows: list[dict] = []
    by_checksum: dict[str, list[str]] = {}
    duplicate_planned_ids: dict[str, list[str]] = {}
    segment_id_to_files: dict[str, list[str]] = {}
    validations = {
        "record_parse_errors": [],
        "segment_parse_errors": [],
        "canonical_validation_errors": [],
        "truncation_or_corruption_signals": [],
    }
    counters = {
        "completed": 0,
        "partial": 0,
        "missing": 0,
        "failed": 0,
        "unknown": 0,
    }
    process_next: list[str] = []
    skipped_not_eligible: list[dict] = []

    for path in sorted(source_files):
        rel = str(path.relative_to(REPO_ROOT).as_posix())
        ext = path.suffix.lower()
        source_type = source_type_from_path(path)
        file_hash = sha256(path)
        mtime = iso_from_ts(path.stat().st_mtime)
        by_checksum.setdefault(file_hash, []).append(rel)
        fid = planned_file_ids[rel]
        duplicate_planned_ids.setdefault(fid, []).append(rel)

        rec_path = RECORDS_DIR / f"{fid}.json"
        seg_path = SEGMENTS_DIR / f"{fid}.jsonl"
        canonical_path = CANONICAL_DIR / f"{fid}.json"
        prior = prior_by_path.get(rel, {})
        record_issues: list[str] = []
        segment_issues: list[str] = []
        canonical_issues: list[str] = []
        truncation_flags: list[str] = []

        rec = {}
        if rec_path.exists():
            try:
                rec = load_json(rec_path, {})
            except Exception as e:
                record_issues.append(f"record_parse_error:{e}")
                validations["record_parse_errors"].append({
                    "source": rel,
                    "record_file": str(rec_path.relative_to(REPO_ROOT)),
                    "error": str(e),
                })
            else:
                record_issues.extend(validate_record_fields(rec))
        else:
            record_issues.append("record_missing")

        segments: list[dict] = []
        if seg_path.exists():
            segments, seg_diags = load_segments_jsonl(seg_path)
            segment_issues.extend(seg_diags)
            for diag in seg_diags:
                if "parse_error" in diag:
                    validations["segment_parse_errors"].append({
                        "source": rel,
                        "segments_file": str(seg_path.relative_to(REPO_ROOT)),
                        "error": diag,
                    })
            if rec and isinstance(rec.get("segment_count"), int) and rec.get("segment_count") != len(segments):
                truncation_flags.append(
                    f"segment_count_mismatch:record={rec.get('segment_count')} actual={len(segments)}"
                )
        else:
            segment_issues.append("segments_file_missing")

        if canonical_path.exists():
            try:
                canonical_doc = load_json(canonical_path, {})
            except Exception as e:
                canonical_issues.append(f"canonical_parse_error:{e}")
            else:
                canonical_issues.extend(validate_canonical_document(canonical_doc, schema))
        else:
            canonical_issues.append("canonical_missing")

        for seg in segments:
            sid = seg.get("id")
            if sid:
                segment_id_to_files.setdefault(sid, []).append(rel)

        prior_status = prior.get("status")
        source_hash_matches = bool(prior.get("content_hash") == file_hash) if prior else False
        quality_issues = record_issues + segment_issues + canonical_issues + truncation_flags

        if not prior_status:
            conversion_status = "missing"
        elif prior_status == "success":
            if source_hash_matches and not quality_issues:
                conversion_status = "completed"
            else:
                conversion_status = "partial"
        elif prior_status == "partial":
            conversion_status = "partial"
        elif prior_status in {"error", "unsupported"}:
            conversion_status = "failed"
        else:
            conversion_status = "unknown"

        counters[conversion_status] += 1
        eligible = ext in AUDIT_SUPPORTED_EXTENSIONS
        process_flag = conversion_status in {"partial", "missing", "failed", "unknown"}
        if process_flag and eligible:
            process_next.append(rel)
        elif process_flag and not eligible:
            skipped_not_eligible.append({"source": rel, "reason": f"unsupported_source_type:{source_type}"})

        if truncation_flags:
            validations["truncation_or_corruption_signals"].append({
                "source": rel,
                "signals": truncation_flags,
            })

        rows.append({
            "source_path": rel,
            "source_type": source_type,
            "expected_json_output_path": str(canonical_path.relative_to(REPO_ROOT)),
            "record_output_path": str(rec_path.relative_to(REPO_ROOT)),
            "segments_output_path": str(seg_path.relative_to(REPO_ROOT)),
            "conversion_status": conversion_status,
            "last_modified": mtime,
            "checksum": file_hash,
            "prior_status": prior_status or "none",
            "source_hash_matches_prior": source_hash_matches,
            "quality_issues": quality_issues,
            "eligible_for_conversion": eligible,
            "will_process_next": process_flag and eligible,
        })

    duplicate_source_hashes = [
        {"checksum": ch, "paths": paths}
        for ch, paths in by_checksum.items()
        if len(paths) > 1
    ]
    duplicate_output_ids = [
        {"file_id": fid, "paths": paths}
        for fid, paths in duplicate_planned_ids.items()
        if len(paths) > 1
    ]
    duplicate_segment_ids = [
        {"segment_id": sid, "sources": paths}
        for sid, paths in segment_id_to_files.items()
        if len(paths) > 1
    ]

    return {
        "generated_at": now_iso(),
        "source_root": str(INBOX.relative_to(REPO_ROOT)),
        "source_file_count": len(source_files),
        "mapping_table": rows,
        "summary": {
            **counters,
            "to_process_next_count": len(process_next),
            "skipped_not_eligible_count": len(skipped_not_eligible),
            "duplicates_by_source_checksum": len(duplicate_source_hashes),
            "duplicate_output_ids": len(duplicate_output_ids),
            "duplicate_segment_ids": len(duplicate_segment_ids),
        },
        "duplicates": {
            "source_content_hash_duplicates": duplicate_source_hashes,
            "output_id_duplicates": duplicate_output_ids,
            "segment_id_duplicates": duplicate_segment_ids,
        },
        "validation": validations,
        "process_next": sorted(process_next),
        "skipped_not_eligible": skipped_not_eligible,
    }


def write_audit_markdown(audit: dict) -> str:
    summary = audit.get("summary", {})
    process_next = audit.get("process_next", [])
    skipped_not_eligible = audit.get("skipped_not_eligible", [])
    lines = [
        "# Audit Report",
        "",
        f"- Generated at: `{audit.get('generated_at')}`",
        f"- Source root: `{audit.get('source_root')}`",
        f"- Source files inventoried: **{audit.get('source_file_count', 0)}**",
        "",
        "## Completion / Quality Summary",
        "",
        f"- Completed and trustworthy: **{summary.get('completed', 0)}**",
        f"- Partial / invalid: **{summary.get('partial', 0)}**",
        f"- Missing conversions: **{summary.get('missing', 0)}**",
        f"- Failed conversions: **{summary.get('failed', 0)}**",
        f"- Unknown status: **{summary.get('unknown', 0)}**",
        "",
        "## Duplicate Detection",
        "",
        f"- Duplicate source-content hashes: **{summary.get('duplicates_by_source_checksum', 0)}**",
        f"- Duplicate output IDs: **{summary.get('duplicate_output_ids', 0)}**",
        f"- Duplicate segment IDs: **{summary.get('duplicate_segment_ids', 0)}**",
        "",
        "## What Will Be Processed Next (No Duplicates)",
        "",
    ]
    if process_next:
        lines.extend([f"- `{p}`" for p in process_next])
    else:
        lines.append("- None")
    lines.extend(["", "## Skipped (Not Eligible)"])
    if skipped_not_eligible:
        lines.extend([f"- `{x['source']}` — {x['reason']}" for x in skipped_not_eligible])
    else:
        lines.append("- None")
    lines.extend(["", "## Artifact Paths", ""])
    lines.extend([
        "- `processed/audit_report.json`",
        "- `processed/manifest.json`",
        "- `processed/qa_report.json`",
        "- `processed/errors.json`",
        "- `processed/final_report.md`",
    ])
    return "\n".join(lines) + "\n"

# ---------------------------------------------------------------------------
# Main run
# ---------------------------------------------------------------------------

def run() -> None:
    run_start = now_iso()
    print(f"[inbox-processor] Starting run at {run_start}")
    print(f"[inbox-processor] Inbox: {INBOX}")
    print(f"[inbox-processor] Output: {PROCESSED}")

    # Ensure directories exist
    for d in [RECORDS_DIR, SEGMENTS_DIR, LEARNING_DIR, CANONICAL_DIR]:
        d.mkdir(parents=True, exist_ok=True)

    # Load prior records
    prior_records_by_id, prior_records_by_path, prior_record_parse_errors = load_existing_records()

    # Load learning artifacts
    heuristics = load_or_default_heuristics()
    patterns = load_or_default_patterns()
    failure_ledger = load_or_default_failure_ledger()
    improvement_log = load_or_default_improvement_log()

    # Enumerate source files recursively
    source_files = sorted([p for p in INBOX.rglob("*") if p.is_file() and not is_ignored_source(p)]) if INBOX.exists() else []
    print(f"[inbox-processor] Found {len(source_files)} source files recursively in inbox/")

    # Deterministic file-id planning from existing records + source paths
    planned_file_ids: dict[str, str] = {}
    used_file_ids = set(prior_records_by_id.keys())
    for path in source_files:
        rel = str(path.relative_to(REPO_ROOT).as_posix())
        planned_file_ids[rel] = resolve_file_id(path, prior_records_by_path, used_file_ids)

    # Phase 1: pre-conversion audit
    audit_report = build_audit_report(source_files, prior_records_by_path, planned_file_ids)
    save_json(AUDIT_REPORT_JSON_PATH, audit_report)
    AUDIT_REPORT_MD_PATH.write_text(write_audit_markdown(audit_report), encoding="utf-8")
    print(f"[inbox-processor] Audit report written to {AUDIT_REPORT_JSON_PATH.relative_to(REPO_ROOT)}")

    # Phase 2: canonical schema
    schema_json = build_schema_json()
    save_json(SCHEMA_JSON_PATH, schema_json)

    # Convert only remaining/defective items identified by audit
    process_targets = set(audit_report.get("process_next", []))
    run_stats = {
        "run_start": run_start,
        "source_file_count": len(source_files),
        "processed": [],
        "skipped_existing_valid": [],
        "failed": [],
        "skipped_not_eligible": [],
        "total_segments": 0,
        "previously_completed_valid": 0,
        "converted_now": 0,
        "repaired_now": 0,
    }

    new_failures: list[dict] = []
    errors: list[dict] = []

    for path in source_files:
        rel = str(path.relative_to(REPO_ROOT).as_posix())
        ext = path.suffix.lower()
        fid = planned_file_ids[rel]
        prior = prior_records_by_path.get(rel, {})
        prior_status = prior.get("status")

        if rel not in process_targets:
            if ext not in AUDIT_SUPPORTED_EXTENSIONS:
                reason = f"unsupported_source_type:{source_type_from_path(path)}"
                run_stats["skipped_not_eligible"].append({"source": rel, "reason": reason})
                errors.append({"source": rel, "stage": "eligibility", "error": reason})
            else:
                run_stats["skipped_existing_valid"].append(rel)
                run_stats["previously_completed_valid"] += 1
                run_stats["total_segments"] += int(prior.get("segment_count", 0) or 0)
            continue

        print(f"  Processing: {rel} ...", end=" ", flush=True)
        try:
            record, segments, diagnostics = process_file(path, prior_records_by_id)
        except Exception as e:
            print(f"FATAL ERROR: {e}")
            run_stats["failed"].append({"file": rel, "error": str(e)})
            new_failures.append({"file": rel, "diagnostics": [str(e)], "timestamp": now_iso()})
            errors.append({"source": rel, "stage": "processing", "error": str(e)})
            continue

        # Respect planned deterministic ID if needed
        if record.get("file_id") != fid:
            record["file_id"] = fid
            record["segment_ids"] = [re.sub(rf"^{re.escape(file_id_from_path(path))}:", f"{fid}:", s.get("id", "")) for s in segments]
            for idx, seg in enumerate(segments):
                seg["parent_file_id"] = fid
                heading = seg.get("title", "")
                seg["id"] = stable_id(fid, idx, heading)

        status = record.get("status", "error")
        if status in ("success", "partial"):
            print(f"{status} ({len(segments)} segments)")
            run_stats["processed"].append(rel)
            run_stats["converted_now"] += 1
            if prior_status in {"partial", "error", "unsupported"}:
                run_stats["repaired_now"] += 1
            run_stats["total_segments"] += len(segments)
            canonical_doc = build_canonical_document(record, segments)
            save_json(CANONICAL_DIR / f"{fid}.json", canonical_doc)
            canonical_diags = validate_canonical_document(canonical_doc, schema_json)
            if canonical_diags:
                for d in canonical_diags:
                    errors.append({"source": rel, "stage": "canonical-validation", "error": d})
        else:
            print(status)
            run_stats["failed"].append({"file": rel, "diagnostics": diagnostics})
            new_failures.append({"file": rel, "diagnostics": diagnostics, "timestamp": now_iso()})
            errors.append({"source": rel, "stage": "processing", "error": f"status:{status}", "diagnostics": diagnostics})

        # Save updated record
        save_json(RECORDS_DIR / f"{fid}.json", record)

        # Save segments
        seg_path = SEGMENTS_DIR / f"{fid}.jsonl"
        if segments:
            with open(seg_path, "w", encoding="utf-8") as f:
                for seg in segments:
                    f.write(json.dumps(seg, ensure_ascii=False) + "\n")

    # Update failure ledger
    if new_failures:
        failure_ledger.setdefault("unresolved_failures", []).extend(new_failures)
    failure_ledger["last_updated"] = now_iso()
    save_json(FAILURE_LEDGER_PATH, failure_ledger)

    # Update improvement log
    run_entry = {
        "run_start": run_start,
        "run_end": now_iso(),
        "files_processed": len(run_stats["processed"]),
        "files_skipped": len(run_stats["skipped_existing_valid"]),
        "files_failed": len(run_stats["failed"]),
        "files_not_eligible": len(run_stats["skipped_not_eligible"]),
        "total_segments": run_stats["total_segments"],
        "lessons": [],
    }
    if new_failures:
        run_entry["lessons"].append(f"{len(new_failures)} new failures recorded in failure_ledger")
    if not new_failures:
        run_entry["lessons"].append("Clean conversion pass for eligible files targeted by audit")
    improvement_log.setdefault("entries", []).append(run_entry)
    improvement_log["last_updated"] = now_iso()
    save_json(IMPROVEMENT_LOG_PATH, improvement_log)

    # Update heuristics with observed performance
    heuristics["last_updated"] = now_iso()
    save_json(HEURISTICS_PATH, heuristics)

    # Update patterns
    patterns["last_updated"] = now_iso()
    save_json(PATTERNS_PATH, patterns)

    # Re-audit after conversion for QA/final verification
    post_prior_by_id, post_prior_by_path, post_parse_errors = load_existing_records()
    post_audit = build_audit_report(source_files, post_prior_by_path, planned_file_ids)
    save_json(AUDIT_REPORT_JSON_PATH, post_audit)
    AUDIT_REPORT_MD_PATH.write_text(write_audit_markdown(post_audit), encoding="utf-8")

    # Build canonical manifest
    manifest = {
        "schema_version": "2.0",
        "corpus_name": "Business Associations: Law of the Firm — Source Corpus",
        "description": (
            "Retrieval-optimized legal corpus built from inbox/ files. "
            "See schema.md for retrieval instructions."
        ),
        "entrypoint": "processed/manifest.json",
        "last_run": run_start,
        "run_end": now_iso(),
        "inbox_file_count": len(source_files),
        "total_segments": run_stats["total_segments"],
        "source_root": "inbox/",
        "canonical_root": "processed/canonical/",
        "qa_report": "processed/qa_report.json",
        "audit_report": "processed/audit_report.json",
        "errors_report": "processed/errors.json",
        "files": {},
        "retrieval_guide": {
            "find_segment": "Read processed/segments/{file_id}.jsonl — each line is a JSON segment",
            "find_record": "Read processed/records/{file_id}.json for file metadata",
            "find_canonical": "Read processed/canonical/{file_id}.json for fidelity-preserving canonical JSON",
            "list_all_files": "Read processed/manifest.json — 'files' key maps file_id to summary",
            "schema": "Read processed/schema.md for field definitions",
            "schema_json": "Read processed/schema.json for machine-validated canonical schema",
            "learning": "Read processed/learning/ for heuristics, patterns, and run history",
        },
        "source_families": {
            "case": "Delaware court opinions (segmented by case part)",
            "casebook": "Business Associations textbook chapters",
            "statute": "Statutory texts (DGCL, MBCA, UPA, ULLCA, Restatement)",
            "unknown": "Unclassified; review manually",
        },
    }

    source_type_counts: dict[str, int] = {}
    for path in source_files:
        rel = str(path.relative_to(REPO_ROOT).as_posix())
        fid = planned_file_ids[rel]
        rec = load_json(RECORDS_DIR / f"{fid}.json", {})
        source_type = source_type_from_path(path)
        source_type_counts[source_type] = source_type_counts.get(source_type, 0) + 1
        manifest["files"][fid] = {
            "name": rec.get("original_name", path.name),
            "family": rec.get("source_family", classify_family(path)),
            "status": rec.get("status", "missing"),
            "segment_count": rec.get("segment_count", 0),
            "source_path": rel,
            "checksum": sha256(path),
            "last_modified": iso_from_ts(path.stat().st_mtime),
            "record_file": f"processed/records/{fid}.json",
            "segments_file": f"processed/segments/{fid}.jsonl",
            "canonical_file": f"processed/canonical/{fid}.json",
        }
    manifest["counts_by_source_type"] = source_type_counts

    save_json(MANIFEST_PATH, manifest)

    # QA report
    qa_report = {
        "generated_at": now_iso(),
        "schema_version": "2.0",
        "source_file_count": len(source_files),
        "eligible_source_count": len([p for p in source_files if p.suffix.lower() in AUDIT_SUPPORTED_EXTENSIONS]),
        "processed_now_count": run_stats["converted_now"],
        "previously_completed_valid_count": run_stats["previously_completed_valid"],
        "repaired_now_count": run_stats["repaired_now"],
        "remaining_unconverted_eligible": post_audit.get("process_next", []),
        "remaining_unconverted_eligible_count": len(post_audit.get("process_next", [])),
        "duplicates": post_audit.get("duplicates", {}),
        "validation": post_audit.get("validation", {}),
        "is_complete_for_eligible_sources": len(post_audit.get("process_next", [])) == 0,
    }
    if prior_record_parse_errors or post_parse_errors:
        qa_report["record_parse_errors"] = prior_record_parse_errors + post_parse_errors
    save_json(QA_REPORT_PATH, qa_report)

    # Errors report
    errors_payload = {
        "generated_at": now_iso(),
        "errors": errors,
        "failed_files": run_stats["failed"],
        "skipped_not_eligible": run_stats["skipped_not_eligible"],
    }
    save_json(ERRORS_PATH, errors_payload)

    # Append to run history
    append_jsonl(RUN_HISTORY_PATH, {
        "run_start": run_start,
        "run_end": now_iso(),
        "stats": run_stats,
    })

    # Write / update schema docs
    _write_schema()

    final_lines = [
        "# Final Conversion Report",
        "",
        f"- Run start: `{run_start}`",
        f"- Run end: `{now_iso()}`",
        f"- Source files discovered recursively: **{len(source_files)}**",
        f"- Processed in this run: **{run_stats['converted_now']}**",
        f"- Previously completed and validated: **{run_stats['previously_completed_valid']}**",
        f"- Repaired items this run: **{run_stats['repaired_now']}**",
        f"- Failed items: **{len(run_stats['failed'])}**",
        f"- Skipped (not eligible): **{len(run_stats['skipped_not_eligible'])}**",
        "",
        "## Counts by Source Type",
        "",
    ]
    for stype, count in sorted(source_type_counts.items()):
        final_lines.append(f"- `{stype}`: {count}")
    final_lines.extend([
        "",
        "## Remaining Unconverted Eligible Files",
        "",
    ])
    remaining = post_audit.get("process_next", [])
    if remaining:
        final_lines.extend([f"- `{p}`" for p in remaining])
    else:
        final_lines.append("- None")
    final_lines.extend([
        "",
        "## Failed / Skipped with Reasons",
        "",
    ])
    if run_stats["failed"]:
        for item in run_stats["failed"]:
            final_lines.append(f"- FAILED `{item.get('file')}`")
    if run_stats["skipped_not_eligible"]:
        for item in run_stats["skipped_not_eligible"]:
            final_lines.append(f"- SKIPPED `{item.get('source')}` — {item.get('reason')}")
    if not run_stats["failed"] and not run_stats["skipped_not_eligible"]:
        final_lines.append("- None")
    final_lines.extend([
        "",
        "## Output Artifact Paths",
        "",
        "- `processed/manifest.json`",
        "- `processed/qa_report.json`",
        "- `processed/errors.json`",
        "- `processed/audit_report.json`",
        "- `processed/audit_report.md`",
        "- `processed/final_report.md`",
        "- `processed/schema.json`",
        "- `processed/schema.md`",
        "- `processed/canonical/`",
    ])
    FINAL_REPORT_PATH.write_text("\n".join(final_lines) + "\n", encoding="utf-8")

    # Print run summary
    print()
    print("=" * 60)
    print("RUN SUMMARY")
    print("=" * 60)
    print(f"  Files in inbox:      {len(source_files)}")
    print(f"  Processed (this run):{run_stats['converted_now']}")
    print(f"  Previously complete: {run_stats['previously_completed_valid']}")
    print(f"  Repaired:            {run_stats['repaired_now']}")
    print(f"  Failed:             {len(run_stats['failed'])}")
    print(f"  Not eligible:       {len(run_stats['skipped_not_eligible'])}")
    print(f"  Total segments:     {run_stats['total_segments']}")
    print(f"  Output root:        {MANIFEST_PATH.relative_to(REPO_ROOT)}")
    print("=" * 60)

    if run_stats["failed"]:
        print("\nFAILURES:")
        for f in run_stats["failed"]:
            print(f"  - {f}")

    if run_stats["skipped_not_eligible"]:
        print("\nNOT ELIGIBLE:")
        for item in run_stats["skipped_not_eligible"]:
            print(f"  - {item.get('source')} ({item.get('reason')})")

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
