# Feature Request: MCP Server Auto-Discovery, Configuration & Tool-to-Agent Mapping

**Feature ID:** VORG-FR-003
**Priority:** High
**Status:** Ready for implementation
**Depends on:** VibeOrg v0.2 spec (already built)
**Estimated effort:** 6-8 hours

---

## Summary

Add full MCP server support to the VibeOrg scaffolding and onboarding flow. A user can point Claude at GitHub repo URLs for their MCP servers and have Claude auto-discover the tools, configure `.mcp.json`, set up API keys, assign tools to agents with usage guidance, and generate `TOOLS.md` documentation — all through conversation. The user should never have to manually edit `.mcp.json` or write `TOOLS.md` files themselves. The same flow should be available post-onboarding when adding new servers.

---

## Problem

The current scaffolding has no structured pattern for:

1. Configuring MCP servers in `.mcp.json` from a GitHub URL
2. Discovering what tools an MCP server provides
3. Mapping MCP tools to specific agents with usage guidance
4. Telling the orchestrator which agents have which tools (for routing decisions)
5. Documenting tool availability and usage per agent
6. Adding new MCP servers after initial setup

Without this, the user has to manually read READMEs, figure out `.mcp.json` syntax, write `TOOLS.md` files by hand, and keep `agents.json` in sync — all of which Claude should handle.

---

## What to Build

### 1. Add `mcp_tools` Field to `agents.json` Schema

**File:** `agents/agents.json`

Add `mcp_tools` and `mcp_tool_notes` to each agent definition:

```json
{
  "agents": [
    {
      "id": "iris",
      "name": "IRIS",
      "role": "Research & Analysis",
      "mcp_tools": ["borsdata", "web-search"],
      "mcp_tool_notes": {
        "borsdata": "Use for all Nordic equity data lookups — instruments, prices, KPIs, reports",
        "web-search": "Use for news, press releases, and non-structured research"
      },
      ...
    },
    {
      "id": "finn",
      "name": "FINN",
      "role": "Financial Analysis",
      "mcp_tools": ["borsdata", "portfolio-optimizer"],
      "mcp_tool_notes": {
        "borsdata": "Use for valuation data, KPIs, and financial reports",
        "portfolio-optimizer": "Use for portfolio construction, rebalancing, risk analysis"
      },
      ...
    }
  ]
}
```

The `mcp_tools` array references keys in `.mcp.json`. The `mcp_tool_notes` object gives the orchestrator and the agent context about when and how to use each tool.

### 2. Update Onboarding Phase 5 — MCP Server Configuration

**File:** `onboarding/ONBOARDING_FLOW.md`

Add a comprehensive MCP configuration section within Phase 5 (MCP & Integrations). This section has four steps that run sequentially:

