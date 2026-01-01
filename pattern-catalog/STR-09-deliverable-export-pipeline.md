# Deliverable Export Pipeline

**Category**: Structure
**Necessity**: Recommended

## Problem

How to convert final research reports into professional document formats for delivery?

Research outputs in Markdown format cannot be directly delivered to stakeholders who expect standard document formats like DOCX or PDF. Manual conversion is error-prone and inconsistent. Without a standardized export process, each project handles conversion differently, leading to inconsistent deliverable quality.

## Context

This pattern applies to the following scenarios:

- Research projects that produce final reports for external delivery
- Deliverables need to be in DOCX format (for editing) and/or PDF format (for distribution)
- Consistent formatting and professional appearance are required
- Multiple languages may be involved (especially CJK languages requiring special handling)

## Forces

- **Format Flexibility vs Consistency**: Stakeholders expect different formats, but each should look consistent
- **Automation vs Customization**: Automated export saves time, but formatting needs may vary
- **Simplicity vs Features**: Simple scripts are maintainable, but advanced formatting requires configuration
- **Intermediate vs Final**: Markdown is great for AI generation, but not for delivery

## Solution

**Create a dedicated export pipeline that converts the final Markdown report to DOCX and PDF formats using pandoc, with template files controlling formatting and output organized in a separate deliverables directory.**

### Core Principles

