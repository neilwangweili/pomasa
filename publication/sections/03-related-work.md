
## 3. Related Work

POMASA draws from and contributes to three streams of prior work: LLM-based multi-agent system frameworks, the pattern language tradition in software engineering, and emerging work on design patterns for AI systems.

### 3.1 Multi-Agent System Frameworks

The rapid development of LLM capabilities has spawned numerous frameworks for building multi-agent systems. AutoGen [7] introduces a conversational programming paradigm where agents interact through message-passing protocols defined in Python. MetaGPT [8] structures multi-agent collaboration around software engineering roles, using Standardized Operating Procedures (SOPs) to coordinate agents. CrewAI [9] organizes agents into "crews" with role-based definitions, where orchestration logic and task dependencies are expressed in imperative Python code. LangGraph [10] models agent interactions as stateful directed graphs with conditional edges. CAMEL [11] pioneered role-playing as a coordination mechanism through "inception prompting." ChatDev [12] simulates a software company with agents communicating through natural language "chat chains," though the system architecture remains hard-coded in Python.

These frameworks share a common characteristic: while they may use natural language for agent role descriptions (as in CrewAI's backstory or CAMEL's role prompts), the system architecture—orchestration logic, agent composition, task routing, and communication patterns—must be expressed in imperative programming code. POMASA differs fundamentally by eliminating this code layer. The patterns themselves serve as the specification mechanism, interpreted directly by an intelligent runtime. This distinction parallels the broader shift from imperative to declarative programming, applied here to multi-agent system construction.

### 3.2 Pattern Languages in Software Engineering

The pattern language concept originates with Christopher Alexander's work in architecture [3], which proposed that design knowledge could be captured as a network of interconnected patterns, each addressing a recurring problem in context. The Gang of Four adapted this concept for object-oriented software design [2], establishing the Context-Problem-Forces-Solution format that subsequent pattern work adopted. The POSA series extended pattern thinking to software architecture, with Volume 1 [5] establishing categorical pattern organization and Volume 4 [6] weaving 114 patterns from multiple sources into a coherent language for distributed computing—the most ambitious pattern language effort in software engineering. Meszaros and Doble [4] contributed a meta-level pattern language for pattern writing itself, establishing structural conventions that have become community standard.

POMASA inherits this tradition's emphasis on capturing design knowledge as interconnected, context-sensitive solutions. Like POSA Volume 4, POMASA aspires to be a true pattern language—not merely a catalogue of independent patterns but a generative network where patterns reference, reinforce, and compose with each other. The categorical taxonomy (COR, STR, BHV, QUA) and necessity hierarchy (Must, Recommended, Optional) draw directly from POSA's organizational principles.

### 3.3 Patterns for AI and LLM-based Systems

A nascent body of work applies pattern thinking to AI agent architectures. Liu et al. [13] present a catalogue of 18 architectural patterns for foundation model-based agents, covering goal decomposition, reflection, tool use, and multi-agent collaboration. Each pattern includes context, forces, and trade-offs. Corneli et al. [14] explore how LLM-based systems can read, generate, and reason with design patterns, demonstrating that patterns can function as shared priors for action selection in hybrid human-agent settings.

POMASA occupies a distinct position relative to these works. Liu et al.'s contribution is a pattern *catalogue*—a collection of individual patterns that document existing architectural approaches for human architects to consult. POMASA is a pattern *language*—an interconnected generative system where patterns compose to produce working architectures. Furthermore, Liu et al. focus primarily on single-agent architectural decisions, while POMASA specifically addresses multi-agent system organization, coordination, and quality assurance.

The distinction from Corneli et al. is complementary. Their work demonstrates that AI systems can *consume and reason about* patterns as cognitive aids. POMASA takes the next step: patterns serve not merely as reasoning aids but as the *primary executable specification* for a multi-agent system. The pattern descriptions, combined with an intelligent runtime (COR-02), are sufficient to generate working implementations—a property we elaborate in Section 7.

