# POMASA Pattern Relationship Diagram - 作图提示词

## 图的目的

为学术论文创建一张模式关系图（Pattern Relationship Diagram），展示 POMASA 模式语言中 8 个核心模式之间的依赖、配置和约束关系。用于 ACM 单栏格式论文，黑白打印也要可读。

## 图的精确结构

### 8 个模式节点

每个节点是一个圆角矩形，包含模式编号和名称。按类别用不同的视觉区分（颜色或填充样式）：

| 节点 | 类别 | 类别颜色建议 |
|------|------|-------------|
| COR-02: Intelligent Runtime | Core | 深蓝 |
| COR-01: Prompt-Defined Agent | Core | 深蓝 |
| STR-01: Reference Data Configuration | Structure | 青绿 |
| STR-06: Methodological Guidance | Structure | 青绿 |
| STR-02: Filesystem Data Bus | Structure | 青绿 |
| BHV-01: Orchestrated Agent Pipeline | Behavior | 橙色 |
| BHV-02: Faithful Agent Instantiation | Behavior | 橙色 |
| QUA-03: Verifiable Data Lineage | Quality | 紫色 |

### 布局（从上到下，3 层）

**第一层（顶部）—— 基础层 Foundation**：
- 正中：COR-02: Intelligent Runtime
- 紧贴下方正中：COR-01: Prompt-Defined Agent
- COR-02 到 COR-01 有一条向下的箭头，标注 "interprets"

**第二层（中部）—— 编排层 Orchestration**：
- 正中：BHV-01: Orchestrated Agent Pipeline
- 左侧：STR-01: Reference Data Configuration 和 STR-06: Methodological Guidance 上下排列，两者之间有双向箭头标注 "pairs with"
- 右侧：BHV-02: Faithful Agent Instantiation

关系箭头：
- COR-01 → BHV-01：向下箭头，标注 "defines agents for"
- STR-01 → COR-01：向上箭头（或向右上），标注 "configures"
- STR-06 → COR-01：向上箭头（或向右上），标注 "configures"（可与 STR-01 共用一个标注）
- BHV-02 → BHV-01：向左箭头，标注 "constrains invocation"

**第三层（底部）—— 数据层 Data**：
- 正中：STR-02: Filesystem Data Bus
- 右侧：QUA-03: Verifiable Data Lineage

关系箭头：
- BHV-01 → STR-02：向下箭头，标注 "data flows via"
- QUA-03 → STR-02：向左箭头，标注 "ensures traceability"

### 整体叙事

图从上到下讲述一个故事：
1. **Runtime 解释 Blueprint**（COR-02 → COR-01）
2. **Blueprint 由领域知识和方法论配置**（STR-01 + STR-06 → COR-01）
3. **多个 Agent 在 Pipeline 中协调**（COR-01 → BHV-01），**调用方式受约束**（BHV-02 → BHV-01）
4. **Agent 间通过文件系统通信**（BHV-01 → STR-02），**数据可溯源**（QUA-03 → STR-02）

## 视觉风格要求

- **整体风格**：简洁、现代、有科技感，适合学术论文。参考风格：Apple 技术文档、Stripe 开发者文档中的架构图
- **配色**：白底 + 彩色边框/填充。确保黑白打印时仍可通过填充深浅区分类别
- **节点**：圆角矩形，内部两行文字——第一行模式编号（如 COR-02），第二行模式名称（如 Intelligent Runtime）。字体用无衬线体
- **箭头**：细线，带箭头，关系标注用小号浅色字体放在箭头旁边
- **层次提示**（可选）：可以用极浅的背景色带标注三个层次（Foundation / Orchestration / Data），但不要喧宾夺主
- **图例**：右下角或底部放一个小图例，说明四种类别颜色对应 Core / Structure / Behavior / Quality
- **尺寸比例**：宽度略大于高度（约 4:3），适合插入单栏论文的全宽位置
- **不要**：不要3D效果、不要渐变阴影、不要装饰性元素、不要圆形节点
