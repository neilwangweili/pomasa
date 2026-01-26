# Configurable Tool Binding

**Category**: Behavior
**Necessity**: Optional

## Problem

How to allow users to customize the web search and fetch tools used by agents?

In declarative MAS systems, agents typically rely on built-in tools like `WebSearch` and `WebFetch` for web research. However, there are compelling reasons why users might want to use alternative tools:

1. **Enhanced Capabilities**: Custom tools may offer features unavailable in default tools
   - Commercial services (e.g., Oxylabs, Bright Data) can bypass paywalls and anti-bot protections
   - Specialized crawlers may handle dynamic JavaScript-rendered content better
   - Some services provide cleaner content extraction or better handling of specific site types

2. **Cost Optimization**: Using custom tools can reduce API costs
   - Default tools like `WebSearch` and `WebFetch` consume the AI provider's MCP quota
   - Self-hosted or third-party tools can offload this consumption
   - For high-volume research tasks, this can result in significant savings

3. **Compliance and Access**: Organizational requirements may mandate specific tools
   - Corporate proxies or VPNs for accessing internal resources
   - Region-specific search engines for localized content
   - Tools with specific data retention or privacy policies

The challenge is to provide this flexibility while maintaining a reliable fallback mechanism when custom tools fail.

## Context

This pattern applies when:

- Users have access to custom search or fetch tools (via MCP servers or other mechanisms)
- Cost optimization is a concern for high-volume research
- Access to paywalled or protected content is needed
- The runtime environment supports multiple tool options

This pattern may be skipped when:

- Only default tools are available
- The research scope is small and cost is not a concern
- Content sources are all freely accessible

## Forces

- **Flexibility vs Complexity**: More tool options increase setup complexity
- **Capability vs Reliability**: Custom tools may be more powerful but less reliable
- **Cost vs Convenience**: Cheaper tools may require more configuration
- **Consistency vs Optimization**: Different tools may return different formats

## Solution

**Allow users to declare custom tools for web search and fetch operations. Agents should attempt custom tools first, then fall back to default tools when custom tools fail or are unavailable.**

### User Input Configuration

Users declare their custom tools in the user input:

```markdown
## Custom Tools Configuration

**Custom Web Search Tool**: mcp__crawl4ai__search
**Custom Web Fetch Tool**: mcp__crawl4ai__read_url
**Fallback Strategy**: fallback_to_default
```

### Tool Priority Strategy

```
┌─────────────────────────────┐
│  Need to search/fetch web   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Custom tool configured?    │
└──────────────┬──────────────┘
               │
        ┌──────┴──────┐
        │ Yes         │ No
        ▼             ▼
┌───────────────┐  ┌───────────────┐
│ Try custom    │  │ Use default   │
│ tool first    │  │ tool          │
└───────┬───────┘  └───────────────┘
        │
        ▼
┌───────────────────┐
│ Custom succeeded? │
└────────┬──────────┘
         │
   ┌─────┴─────┐
   │ Yes       │ No
   ▼           ▼
┌────────┐  ┌─────────────────────┐
│ Done   │  │ Fallback strategy?  │
└────────┘  └──────────┬──────────┘
                       │
            ┌──────────┴──────────┐
            │ fallback_to_default │ custom_only
            ▼                     ▼
    ┌───────────────┐      ┌────────────┐
    │ Try default   │      │ Report     │
    │ tool          │      │ failure    │
    └───────────────┘      └────────────┘
```

### Fallback Strategies

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| `fallback_to_default` | Try custom tool first, use default if custom fails | Most common; balances capability with reliability |
| `custom_only` | Use only custom tool, fail if unavailable | When default tools are inadequate or prohibited |

## Consequences

### Benefits

- **Cost Control**: Users can reduce API costs by using self-hosted or cheaper tools
- **Enhanced Access**: Paywalled or protected content becomes accessible
- **Flexibility**: Different projects can use different tool configurations
- **Graceful Degradation**: Fallback ensures research continues even when custom tools fail
- **Transparency**: Tool choice is explicit in user input, not hidden in agent logic

### Liabilities

- **Setup Complexity**: Users must configure MCP servers or tool bindings
- **Debugging Difficulty**: Failures may be harder to diagnose with multiple tool options
- **Format Inconsistency**: Different tools may return content in different formats
- **Maintenance Burden**: Custom tool availability must be monitored

## Implementation Guidelines

### Agent Blueprint Language

When BHV-06 is enabled with custom tools, include this section in data collection agents:

