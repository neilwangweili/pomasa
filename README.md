# POMASA

**Pattern-Oriented Multi-Agent System Architecture**

## TL;DR

```bash
npx add-skill eXtremeProgramming-cn/pomasa
```

Then just tell your AI agent:

```
Help me create a multi-agent research system for analyzing AI trends in healthcare.
```

That's it. The agent will guide you through the rest.

## Purpose

POMASA is a pattern language and generation toolkit for building Declarative Multi-Agent Systems.

Its core value proposition: **Enable AI to rapidly construct new MAS systems guided by patterns**.

## Overall Approach

### Problem

When building multi-agent systems, every team uses their own approach to construct systems and their own terminology to describe architecture. The lack of a common pattern language makes it difficult to:
- Disseminate knowledge
- Reuse experience
- Discuss problems clearly

### Solution

POMASA adopts a "pattern language + generator" approach:

1. **Pattern Catalog** (`skills/pomasa/pattern-catalog/`): Reusable architectural patterns extracted from real systems, each describing a specific problem and its solution
2. **Generator** (`skills/pomasa/SKILL.md`): A prompt that guides AI to build new systems based on patterns

### Architecture Overview

![POMASA Architecture](./pomasa-explained.png)

POMASA patterns are organized into four categories (shown on the left), governing three architectural layers:

- **Definition Layer**: Blueprints define Agent behavior; Reference Data provides domain knowledge and methodology
- **Execution Layer**: Intelligent Runtime executes Blueprints; Orchestrator coordinates Workers through staged pipelines
- **Data Layer**: File System serves as the data bus, with data progressively refined from Materials → Drafts → Final outputs

### Core Principles

- **Patterns are knowledge carriers**: Transform tacit architectural experience into explicit, shareable patterns
- **Patterns have necessity levels**: Required, Recommended, Optional—systems can be flexibly composed
- **AI is the executor**: AI reads pattern documents, understands design principles, and generates pattern-conforming systems
- **Continuous evolution**: New patterns are added as practice accumulates

## Directory Structure

```
pomasa/
├── README.md                     # This file
├── skills/
│   └── pomasa/                   # POMASA skill (installable)
│       ├── SKILL.md              # Generator instructions
│       ├── user_input_template.md
│       └── pattern-catalog/      # Pattern catalog
│           ├── README.md
│           ├── COR-01-...
│           ├── STR-01-...
│           ├── BHV-01-...
│           └── QUA-01-...
└── references/                   # Background reading materials
    ├── declarative-multi-agent-architecture-part1-en.md
    └── declarative-multi-agent-architecture-part2-en.md
```

## How to Use

### Method 1: Install as Skill (Recommended)

Install POMASA as an agent skill for Claude Code, Cursor, Cline, and other compatible agents:

```bash
npx add-skill eXtremeProgramming-cn/pomasa
```

After installation, simply tell the agent what you want:

```
Help me create a multi-agent research system for analyzing AI trends in healthcare.
```

The agent will automatically activate the POMASA skill and guide you through the process.

### Method 2: Direct Use (Without Skill Installation)

Tell your AI agent:

```
Please read skills/pomasa/SKILL.md, then help me create a multi-agent system.
```

The agent will:
1. Ask for your project information (or you can prepare `user_input_template.md` in advance)
2. Read the relevant patterns in pattern-catalog
3. Select the appropriate pattern combination based on your needs
4. Generate the complete system files

### Scenario: Understanding or Improving an Existing System

```
Please read skills/pomasa/pattern-catalog/README.md, then analyze which patterns [a system directory] uses and what improvements could be made.
```

### Scenario: Learning MAS Architecture

Read the pattern documents under `skills/pomasa/pattern-catalog/` directly to learn about declarative MAS design principles and best practices.

## Pattern Overview

See [skills/pomasa/pattern-catalog/README.md](./skills/pomasa/pattern-catalog/README.md)

## Evolution Plan

POMASA is a continuously evolving project:

- Extract new patterns as more systems are built and operated
- Refine existing pattern descriptions based on practical feedback
- Explore pattern variants and adaptations across different domains