```markdown
### MCP Server Configuration

Ask the user:
"Do you have any MCP servers or external tools your agents should use? 
 You can just give me GitHub repo URLs, npm package names, or describe 
 what you need."

The user may respond with:
- GitHub URLs (e.g., "github.com/carlwestman/borsdata-mcp-server")
- Plain descriptions (e.g., "I need Slack integration and stock data")
- A mix of both

#### Step 1: GitHub Auto-Discovery

For each GitHub URL the user provides:

1. Fetch the repo's README using web search or web fetch.
   Try in order:
   - Fetch: https://raw.githubusercontent.com/{user}/{repo}/main/README.md
   - Fetch: https://raw.githubusercontent.com/{user}/{repo}/master/README.md
   - Search: "github.com/{user}/{repo}" and read the repo page

   Also check for:
   - package.json (for dependencies, scripts, entry point)
   - .env.example (for required environment variables)
   - src/index.ts or index.js (for tool definitions if README is sparse)

2. Parse the README to extract:
   - What the server does (purpose, data domain)
   - List of tools/functions it exposes (names + descriptions)
   - Required environment variables or API keys
   - Any build steps or runtime requirements (Node, Bun, Python, etc.)
   - Any dependencies or configuration options

3. Present a summary to the user:
   "I found borsdata-mcp-server — 27 tools for Nordic equity data 
    including instruments, prices, reports, KPIs, insider holdings, 
    and more. It needs a BORSDATA_API_KEY. Want me to add it?"

4. Generate the .mcp.json entry:

   For repos that can run via npx (have a proper package.json with bin):
   {
     "borsdata": {
       "command": "npx",
       "args": ["-y", "github:user/repo"],
       "env": { "BORSDATA_API_KEY": "${BORSDATA_API_KEY}" }
     }
   }

   For repos that need cloning and building:
   {
     "borsdata": {
       "command": "node",
       "args": ["./mcp-servers/borsdata-mcp-server/dist/index.js"],
       "env": { "BORSDATA_API_KEY": "${BORSDATA_API_KEY}" }
     }
   }
   Inform the user: "This server needs to be built locally. I'll clone 
   it to ./mcp-servers/ and run the build step."
   Then run:
     mkdir -p mcp-servers
     cd mcp-servers && git clone <repo-url>
     cd <repo-name> && npm install && npm run build

   For remote URL-based servers (e.g., Slack, Gmail):
   {
     "slack": { "type": "url", "url": "https://mcp.slack.com/sse" }
   }

5. Guide the user through API key setup:
   - Add key name to .env.example with a comment explaining where to get it
   - Ask the user: "Paste your Borsdata API key:"
   - Save to .env
   - If the README mentions where to get the key, tell the user
   - If possible, verify the key works (e.g., make a test API call)

6. Handle discovery failures gracefully:
   If the README is sparse or missing:
   - Ask: "I couldn't find a detailed tool listing in the README. 
     Can you tell me what this server does and what tools it provides?"
   - Or: "Want me to try starting the server to discover its tools? 
     I'll run `claude /mcp` after configuring it."
   If the repo is private:
   - "I can't access that repo — it may be private. Can you describe 
     what it does, or paste the relevant section of the README here?"

For plain descriptions (no URL), suggest known MCP servers from the 
common patterns table (see Section 6 below), or ask the user if they 
have a specific server in mind.

#### Step 2: Tool-to-Agent Assignment

After ALL MCP servers are configured, present the full tool landscape 
and propose assignments. This should be a single conversation turn:

"Here's everything your agents can work with:

 MCP Servers:
 • borsdata (27 tools) — Nordic equity data
 • portfolio-optimizer (7 tools) — Portfolio optimization & risk

 Built-in tools:
 • web search — Web research
 • file read/write — Filesystem access

 Your agents:
 • IRIS — Research & Analysis
 • FINN — Financial Modeling
 • EDNA — Report Writing

 I'd suggest this mapping:

 IRIS (Research):
   • borsdata — for company lookups, price history, financial reports
   • web search — for news, press releases, qualitative research
   Typical flow: search_instruments → get_stock_prices → get_reports

 FINN (Analysis):
   • borsdata — for valuation KPIs and financial data
   • portfolio-optimizer — full suite for portfolio construction
   Typical flow: get_kpi → calculate_risk_decomposition → 
                 analyze_what_if_trade

 EDNA (Reports):
   • No MCP tools — works from IRIS and FINN output files
   • web search — only if needed for fact-checking

 Does this look right? Want to change anything?"

Let the user adjust. They might say things like:
- "IRIS should also have portfolio-optimizer for quick stress tests"
  → Add portfolio-optimizer to IRIS, scoped to run_stress_test only
- "Only FINN should use the optimizer"
  → Restrict portfolio-optimizer to FINN
- "Don't give EDNA web search"
  → Remove web search from EDNA
- "Give everyone borsdata"
  → Add borsdata to all agents with role-appropriate usage notes

After each adjustment, confirm the updated mapping before proceeding.

#### Step 3: Usage Guidance Per Agent

For each agent-tool pairing, generate specific guidance covering:

- **When to use it**: "Use borsdata when researching Nordic equities. 
  For non-Nordic stocks, use web search instead."
- **Typical call sequence**: "Always call search_instruments first 
  to get the instrumentId, then use it for all subsequent calls."
- **Scope boundaries**: "IRIS uses portfolio-optimizer ONLY for 
  run_stress_test when evaluating a new position. For full portfolio 
  optimization, hand off to FINN."
- **What NOT to do**: "Don't use get_latest_prices for research — 
  that's end-of-day data only."

Present the proposed guidelines:
"I've drafted usage guidelines for each agent. Here's what I have:

 IRIS using Borsdata:
 - Always search_instruments first to get the instrument ID
 - Use get_stock_prices for price trends
 - Use get_reports for latest financials (prefer 'r12' report type)
 - Use get_kpi_history for valuation multiples over time
 - Don't use get_latest_prices (IRIS focuses on research, not trading)

 FINN using portfolio-optimizer:
 - Use calculate_risk_decomposition before suggesting changes
 - Use analyze_what_if_trade to evaluate proposed positions
 - Use optimize_mean_variance for full rebalancing analysis
 - Always run run_stress_test on proposed portfolio changes

 Should I adjust any of these?"

The user's answers flow directly into each agent's TOOLS.md and 
into the mcp_tool_notes field in agents.json.

#### Step 4: Generate Configuration Files

After the conversation is complete:

1. Write/update .mcp.json with all configured servers
2. Update agents.json with mcp_tools arrays and mcp_tool_notes
3. Generate TOOLS.md for each agent (see Section 3 for format)
4. Create/update MCP_SERVERS.md with the full server reference
5. Update .env.example and .env with all required keys
```

