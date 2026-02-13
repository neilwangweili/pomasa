# 论文Markdown格式规范

本规范确保各章节可正确拼接，且能被pandoc正确处理生成PDF。

## 标题规范

- [ ] 只有第一章使用一级标题（#），作为论文总标题
- [ ] 各章节使用二级标题（##）作为章标题，格式为 `## 1. Chapter Name`
- [ ] 章节内小节使用三级标题（###），格式为 `### 1.1 Section Name`
- [ ] 更细的层级使用四级标题（####），格式为 `#### 1.1.1 Subsection Name`
- [ ] 标题层级连续，不跳级

## 编号规范

- [ ] 章节编号统一：1, 2, 3, 4, 5, 6, 7, 8
- [ ] 小节编号统一：1.1, 1.2, 2.1, 2.2, ...
- [ ] 模式编号：5.1, 5.2, 5.3, ... (在第5章内)

## 空行规范

- [ ] 文件开头：一个空行
- [ ] 文件结尾：一个空行
- [ ] 标题前：一个空行
- [ ] 标题后：一个空行
- [ ] 段落之间：一个空行

## 列表规范

- [ ] bullet list 前：必须有一个空行
- [ ] bullet list 后：必须有一个空行
- [ ] 嵌套列表：使用2个空格缩进
- [ ] 有序列表同样遵循上述规则

## 代码块规范

- [ ] 代码块前：一个空行
- [ ] 代码块后：一个空行
- [ ] 使用三个反引号，指定语言

## 表格规范

- [ ] 表格前：一个空行
- [ ] 表格后：一个空行
- [ ] 使用标准markdown表格语法

## 引用块规范

- [ ] 引用块前：一个空行
- [ ] 引用块后：一个空行

## 引用规范

- [ ] 文献引用使用编号式：[1], [2], [3]...
- [ ] 所有引用集中在末尾 References 节
- [ ] 脚注（补充说明）与引用（文献）不混用

## 本论文章节结构

```
# POMASA: A Pattern Language for AI-Executable Multi-Agent Systems (一级标题，仅出现一次)

## 1. Introduction (二级标题)

## 2. Background: The Industry Analysis System (二级标题)
### 2.1 System Overview (三级标题)
### 2.2 System Scale and Complexity
### 2.3 Why This Case Study
### 2.4 A Glimpse of the Output

## 3. Related Work (二级标题，新增)
### 3.1 Multi-Agent System Frameworks
### 3.2 Pattern Languages in Software Engineering
### 3.3 Patterns for AI and LLM-based Systems

## 4. The Pattern Language Structure (二级标题)
### 4.1 Categorical Taxonomy
### 4.2 Necessity Hierarchy
### 4.3 The Pattern Catalog

## 5. Essential Patterns (二级标题)
### 5.1 COR-02: Intelligent Runtime
### 5.2 COR-01: Prompt-Defined Agent
### 5.3 STR-01: Reference Data Configuration
### 5.4 BHV-01: Orchestrated Agent Pipeline
### 5.5 BHV-02: Faithful Agent Instantiation
### 5.6 STR-02: Filesystem Data Bus
### 5.7 STR-06: Methodological Guidance
### 5.8 QUA-03: Verifiable Data Lineage

## 6. Applying the Pattern Language (二级标题)
### 6.1 The Complete Flow
### 6.2 Minimal Viable Configuration
### 6.3 Recommended Configuration
### 6.4 The Industry Analysis System Configuration
### 6.5 Pattern Interaction in Practice

## 7. The Key Insight: Executable Pattern Languages (二级标题)
### 7.1 Traditional Pattern Languages vs. Executable Pattern Languages
### 7.2 The Generator: One Way to Execute the Pattern Language
### 7.3 Implications for Open Source
### 7.4 Comparison with Imperative Generation
### 7.5 Why Pattern Languages Suit AI Execution
### 7.6 Limitations of Executable Pattern Languages

## 8. Discussion and Conclusion (二级标题)
### 8.1 Applicability and Scope
### 8.2 Limitations
### 8.3 Pattern Language Evolution
### 8.4 Contributions
### 8.5 Future Work
### 8.6 Conclusion

## References (独立节)
```
