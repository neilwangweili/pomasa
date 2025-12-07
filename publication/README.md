# POMASA Paper Publication

This directory contains the source files for the POMASA paper submission to AsianPLoP 2026.

## Directory Structure

```
publication/
├── sections/           # Paper content (edit these)
│   ├── 00-format-spec.md   # Formatting guidelines (not included in output)
│   ├── 01-introduction.md
│   ├── 02-background.md
│   ├── 03-structure.md
│   ├── 04-patterns.md
│   ├── 05-applying.md
│   ├── 06-insight.md
│   └── 07-conclusion.md
├── images/             # Figures and diagrams
│   ├── pattern-relationships.dot   # Graphviz source
│   └── pattern-relationships.png   # Generated image
├── references/         # Reference materials (not included in output)
├── _output/            # Generated files (gitignored)
└── build.sh            # Build script
```

## Workflow

1. Edit markdown files in `sections/`
2. Run `./build.sh` to generate PDF
3. Output appears in `_output/`

## Build

```bash
./build.sh
```

This will:
- Clean `_output/` directory
- Assemble all sections into a single markdown file
- Copy images
- Generate PDF with pandoc + xelatex

Output files are timestamped: `pomasa-paper-YYYYMMDD-HHMMSS.{md,pdf}`

## Updating Diagrams

The pattern relationships diagram is generated from Graphviz:

```bash
cd images
dot -Tpng -o pattern-relationships.png pattern-relationships.dot
```

## Dependencies

- pandoc
- xelatex (via MacTeX or similar)
- graphviz (for diagram generation)