### 3. TOOLS.md Generation Patterns

**File:** `onboarding/OUTPUT_DESIGN_GUIDE.md` (or create `onboarding/TOOLS_GUIDE.md`)

Add patterns for generating useful TOOLS.md files:

```markdown
# MCP Tool Documentation Pattern

When generating an agent's TOOLS.md, include for each assigned MCP server:

## Structure

### [Server Name] ([purpose])
Brief description of what this server provides and when to use it.

**Tools:**
- `server:tool_name` — What it does. Key parameters. When to use it.
- `server:other_tool` — What it does. Common patterns.

**Usage patterns:**
- Describe the typical sequence of calls (e.g., "search first to get an 
  ID, then use the ID for detail lookups")
- Note any rate limits or constraints
- Note any data format expectations (e.g., "returns JSON with a 'data' 
  array, each item has 'instrumentId' and 'name'")

**Do NOT use for:**
- Clarify boundaries (e.g., "Do not use Borsdata for non-Nordic stocks. 
  Use web search for US/global equities instead.")

## Example: Borsdata for a Research Agent

### Borsdata (Nordic equity data)
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
```

### 4. Update Orchestrator Delegation Protocol

**File:** `CLAUDE.md`

Add MCP tool awareness to the delegation and routing logic:

```markdown
## Delegation Protocol

When spawning a subagent via the Task tool:
1. Read the agent's PERSONA.md
2. Read the agent's TOOLS.md
3. Read the agent's memory.md
4. Read memory/shared/PROJECT_CONTEXT.md
5. Identify any input files the task requires
6. Compose task prompt:
   - Agent role & identity (from PERSONA.md)
   - Available tools and usage guidance (from TOOLS.md)
   - Relevant memory context
   - Specific task instructions
   - File paths to read for input
   - Expected output format (from OUTPUT_SCHEMA.json)
   - Where to write output

## Task Routing — Tool-Aware

When deciding which agent handles a task, consider MCP tool access:
- Check agents.json → mcp_tools for each agent
- If the task requires a specific MCP tool, route to an agent that has it
- If multiple agents have the tool, route to the one whose role best 
  matches the task
- Example: A request to "analyze portfolio risk" should go to an agent 
  with portfolio-optimizer access AND an analyst role, not just any agent 
  that happens to have the tool
```

### 5. Create `MCP_SERVERS.md` Reference

**File:** `MCP_SERVERS.md` (new file in project root)

Since `.mcp.json` is pure JSON with no comments, this companion file provides human-readable documentation:

