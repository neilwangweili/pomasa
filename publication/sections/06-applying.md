
## 6. Applying the Pattern Language

Patterns gain meaning through combination. This section demonstrates how the essential patterns combine to form working systems, using the industry analysis system as concrete illustration. We begin with the complete process flow to provide a global view, then examine how pattern configurations scale from minimal to production systems, and finally trace pattern interactions through a concrete execution stage.

### 6.1 The Complete Flow

A complete industry analysis run proceeds through eight stages, orchestrated by a central agent that coordinates specialized agents at each stage:

```
Orchestrator reads:
    - agents/00.orchestrator.md (its own blueprint)
    - references/methodology/research-overview.md (what to do)

Stage 0: Initialize
    - Verify references/ exists and is complete
    - Create data/evtol/ directory structure

Stage 1: Initial Scanning
    - Launch Initial Scanner (reads own blueprint + references)
    - Produces: industry overview, question lists
    - Orchestrator validates against completion criteria

Stage 2: Deep Research (parallel)
    - Launch 55 Deep Researcher instances
    - Each reads own blueprint + references
    - Each produces: policies, statistics, cases, expert views, source list
    - Orchestrator validates each against completion criteria

Stage 3: Data Verification (independent context)
    - Launch Data Verifier in fresh context
    - Visits every URL, confirms content
    - Eliminates unverifiable data
    - Orchestrator reviews verification report

Stage 4: Analysis (parallel)
    - Launch 55 Analyzer instances
    - Each reads verified research + theoretical framework
    - Each produces: functional item analysis
    - Orchestrator validates against completion criteria

Stage 5: Synthesis
    - Launch Synthesizer
    - Reads all functional analyses
    - Produces: feature syntheses, dimension syntheses, overall synthesis

Stage 6: Report Generation
    - Launch Reporter
    - Reads syntheses, follows output template
    - Produces: final_report.md, executive_summary.md

Stage 7: Quality Review
    - Launch Quality Checker
    - Reviews entire output against standards
    - Produces: quality_review.md

Complete
```

This flow embodies several patterns working in concert. The Orchestrator is itself a Prompt-Defined Agent (COR-01) running on an Intelligent Runtime (COR-02). It coordinates specialized agents through the Orchestrated Agent Pipeline (BHV-01), invoking each via Faithful Agent Instantiation (BHV-02). Agents consult Reference Data (STR-01) and Methodological Guidance (STR-06). Data flows between stages through the Filesystem Data Bus (STR-02). Verifiable Data Lineage (QUA-03) governs Stage 3's independent verification. The following subsections examine how these patterns compose at different scales.

### 6.2 Minimal Viable Configuration

The absolute minimum for a declarative MAS requires all six Must patterns:

| Pattern | Necessity | Role |
|---------|-----------|------|
| COR-02: Intelligent Runtime | Foundation | Provides execution capability |
| COR-01: Prompt-Defined Agent | Definition | Enables agent specification |
| STR-01: Reference Data Configuration | Knowledge | Externalizes domain knowledge from agent logic |
| STR-06: Methodological Guidance | Methodology | Provides data sources, analysis methods, output templates |
| BHV-02: Faithful Agent Instantiation | Execution | Ensures correct invocation |
| QUA-03: Verifiable Data Lineage | Trust | Prevents hallucination contamination |

With only these six patterns, you can build a single-agent system that:

- Defines its behavior through a natural language blueprint
- Executes on an intelligent runtime
- Separates domain knowledge and methodology from agent logic
- Produces outputs with verifiable sources

However, such a minimal system lacks structure for multi-agent coordination, clear data flow organization, or systematic quality assurance beyond source verification.

### 6.3 Recommended Configuration

Adding the two recommended patterns detailed in Section 5 creates a multi-agent system:

| Pattern | Addition | Benefit |
|---------|----------|---------|
| BHV-01: Orchestrated Agent Pipeline | Coordination | Enables multi-stage agent collaboration |
| STR-02: Filesystem Data Bus | Communication | Provides transparent inter-agent data passing |

This eight-pattern configuration—the set presented in Section 5—supports systems of moderate complexity with multiple agents, clear data flow, and verifiable outputs. Additional recommended patterns such as STR-03 (Workspace Isolation), which prevents cross-project contamination, further strengthen the system depending on operational requirements.

### 6.4 The Industry Analysis System Configuration

The complete industry analysis system employs 14 of the 20 patterns:

**Must (all 6)**:

- COR-01: Prompt-Defined Agent
- COR-02: Intelligent Runtime
- STR-01: Reference Data Configuration
- STR-06: Methodological Guidance
- BHV-02: Faithful Agent Instantiation
- QUA-03: Verifiable Data Lineage

