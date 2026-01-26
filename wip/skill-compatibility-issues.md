# POMASA Skill 兼容性问题清单

## 背景

POMASA 作为 skill 发布到 skills.sh 后，应兼容多种运行时环境（Claude Code、Cursor、Cline 等）。本文档列出当前发现的潜在兼容性问题，供后续改进参考。

---

## 1. Claude Code 特有工具名称

**涉及文件：** COR-02, BHV-05, BHV-06, user_input_template.md

| 工具名称 | 出现位置 | 说明 |
|---------|---------|------|
| `WebSearch` | BHV-05 (大量), BHV-06 | Claude Code 内置搜索工具 |
| `WebFetch` | BHV-05 (大量), BHV-06 | Claude Code 内置抓取工具 |
| `Read`, `Write`, `Edit` | COR-02:92 | Claude Code 文件操作工具 |
| `Glob`, `Grep` | COR-02:93 | Claude Code 文件搜索工具 |
| `Bash` | COR-02:95, STR-05, STR-09 | Claude Code 命令执行工具 |
| `Task tool` | COR-02:98 | Claude Code 特有的子代理启动工具 |
| `mcp__*` | BHV-06, user_input_template.md | Claude Code 的 MCP 工具命名格式 |

**影响：** 其他运行时可能使用不同的工具名称或没有对应工具

**改进建议：** 使用通用描述（如"使用搜索工具"）而非硬编码工具名，或在文档中说明这是示例命名

---

## 2. 显式提及 Claude Code

**涉及文件：**

| 文件 | 行号 | 内容 |
|------|------|------|
| COR-01 | 19 | "There is an intelligent runtime environment (such as Claude Code)" |
| COR-02 | 87-100 | **整节 "Claude Code as Intelligent Runtime"** |
| STR-02 | 76 | "AI Runtime Friendly: Naturally fits Claude Code's file tools" |

**影响：** 给用户一种"只能在 Claude Code 上用"的印象

**改进建议：** 改为"such as Claude Code, Cursor, Cline"或使用更通用的表述

---

## 3. subagent / Task tool 依赖

**涉及文件：** SKILL.md, BHV-02, BHV-03, QUA-02, QUA-03, STR-05

| 概念 | 说明 | 兼容性 |
|------|------|--------|
| `subagent` | 子代理概念 | ✅ 通用概念，多数运行时支持 |
| `Task tool` | 启动子代理的具体工具 | ⚠️ Claude Code 特有命名 |
| "Launch multiple Tasks in the same message for parallelism" | 并行启动多个子代理 | ⚠️ 实现方式可能不同 |

**影响：** BHV-02、BHV-03 等模式的具体实现方式可能需要适配

**改进建议：** 使用"启动子代理"等通用描述，在实现指南中提供多运行时示例

---

## 4. Bash 脚本依赖

**涉及文件：** STR-05, STR-09, 生成的 scripts/export.sh

| 依赖 | 说明 |
|------|------|
| Bash shell | 脚本执行环境 |
| pandoc | Markdown → DOCX/PDF 转换 |
| xelatex | PDF 生成（中文支持） |

**影响：** Windows 用户或非开发环境可能没有这些工具

**改进建议：**
- 提供 PowerShell 版本的脚本
- 或说明这是可选功能，核心功能不依赖这些工具

---

## 5. BHV-05 Grounded Web Research

**整个模式**围绕 `WebSearch` 和 `WebFetch` 两个特定工具设计：

- "WebSearch returns URLs and summaries"
- "Every piece of information must come from WebFetch content"
- 工作流图示中硬编码了工具名

**影响：** 如果运行时没有这两个工具或命名不同，整个模式的指导意义降低

**改进建议：**
- 把工具名改为泛称（"搜索工具"、"抓取工具"）
- 保留原则，但让具体工具名由运行时决定

---

## 6. BHV-06 Configurable Tool Binding

**整个模式**是 Claude Code MCP 生态特有的：

- 工具命名格式 `mcp__server__tool`
- 回退到 `WebSearch` / `WebFetch`
- 示例全部是 MCP 工具

**影响：** 在非 Claude Code 环境中，此模式基本不适用

**改进建议：**
- 明确标注此模式为 Claude Code 专属
- 或重构为更通用的"工具优先级配置"模式

---

## 兼容性总结

| 类别 | 兼容性 | 说明 |
|------|--------|------|
| **SKILL.md 格式** | ✅ 完全兼容 | 符合 Agent Skills 规范 |
| **核心模式** (COR-01, STR-01, STR-06, QUA-03) | ✅ 基本兼容 | 概念通用，只是示例用了 Claude Code |
| **结构模式** (STR-02~05, STR-07~08) | ✅ 基本兼容 | 文件系统操作是通用概念 |
| **BHV-01, BHV-02, BHV-04** | ⚠️ 部分兼容 | 概念通用，但 subagent 实现可能不同 |
| **BHV-03 并行执行** | ⚠️ 部分兼容 | 需要运行时支持并行子代理 |
| **BHV-05 Grounded Web Research** | ⚠️ 部分兼容 | 原则通用，但工具名硬编码 |
| **BHV-06 Configurable Tool Binding** | ❌ Claude Code 专属 | MCP 生态特有 |
| **STR-09 导出管线** | ⚠️ 部分兼容 | 依赖 pandoc/xelatex |
| **QUA-01, QUA-02** | ✅ 基本兼容 | 质量标准是通用概念 |

---

## 优先级建议

1. **高优先级**：BHV-05 的工具名泛化（影响面广）
2. **中优先级**：COR-02 增加多运行时说明
3. **低优先级**：BHV-06 标注为 Claude Code 专属（本来就是 Optional）

---

## 参考资料

- Agent Skills 规范：https://agentskills.io/specification
- 兼容性表格：https://www.npmjs.com/package/add-skill