```markdown
## Web Research Tools

This system is configured with custom tools for web research.

### Search Operations

**Primary Tool**: `{custom_search_tool}`
**Fallback Tool**: `WebSearch`
**Fallback Strategy**: `{fallback_strategy}`

When you need to search the web:
1. First attempt using `{custom_search_tool}`
2. If the custom tool fails (error, timeout, or unavailable), and fallback is enabled:
   - Log the failure reason
   - Retry using the default `WebSearch` tool
3. If using `custom_only` strategy and custom tool fails:
   - Record that this search could not be completed
   - Continue with other available information

### Fetch Operations

**Primary Tool**: `{custom_fetch_tool}`
**Fallback Tool**: `WebFetch`
**Fallback Strategy**: `{fallback_strategy}`

When you need to fetch web page content:
1. First attempt using `{custom_fetch_tool}`
2. If the custom tool fails and fallback is enabled:
   - Log the failure reason
   - Retry using the default `WebFetch` tool
3. If using `custom_only` strategy and custom tool fails:
   - Record that this URL could not be fetched
   - Do not use information from this source (per BHV-05)

### Logging Tool Usage

When recording collected data, note which tool was used:
- **Tool Used**: [custom tool name] or [default tool name] (fallback)
```

### Generator Handling

The generator should:

1. Check if custom tools are configured in user input
2. If configured, include the tool priority section in relevant agent blueprints
3. Ensure BHV-05 (Grounded Web Research) principles still apply regardless of tool choice

### Example User Input

```markdown
## Custom Tools Configuration

**Custom Web Search Tool**: mcp__crawl4ai__search
**Custom Web Fetch Tool**: mcp__crawl4ai__read_url
**Fallback Strategy**: fallback_to_default
```

### Example Generated Blueprint Section

```markdown
## Web Research Tools

This system is configured with custom tools for web research.

### Search Operations

**Primary Tool**: `mcp__crawl4ai__search`
**Fallback Tool**: `WebSearch`
**Fallback Strategy**: `fallback_to_default`

When you need to search the web:
1. First attempt using `mcp__crawl4ai__search`
2. If the tool returns an error or times out:
   - Log: "Custom search failed: [reason], falling back to WebSearch"
   - Retry using `WebSearch`

### Fetch Operations

**Primary Tool**: `mcp__crawl4ai__read_url`
**Fallback Tool**: `WebFetch`
**Fallback Strategy**: `fallback_to_default`

When you need to fetch web page content:
1. First attempt using `mcp__crawl4ai__read_url`
2. If the tool returns an error or times out:
   - Log: "Custom fetch failed: [reason], falling back to WebFetch"
   - Retry using `WebFetch`
```

## Examples

### Scenario 1: Cost Optimization

A research team needs to collect data from 500+ web sources. Using default `WebSearch` and `WebFetch` would consume significant API quota.

**Configuration**:
```markdown
**Custom Web Search Tool**: mcp__crawl4ai__search
**Custom Web Fetch Tool**: mcp__crawl4ai__read_url
**Fallback Strategy**: fallback_to_default
```

**Result**: Most searches and fetches use the self-hosted Crawl4AI service, with occasional fallbacks to default tools when the service is overloaded.

### Scenario 2: Accessing Paywalled Content

A financial analyst needs to research articles from premium news sources.

**Configuration**:
```markdown
**Custom Web Search Tool**: (leave blank - use default)
**Custom Web Fetch Tool**: mcp__oxylabs__fetch_with_proxy
**Fallback Strategy**: custom_only
```

**Result**: Search uses default `WebSearch`, but fetching uses the Oxylabs proxy service that can access paywalled content. No fallback, since default `WebFetch` cannot access these sources anyway.

### Scenario 3: No Custom Tools

User doesn't have custom tools configured.

**Configuration**:
```markdown
**Custom Web Search Tool**: (blank)
**Custom Web Fetch Tool**: (blank)
```

**Result**: System uses default `WebSearch` and `WebFetch` tools. No tool priority section is added to agent blueprints.

## Related Patterns

- **[Intelligent Runtime](./COR-02-intelligent-runtime.md)**: Provides the default WebSearch and WebFetch tools
- **[Grounded Web Research](./BHV-05-grounded-web-research.md)**: The fetch-before-use principle applies regardless of which tools are used
- **[Reference Data Configuration](./STR-01-reference-data-configuration.md)**: Tool configuration is part of the system's reference data

## Checklist

When implementing this pattern, confirm:

- [ ] User input template includes custom tool configuration section?
- [ ] Generator checks for custom tool configuration?
- [ ] Agent blueprints include tool priority section when custom tools are configured?
- [ ] Fallback strategy is clearly documented in blueprints?
- [ ] BHV-05 principles are maintained regardless of tool choice?
- [ ] Tool usage is logged in data collection records?