**Recommended (7 of 10)**:

- STR-02: Filesystem Data Bus
- STR-03: Workspace Isolation
- STR-04: Business-Driven Agent Design
- STR-07: Reverse-Engineered Research Questions
- BHV-01: Orchestrated Agent Pipeline
- BHV-05: Grounded Web Research
- QUA-01: Embedded Quality Standards

**Optional (1 of 4)**:

- BHV-03: Parallel Instance Execution

The system omits STR-05 (Composable Document Assembly) because the final report is generated as a unified document rather than assembled from independent chapters. It omits STR-08 (Pandoc-Ready Markdown Format) and STR-09 (Deliverable Export Pipeline) because the system predates these patterns; export was handled ad hoc. It omits BHV-04 (Progressive Data Refinement) because the refinement pattern is implicit in the stage-based pipeline. It omits BHV-06 (Configurable Tool Binding) because the system was built for a single runtime environment with fixed tool configuration. It omits QUA-02 (Layered Quality Assurance) because verification occurs at specific pipeline stages rather than across multiple quality layers.

### 6.5 Pattern Interaction in Practice

To illustrate how patterns interact concretely, consider the execution of Stage 2 (Deep Research) in the industry analysis system:

**1. Reference Data Configuration (STR-01) + Methodological Guidance (STR-06)**

Before research begins, the Deep Researcher agent reads:

- `references/methodology/data-sources.md` — which sources to prioritize
- `references/methodology/analysis-methods.md` — what information to collect
- `references/domain/theoretical_framework_explained.md` — what the functional item means

These reference files tell the agent what to look for without hardcoding URLs or search strategies into the blueprint.

**2. Orchestrated Agent Pipeline (BHV-01) + Faithful Agent Instantiation (BHV-02)**

The orchestrator launches 55 independent Deep Researcher subagents, one per functional item:

```
For FUNCTION_ID in [1.1, 1.2, ..., 4.12]:
    Launch subagent:
        - Read agents/02.deep_researcher.md
        - Execute with parameters: INDUSTRY_ID=evtol, FUNCTION_ID={id}
    # Do NOT summarize the blueprint
    # Do NOT bundle multiple items
```

Each subagent reads the complete blueprint and executes independently. The orchestrator passes only parameters.

**3. Parallel Instance Execution (BHV-03)**

The 55 research tasks are independent—item 1.1's research does not depend on item 1.2's results. The orchestrator can launch all 55 subagents simultaneously:

```
Launch in parallel:
    - Subagent 1: FUNCTION_ID=1.1
    - Subagent 2: FUNCTION_ID=1.2
    ...
    - Subagent 55: FUNCTION_ID=4.12

Wait for all to complete
```

Parallel execution reduces a 55× sequential runtime to approximately 10× runtime (limited by concurrent execution capacity).

**4. Filesystem Data Bus (STR-02) + Workspace Isolation (STR-03)**

Each subagent writes to its designated directory:

```
data/evtol/01.materials/03.deep_research/
+-- 1.1_control_strategic_sectors/
|   +-- policies.md
|   +-- statistics.md
|   +-- cases.md
|   +-- expert_views.md
|   `-- source_list.md
+-- 1.2_provide_public_goods/
|   `-- ...
...
```

Subagents write only within `data/evtol/` (workspace isolation). The directory structure reflects data organization (filesystem data bus). Parallel subagents write to different directories, avoiding conflicts.

**5. Verifiable Data Lineage (QUA-03)**

After all 55 research tasks complete, Stage 3 launches the Data Verifier:

```
Launch subagent (fresh context):
    - Read agents/03.data_verifier.md
    - Verify all data in data/evtol/01.materials/03.deep_research/
```

The verifier runs in a fresh context without access to the research agents' "memories." It visits each URL, confirms content matches, and flags problems. Unverifiable data is eliminated before analysis.

**6. Embedded Quality Standards (QUA-01)**

Quality standards are embedded in each blueprint. The Deep Researcher blueprint includes:

```markdown
## Quality Requirements

### Source Requirements
- Every data item must have a URL
- Prioritize authoritative sources
- Cross-verify important claims

### Completion Criteria
- [ ] Policies: At least 3 relevant policies identified
- [ ] Statistics: Quantitative data with sources
- [ ] Cases: At least 2 concrete examples
- [ ] Expert Views: At least 2 expert opinions
- [ ] Source List: All sources documented with URLs
```

The agent self-checks against these criteria before reporting completion. The orchestrator validates against the same criteria when receiving results.