```markdown
# MCP Server Reference

This project uses the following MCP servers. They are configured in 
`.mcp.json` and assigned to agents in `agents/agents.json`.

## Configured Servers

### borsdata
- **Source:** github:carlwestman/borsdata-mcp-server
- **Purpose:** Nordic equity market data (prices, financials, KPIs)
- **API key required:** Yes (BORSDATA_API_KEY in .env)
- **Assigned to:** IRIS (research), FINN (analysis)
- **Documentation:** https://github.com/carlwestman/borsdata-mcp-server

### portfolio-optimizer
- **Source:** github:carlwestman/portfolio-optimizer-mcp-server
- **Purpose:** Portfolio optimization, risk decomposition, stress testing
- **API key required:** No
- **Assigned to:** FINN (analysis)
- **Documentation:** https://github.com/carlwestman/portfolio-optimizer-mcp-server

## Adding a New MCP Server

You can add a new MCP server at any time by telling Claude:
  "Add this MCP server: github.com/user/repo-name"

Claude will fetch the README, discover the tools, configure .mcp.json, 
and ask which agents should have access.

To add one manually:
1. Add it to `.mcp.json` with the appropriate command and args
2. Add any required API keys to `.env` and `.env.example`
3. Run `claude /mcp` to verify the server starts and list its tools
4. Update `agents/agents.json` to assign the server to relevant agents
5. Update the assigned agents' `TOOLS.md` files with tool documentation
6. Update this file with the server's details
7. Restart Claude Code for .mcp.json changes to take effect
```

### 6. Common MCP Server Patterns Reference

**File:** `onboarding/ONBOARDING_FLOW.md`

Add a reference table for the onboarding to use when the user describes needs without providing URLs:

```markdown
### Common MCP Server Patterns

When the user describes their needs, suggest relevant MCP servers:

| User Need | Suggested MCP Server | Source |
|-----------|---------------------|--------|
| "Slack integration" | Slack MCP | type: url, url: https://mcp.slack.com/sse |
| "Email" | Gmail MCP | type: url, url: https://gmail.mcp.claude.com/mcp |
| "Calendar" | Google Calendar MCP | type: url, url: https://gcal.mcp.claude.com/mcp |
| "File system access" | Filesystem MCP | npx @modelcontextprotocol/server-filesystem |
| "Database access" | Postgres/SQLite MCP | npx @modelcontextprotocol/server-postgres |
| "Web scraping" | Puppeteer MCP | npx @modelcontextprotocol/server-puppeteer |
| "GitHub" | GitHub MCP | npx @modelcontextprotocol/server-github |

Also check:
- https://github.com/modelcontextprotocol/servers — official MCP servers
- The user may have their own MCP servers on GitHub — always ask

For user-provided MCP servers from GitHub:
- Check if they have a README with tool documentation
- Check if they need environment variables (look for .env.example)
- Prefer npx github:user/repo for quick setup, local clone for production
```

### 7. Post-Onboarding: Adding MCP Servers Later

**File:** `CLAUDE.md`

Add instructions so the same discovery and assignment flow is available after onboarding:

```markdown
## Adding MCP Servers After Setup

When the user says something like "add this MCP server: github.com/user/repo" 
or "I want to connect a new tool":

1. Run the same GitHub auto-discovery flow as during onboarding:
   - Fetch the README, extract tools, identify API keys
   - Present summary, ask for confirmation
2. Generate the .mcp.json entry and handle API keys
3. Ask which agent(s) should get access and how they should use it
4. Update .mcp.json, agents.json, the relevant TOOLS.md files, 
   and MCP_SERVERS.md
5. Remind the user: "Restart Claude Code for the new MCP server to 
   be available. Run `claude` again in this project."
```

---

## Files Changed (Summary)

| File | Change Type | Description |
|------|------------|-------------|
| `agents/agents.json` | Schema change | Add `mcp_tools` and `mcp_tool_notes` fields per agent |
| `onboarding/ONBOARDING_FLOW.md` | Modify | Add full MCP server discovery, assignment, and guidance flow |
| `onboarding/OUTPUT_DESIGN_GUIDE.md` | Modify | Add TOOLS.md generation patterns |
| `CLAUDE.md` | Modify | Add TOOLS.md to delegation protocol, tool-aware routing, post-setup MCP flow |
| `MCP_SERVERS.md` | Create | Human-readable MCP server reference with manual and assisted setup instructions |

Files generated during onboarding (not scaffolding changes, but produced per project):
| `.mcp.json` | Generated | MCP server entries auto-generated from GitHub repos |
| `agents/[name]/TOOLS.md` | Generated | Per-agent tool documentation with usage guidance |
| `.env` / `.env.example` | Updated | API keys discovered from repos |

---

## Example Conversation Flow

