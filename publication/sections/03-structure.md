
## 3. The Pattern Language Structure

POMASA organizes its patterns through two orthogonal classification schemes: a categorical taxonomy that groups patterns by their architectural concern, and a necessity hierarchy that indicates how critical each pattern is to system viability. This organizational approach draws inspiration from the Pattern-Oriented Software Architecture (POSA) series[^4], which demonstrated the value of systematic pattern classification.

### 3.1 Categorical Taxonomy

Patterns are classified into four categories, each identified by a three-letter prefix:

**COR (Core)**: Patterns that define the fundamental characteristics of declarative MAS. These patterns establish what makes a system "declarative" and "multi-agent" in the AI era. Without Core patterns, the system would not qualify as a declarative MAS. Currently: 2 patterns.

**STR (Structure)**: Patterns that organize the static architecture of the system—how components are arranged, how data is stored, how boundaries are defined. Structure patterns determine the "shape" of the system at rest. Currently: 9 patterns.

**BHV (Behavior)**: Patterns that govern dynamic system behavior—how agents execute, how they coordinate, how data flows through the pipeline. Behavior patterns determine what happens when the system runs. Currently: 6 patterns.

**QUA (Quality)**: Patterns that ensure system reliability and output quality—how to embed standards, how to verify data, how to prevent hallucinations. Quality patterns determine whether the system produces trustworthy results. Currently: 3 patterns.

### 3.2 Necessity Hierarchy

Orthogonal to categorical classification, each pattern carries a necessity level:

**Must**: Patterns without which the system cannot function correctly. Every declarative MAS must implement these patterns. Currently: 6 patterns (COR-01, COR-02, STR-01, STR-06, BHV-02, QUA-03).

**Recommended**: Patterns that most systems benefit from significantly. Omitting these patterns is possible but usually results in a weaker system. Currently: 10 patterns.

**Optional**: Patterns that address specific scenarios or provide additional capabilities. Systems should adopt these based on their particular requirements. Currently: 4 patterns.

### 3.3 The Pattern Catalog

Combining these two dimensions yields the following catalog:

**COR (Core)** — Must:

- COR-01: Prompt-Defined Agent
- COR-02: Intelligent Runtime

**STR (Structure)** — Mixed:

- STR-01: Reference Data Configuration (Must)
- STR-02: Filesystem Data Bus (Recommended)
- STR-03: Workspace Isolation (Recommended)
- STR-04: Business-Driven Agent Design (Recommended)
- STR-05: Composable Document Assembly (Recommended)
- STR-06: Methodological Guidance (Must)
- STR-07: Reverse-Engineered Research Questions (Recommended)
- STR-08: Pandoc-Ready Markdown Format (Recommended)
- STR-09: Deliverable Export Pipeline (Recommended)

**BHV (Behavior)** — Mixed:

- BHV-01: Orchestrated Agent Pipeline (Recommended)
- BHV-02: Faithful Agent Instantiation (Must)
- BHV-03: Parallel Instance Execution (Optional)
- BHV-04: Progressive Data Refinement (Optional)
- BHV-05: Grounded Web Research (Recommended)
- BHV-06: Configurable Tool Binding (Optional)

**QUA (Quality)** — Mixed:

- QUA-01: Embedded Quality Standards (Recommended)
- QUA-02: Layered Quality Assurance (Optional)
- QUA-03: Verifiable Data Lineage (Must)

The following section presents eight essential patterns in detail. Complete documentation for all 20 patterns is available in the POMASA repository at https://github.com/eXtremeProgramming-cn/pomasa.

[^4]: Buschmann, F., Meunier, R., Rohnert, H., Sommerlad, P. and Stal, M., 1996. *Pattern-Oriented Software Architecture: A System of Patterns*. Wiley.

