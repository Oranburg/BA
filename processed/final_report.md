# Final Conversion Report

- Run start: `2026-04-04T02:55:28.875492+00:00`
- Run end: `2026-04-04T02:55:29.442641+00:00`
- Source files discovered recursively: **66**
- Processed in this run: **0**
- Previously completed and validated: **46**
- Repaired items this run: **0**
- Failed items: **0**
- Skipped (not eligible): **20**

## Counts by Source Type

- `docx`: 3
- `html`: 16
- `md`: 21
- `no-extension`: 1
- `pdf`: 4
- `png`: 19
- `txt`: 1
- `xml`: 1

## Remaining Unconverted Eligible Files

- None

## Failed / Skipped with Reasons

- SKIPPED `inbox/BA-canvas-course-export_2025-12-02` — unsupported_source_type:no-extension
- SKIPPED `inbox/New Boston 2077.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF-Image08.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image00.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image01.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image02.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image03.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image04.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image05.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image06.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image07.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image09.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image10.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image11.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image12.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image13.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image14.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image15.png` — unsupported_source_type:png
- SKIPPED `inbox/images/BA-LotF_Image16.png` — unsupported_source_type:png
- SKIPPED `inbox/images/New Boston 2077.png` — unsupported_source_type:png

## Output Artifact Paths

- `processed/manifest.json`
- `processed/qa_report.json`
- `processed/errors.json`
- `processed/audit_report.json`
- `processed/audit_report.md`
- `processed/final_report.md`
- `processed/schema.json`
- `processed/schema.md`
- `processed/canonical/`

## Rerun Commands

- Inventory/Audit: `python3 processed/processor.py` (writes `processed/audit_report.json` + `.md` before conversion)
- Conversion: `python3 processed/processor.py` (converts only `partial/missing/failed/unknown` eligible sources)
- Validation: `python3 processed/processor.py` then inspect `processed/qa_report.json` and `processed/errors.json`
