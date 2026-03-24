# Output Design Guide

Patterns for designing agent output schemas during onboarding Phase 3. Claude reads this to propose appropriate output formats.

---

## Universal Output Structure

Every agent output follows this envelope:

```json
{
  "meta": {
    "id": "agent-YYYYMMDD-HHMMSS",
    "agent": "agent-id",
    "timestamp": "ISO 8601",
    "task_id": "descriptive-task-id",
    "status": "draft | final | superseded",
    "version": 1,
    "tags": ["tag1", "tag2"]
  },
  "content": {
    // Agent-specific content — varies per agent type
  },
  "handoff": {
    // Present only when passing to another agent
    "target_agent": "next-agent-id",
    "source_file": "outputs/agent-id/filename.json",
    "task_completed": "What was done",
    "key_findings": ["finding 1", "finding 2"],
    "open_questions": ["question 1"],
    "suggested_next_steps": ["step 1"]
  }
}
```

The `meta` section is always required. The `handoff` section is only present when the output is being passed to another agent as part of a workflow.

---

## Output Patterns by Type

### Research Output
For agents that gather and synthesize information.

```json
{
  "content": {
    "title": "Research topic title",
    "summary": "2-3 sentence executive summary",
    "findings": [
      {
        "topic": "Finding category",
        "detail": "Detailed description",
        "source": "URL or document reference",
        "confidence": "HIGH | MEDIUM | LOW",
        "relevance": "Why this matters"
      }
    ],
    "data_points": [
      {
        "metric": "Metric name",
        "value": "Value",
        "unit": "Unit",
        "source": "Source",
        "as_of": "Date"
      }
    ],
    "open_questions": ["Things that need further investigation"],
    "methodology": "How the research was conducted"
  }
}
```

### Analysis Output
For agents that process data and draw conclusions.

```json
{
  "content": {
    "title": "Analysis title",
    "summary": "2-3 sentence summary of conclusions",
    "analysis": {
      "framework": "What analytical framework was used",
      "inputs": ["List of input data sources"],
      "key_metrics": [
        {
          "name": "Metric name",
          "value": 0,
          "unit": "Unit",
          "trend": "up | down | flat",
          "benchmark": "Comparison point",
          "assessment": "What this means"
        }
      ],
      "conclusions": [
        {
          "finding": "What was concluded",
          "evidence": "Supporting data",
          "confidence": "HIGH | MEDIUM | LOW",
          "impact": "HIGH | MEDIUM | LOW"
        }
      ]
    },
    "recommendations": [
      {
        "action": "What to do",
        "rationale": "Why",
        "priority": "HIGH | MEDIUM | LOW",
        "effort": "LOW | MEDIUM | HIGH"
      }
    ],
    "risks": [
      {
        "risk": "What could go wrong",
        "likelihood": "HIGH | MEDIUM | LOW",
        "mitigation": "How to address it"
      }
    ]
  }
}
```

### Report / Written Output
For agents that produce narrative content.

```json
{
  "content": {
    "title": "Report title",
    "subtitle": "Optional subtitle or date range",
    "format": "briefing | report | memo | summary",
    "body": "Full Markdown content of the report",
    "sections": [
      {
        "heading": "Section title",
        "content": "Markdown content"
      }
    ],
    "highlights": ["Key takeaway 1", "Key takeaway 2"],
    "attachments": [
      {
        "name": "Referenced file",
        "path": "Path to related output or data file"
      }
    ]
  }
}
```

### Monitoring / Alert Output
For agents that watch for changes.

```json
{
  "content": {
    "check_type": "What was monitored",
    "status": "normal | warning | alert | critical",
    "summary": "One-line status summary",
    "alerts": [
      {
        "severity": "info | warning | critical",
        "title": "Alert title",
        "detail": "What happened",
        "detected_at": "ISO timestamp",
        "source": "Where this was detected",
        "suggested_action": "What to do about it"
      }
    ],
    "metrics": [
      {
        "name": "Metric name",
        "current_value": 0,
        "previous_value": 0,
        "threshold": 0,
        "unit": "Unit",
        "status": "normal | warning | critical"
      }
    ],
    "next_check": "When the next monitoring cycle should run"
  }
}
```

### Data Processing Output
For agents that transform or clean data.

```json
{
  "content": {
    "source": "Input data source",
    "records_processed": 0,
    "records_valid": 0,
    "records_rejected": 0,
    "processing_notes": "Any issues encountered",
    "output_file": "Path to processed data file",
    "schema_version": "Version of the output schema",
    "sample": [
      { "example": "record" }
    ]
  }
}
```