```
Claude: "Do you have any MCP servers or external tools your agents 
         should use? You can just give me GitHub repo URLs."

User:   "github.com/carlwestman/borsdata-mcp-server and 
         github.com/carlwestman/portfolio-optimizer-mcp-server"

Claude: [fetches both READMEs]
        "Found both. Here's what they provide:

         borsdata-mcp-server — 27 tools for Nordic equity data:
         search_instruments, get_stock_prices, get_reports, get_kpi, 
         get_kpi_history, get_insider_holdings, get_dividend_calendar, 
         get_short_positions, and 19 more.
         Needs: BORSDATA_API_KEY

         portfolio-optimizer-mcp-server — 7 tools:
         optimize_mean_variance, optimize_equal_risk_contribution, 
         calculate_risk_decomposition, analyze_what_if_trade, 
         run_stress_test, generate_rebalance_trades, backtest_strategy.
         No API key needed.

         I've added both to .mcp.json. Paste your Borsdata API key:"

User:   "sk-bors-xxxxx"

Claude: "Saved. Now let's decide who gets what.

         I'd suggest:

         IRIS (Research):
           • borsdata — company lookups, price history, financials
           • web search — news and qualitative research
           Flow: search_instruments → get_stock_prices → get_reports

         FINN (Analysis):
           • borsdata — valuation KPIs, financial data
           • portfolio-optimizer — full suite for portfolio construction
           Flow: get_kpi → calculate_risk_decomposition → 
                 analyze_what_if_trade

         EDNA (Reports):
           • No MCP tools — works from IRIS and FINN output files

         Does this mapping work?"

User:   "IRIS should also be able to run stress tests from the 
         optimizer when researching a new position. And give EDNA 
         web search for fact-checking."

Claude: "Done. Updated mapping:

         IRIS: borsdata (full), portfolio-optimizer (run_stress_test 
               only), web search
         FINN: borsdata (full), portfolio-optimizer (full suite)
         EDNA: web search (for fact-checking only)

         I've drafted usage guidelines for each agent. Here's IRIS:
         - Always call search_instruments first to get the instrumentId
         - Use get_stock_prices for price trends
         - Use get_reports with 'r12' report type for latest financials
         - Use run_stress_test when evaluating a potential new position
         - For full portfolio optimization, hand off to FINN

         And FINN:
         - Use calculate_risk_decomposition before suggesting changes
         - Use analyze_what_if_trade to evaluate proposed trades
         - Always run run_stress_test on portfolio changes
         - Use optimize_mean_variance for full rebalancing

         Should I adjust any of these?"

User:   "Looks good."

Claude: "Done. I've updated agents.json, generated TOOLS.md for each 
         agent, and created MCP_SERVERS.md with the full reference."
```

---

## Acceptance Criteria

1. User can paste GitHub repo URLs and Claude auto-discovers the server's tools, API key requirements, and generates the `.mcp.json` entry — without the user reading the repo's README
2. If a README is missing or sparse, Claude falls back gracefully to asking the user or attempting `claude /mcp` for live tool discovery
3. For repos that need building (no npx support), Claude clones to `./mcp-servers/`, runs the build, and configures `.mcp.json` to point at the local build
4. After all servers are configured, Claude presents the full tool landscape alongside the agent roster and proposes a mapping in a single conversational turn
5. The user can adjust the mapping conversationally (e.g., "give IRIS stress tests too but not the full optimizer") and Claude updates accordingly
6. Each agent's generated `TOOLS.md` includes tool-specific usage guidance, typical call sequences, and scope boundaries reflecting the user's input
7. `agents.json` includes `mcp_tools` and `mcp_tool_notes` per agent, used by the orchestrator for tool-aware task routing
8. `MCP_SERVERS.md` provides a clear reference of all configured servers
9. Post-onboarding, the user can say "add this MCP server: [github URL]" and get the same discovery and assignment flow
10. The delegation protocol in CLAUDE.md includes reading TOOLS.md when spawning subagents

---

## Out of Scope

- Building or modifying MCP servers (user brings their own)
- Runtime tool access enforcement (all MCP servers are available to the full Claude Code session; agent-level restriction is convention-based via personas and TOOLS.md, not enforced programmatically)
- MCP server health monitoring in the dashboard (future FR)
- Auto-scanning the user's GitHub account for MCP server repos (future)
- Handling private GitHub repos requiring auth to read the README (user describes the server manually or pastes README content)