1. **Dedicated Output Directory**
   - Export deliverables to `_output/` in the project root
   - Keep separate from `data/` which holds intermediate artifacts
   - Consider adding `_output/` to `.gitignore` (user's choice)

2. **Script-Based Automation**
   - Place export scripts in `scripts/` directory
   - Scripts are deterministic and repeatable
   - No AI involvement in the export process

3. **Template-Controlled Formatting**
   - DOCX formatting via reference document template
   - PDF formatting via LaTeX header file
   - Templates stored in `scripts/` alongside the export script

4. **Title-Based Naming**
   - Extract report title from Markdown heading
   - Add timestamp for version tracking
   - Sanitize special characters for filesystem compatibility

## Consequences

### Benefits

- **Professional Output**: Consistent, well-formatted deliverables
- **Reproducible**: Same script produces same output
- **Flexible Formats**: Support both editable (DOCX) and final (PDF) formats
- **Multi-Language Support**: Proper handling of CJK and other scripts via XeLaTeX

### Liabilities

- **External Dependencies**: Requires pandoc and optionally XeLaTeX
- **Template Maintenance**: Format templates need occasional updates
- **Platform Differences**: Font availability may vary across systems

## Implementation Guidelines

### Directory Structure

```
my-mas/
├── agents/
├── references/
├── data/
│   └── 05.report/
│       └── final_report.md      # Source for export
├── scripts/
│   ├── export.sh                # Export script
│   ├── docx-template.docx       # DOCX format template
│   └── latex-header.tex         # PDF format control
└── _output/                     # Deliverables (may be gitignored)
    ├── Report Title [20260101-093510].docx
    └── Report Title [20260101-093510].pdf
```

### Export Script Example

```bash
#!/bin/bash
# export.sh - Export final report to DOCX and PDF

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="${PROJECT_ROOT}/_output"

# Input file (default or from argument)
INPUT_FILE="${1:-${PROJECT_ROOT}/data/05.report/final_report.md}"

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file not found: $INPUT_FILE"
    exit 1
fi

# Extract title from first heading
TITLE=$(grep -m 1 '^# ' "$INPUT_FILE" | sed 's/^# //')
if [ -z "$TITLE" ]; then
    echo "Error: No title found (expected '# Title' on first line)"
    exit 1
fi

# Sanitize title for filename (replace invalid chars with -)
SAFE_TITLE=$(echo "$TITLE" | sed 's/[:<>"|?*\/\\]/-/g' | sed 's/  */ /g')

# Add timestamp
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BASENAME="${SAFE_TITLE} [${TIMESTAMP}]"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Template files
DOCX_TEMPLATE="${SCRIPT_DIR}/docx-template.docx"
LATEX_HEADER="${SCRIPT_DIR}/latex-header.tex"

# Export to DOCX
echo "Exporting to DOCX..."
if [ -f "$DOCX_TEMPLATE" ]; then
    pandoc "$INPUT_FILE" \
        --reference-doc="$DOCX_TEMPLATE" \
        -o "${OUTPUT_DIR}/${BASENAME}.docx"
else
    pandoc "$INPUT_FILE" \
        -o "${OUTPUT_DIR}/${BASENAME}.docx"
fi
echo "Created: ${OUTPUT_DIR}/${BASENAME}.docx"

# Export to PDF
echo "Exporting to PDF..."
if [ -f "$LATEX_HEADER" ]; then
    pandoc "$INPUT_FILE" \
        --pdf-engine=xelatex \
        -H "$LATEX_HEADER" \
        -o "${OUTPUT_DIR}/${BASENAME}.pdf"
else
    pandoc "$INPUT_FILE" \
        --pdf-engine=xelatex \
        -o "${OUTPUT_DIR}/${BASENAME}.pdf"
fi
echo "Created: ${OUTPUT_DIR}/${BASENAME}.pdf"

echo "Export complete!"
```

### DOCX Template

The `docx-template.docx` file controls DOCX formatting:

- Create a Word document with desired styles (headings, body text, lists, etc.)
- Set fonts (e.g., Cochin for English, SimSun/宋体 for Chinese)
- Configure margins, line spacing, paragraph spacing
- Pandoc will apply these styles to the generated document

To create a template:
1. Generate a basic DOCX: `pandoc sample.md -o template.docx`
2. Open in Word/LibreOffice and modify styles
3. Save as `docx-template.docx`

### LaTeX Header for PDF

The `latex-header.tex` file controls PDF formatting, especially for multi-language support:

```latex
% Font configuration for CJK support
\usepackage{fontspec}
\usepackage{xeCJK}

% Set fonts (adjust based on available fonts)
\setmainfont{Cochin}
\setCJKmainfont{Songti SC}

% Page layout
\usepackage{geometry}
\geometry{a4paper, margin=2.5cm}

% Line spacing
\usepackage{setspace}
\onehalfspacing

% Paragraph formatting
\setlength{\parindent}{2em}
\setlength{\parskip}{0.5em}
```

### Usage

Basic usage (uses default input path):
```bash
./scripts/export.sh
```

With explicit input file:
```bash
./scripts/export.sh data/05.report/final_report.md
```

## Examples

### Correct Directory Layout

```
industry-assessment/
├── agents/
│   └── ...
├── references/
│   └── ...
├── data/
│   ├── 01.raw/
│   ├── 02.processed/
│   └── 05.report/
│       └── final_report.md
├── scripts/
│   ├── export.sh
│   ├── docx-template.docx
│   └── latex-header.tex
└── _output/
    ├── Industry Assessment Report [20260101-093510].docx
    └── Industry Assessment Report [20260101-093510].pdf
```

### Title Extraction and Sanitization

| Original Title | Sanitized Filename |
|----------------|-------------------|
| `# My Report` | `My Report [timestamp].docx` |
| `# Analysis: Q1 2025` | `Analysis- Q1 2025 [timestamp].docx` |
| `# What/Why/How?` | `What-Why-How- [timestamp].docx` |

### Integration with Composable Document Assembly

When using STR-05 (Composable Document Assembly), the workflow is:

1. Generate sections independently → `data/04.sections/`
2. Assemble into final report → `data/05.report/final_report.md`
3. Export to deliverables → `_output/`

The assembly script and export script are separate:
- `scripts/assemble.sh` - combines sections (may be in `data/scripts/`)
- `scripts/export.sh` - converts to DOCX/PDF

## Related Patterns

- **[Pandoc-Ready Markdown Format](./STR-08-pandoc-ready-markdown.md)**: Ensures source Markdown converts correctly
- **[Composable Document Assembly](./STR-05-composable-document-assembly.md)**: Produces the final report to be exported
- **[Filesystem Data Bus](./STR-02-filesystem-data-bus.md)**: `_output/` as final stage in data flow
- **[Workspace Isolation](./STR-03-workspace-isolation.md)**: Export script works within project boundaries

## Checklist

When implementing this pattern, confirm:

- [ ] Is there a `scripts/` directory for export tooling?
- [ ] Is there an `_output/` directory for deliverables?
- [ ] Does the export script extract title from Markdown heading?
- [ ] Does the script sanitize title for filesystem compatibility?
- [ ] Does the script add timestamp to filename?
- [ ] Is there a DOCX template file with appropriate styles?
- [ ] Is there a LaTeX header file for PDF generation (if CJK support needed)?
- [ ] Does the final Markdown follow Pandoc-Ready format (STR-08)?