---

## When to Use JSON vs Markdown

| Output Type | Format | Reason |
|-------------|--------|--------|
| Structured data (metrics, lists, records) | JSON | Machine-readable, queryable, dashboard-friendly |
| Narrative content (reports, memos, articles) | JSON wrapper with Markdown `body` field | Structure for metadata, Markdown for readable content |
| Mixed (analysis with narrative) | JSON with Markdown in string fields | Best of both worlds |
| Raw data (CSV-like, tabular) | JSON array | Consistent with the rest of the system |

**Rule:** Always use the JSON envelope (meta + content). Put narrative content in Markdown string fields within the JSON.

---

## Output File Naming

- Pattern: `outputs/[agent-id]/YYYY-MM-DDTHH-MM.json`
- Latest: `outputs/[agent-id]/latest.json` (copy of most recent)
- Archive: `outputs/[agent-id]/archive/` (older outputs, same naming)
- Index: `outputs/[agent-id]/index.json` (manifest of all outputs)

### Index File Format

```json
{
  "agent_id": "agent-id",
  "outputs": [
    {
      "id": "agent-20260323-080000",
      "timestamp": "2026-03-23T08:00:00Z",
      "status": "final",
      "tags": ["morning-cycle"],
      "file": "2026-03-23T08-00.json"
    }
  ]
}
```

---

## SQLite Decision Criteria

Recommend SQLite when ANY of these apply:
- **Time-series data**: daily prices, metrics over time, sensor readings
- **High volume**: more than 100 outputs expected per week
- **Complex queries**: "find all outputs where metric X > Y" or "aggregate across agents"
- **Relational needs**: many-to-many relationships between entities
- **Dashboard performance**: the dashboard needs fast filtering/sorting of large datasets

If SQLite is enabled, it mirrors the filesystem — files remain the source of truth, SQLite is a read-optimized index. See spec Section 15 for schema details.

---

## TOOLS.md Generation Pattern

When generating an agent's `TOOLS.md` during onboarding, include the following for each assigned MCP server.

### Structure

```markdown
# [Agent Name] — Tools Reference

## [Server Name] ([purpose])
Brief description of what this server provides and when this agent should use it.

**Tools:**
- `server:tool_name` — What it does. Key parameters. When to use it.
- `server:other_tool` — What it does. Common patterns.

**Typical workflow:**
1. [First call] — why
2. [Second call] — using output from step 1
3. [Third call] — final result

**Do NOT use for:**
- [Clarify boundaries — what other agent or tool should be used instead]
```

### Example: Borsdata for a Research Agent

```markdown
# IRIS — Tools Reference

## Borsdata (Nordic equity data)
Primary source for all Nordic stock market data. Covers instruments listed
on Nasdaq Stockholm, Oslo Børs, Copenhagen, and Helsinki exchanges.

**Tools:**
- `borsdata:search_instruments` — Find instruments by name or ticker.
  Always call this first to get the instrumentId needed for other calls.
- `borsdata:get_stock_prices` — Historical daily OHLCV data. Use for
  price charts and trend analysis.
- `borsdata:get_reports` — Annual, R12, and quarterly financial statements.
  Specify report_type: "year", "r12", or "quarter".
- `borsdata:get_kpi` — Single KPI value for one instrument. Use kpiId
  from the KPI reference list.
- `borsdata:get_kpi_history` — Historical KPI values. Useful for tracking
  valuation trends (P/E, EV/EBITDA) over time.

**Typical workflow:**
1. `search_instruments` with company name → get instrumentId
2. `get_stock_prices` for recent price data
3. `get_reports` for latest financials
4. `get_kpi_history` for valuation multiples trend

**Do NOT use for:**
- Non-Nordic equities (use web search instead)
- Real-time intraday prices (Borsdata provides end-of-day data)
- News or qualitative analysis (use web search)

## Web Search (general research)
Use for news, press releases, qualitative research, and any data not
covered by Borsdata.

**Tools:**
- `web_search` — Search the web for current information.

**Do NOT use for:**
- Nordic equity fundamentals (use Borsdata — it's more structured and reliable)
```

### Guidelines

- Include ALL assigned MCP servers, not just the primary one
- Include built-in tools (web search, file read/write) if the agent uses them
- Each server section should have: tools list, typical workflow, and do-not-use boundaries
- Scope boundaries are critical — they prevent agents from stepping on each other's territory
- If the user gave specific guidance during onboarding (e.g., "IRIS only uses run_stress_test from the optimizer"), reflect that in the do-not-use section
