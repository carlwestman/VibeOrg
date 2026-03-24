# VibeOrg — Concept & Technical Specification

**Version:** 0.2.0
**Date:** 2026-03-23
**Author:** Carl (concept) + Claude (spec)
**License:** MIT
**Status:** Ready for dev agent handoff

---

## 1. Executive Summary

VibeOrg is an open-source scaffolding framework that lets anyone spin up a team of AI agents inside a Claude Code project. It provides the structure, conventions, memory systems, and a custom-generated Next.js dashboard — all configured through a guided conversational onboarding flow.

**The analogy:** VibeOrg is to AI agent teams what `create-next-app` is to web projects — clone, run one command, answer some questions, and you have a working system.

**The mental model:** A manager leading a team. The human is the manager. Claude (via Claude Code) is the orchestrator/COO. The subagents are the team members. The manager doesn't do the work — they hire the right people, define roles and responsibilities, set strategy and goals, delegate work, review outputs, and adjust over time. The web dashboard is the company's internal reporting system: it presents outputs tailored to the specific business, but all actions flow through the orchestrator via Claude Code.

**Claude Code only.** VibeOrg is built exclusively for Claude Code. No abstraction layers for other AI coding agents.

---

## 2. Core Principles

1. **The UI is a window, not a cockpit.** The Next.js dashboard is primarily read-only and navigational. The user interacts with their agent team through Claude Code, not through the dashboard. The dashboard may include a settings page that writes to configuration files (`vibeorg.config.json`, theme preferences, agent persona tweaks), but it never triggers agent actions, workflows, or data mutations. All business logic flows through the orchestrator via Claude Code.

2. **Files are the database.** Agents read and write structured files (JSON, Markdown). The filesystem is the source of truth. SQLite is available as an optional optimization layer but never as the primary store — files must always be human-readable and git-trackable.

3. **Convention over configuration.** Strong defaults for folder structure, file naming, memory formats, and output schemas. Everything is overridable, but you shouldn't need to override anything to get started.

4. **Progressive disclosure.** The `/init` onboarding asks simple questions first and only gets detailed if the user wants to go deep. A user can be productive in 15 minutes or spend an hour fine-tuning.

5. **Git-native.** Everything is version-controlled. Agent memory, outputs, configurations — all in git. The history of what your AI team has done is your commit history.

6. **The dashboard is generated, not templated.** The Next.js application is custom-built by Claude during onboarding based on the specific use case, domain, and outputs the user describes. An investment research team gets portfolio views, position detail pages, and report browsers. A teaching assistant team gets lesson plan browsers, calendar views, and curriculum browsers. The dashboard is a bespoke application, not a generic output viewer with different data plugged in.

---

## 3. Target User

Technical professionals who are comfortable with git, the command line, environment variables, and running `npm install`. They have a GitHub account and can follow deployment instructions. They are NOT necessarily professional software developers — they might be analysts, operators, founders, or domain experts who are comfortable in a terminal. Don't dumb it down, but don't assume knowledge of React internals or TypeScript generics either. Claude Code is the primary interface — when something goes wrong, the user asks Claude to fix it.

---

## 4. User Journey

### 4.1 The Complete Flow

```
1. git clone https://github.com/[org]/vibeorg.git my-project
2. cd my-project
3. claude   (starts Claude Code in the project)
4. /init    (triggers the onboarding flow)
```

The `/init` slash command is implemented via CLAUDE.md instructions that detect the command and begin the guided setup. Claude reads `/onboarding/ONBOARDING_FLOW.md` and walks the user through:

**Phase 1 — Business Context (2-3 minutes)**
- What does your business/project do?
- What are you trying to accomplish with this agent team?
- What are the key outputs you need? (reports, analyses, emails, data, code, etc.)
- Are there external data sources or APIs involved?
- What's the cadence? (on-demand, daily, weekly, event-driven)

**Phase 2 — Team Design (3-5 minutes)**
- Based on Phase 1, Claude proposes an agent team structure
- For each proposed agent: name, role, responsibilities, key outputs
- User can accept, modify, add, or remove agents
- Claude proposes interaction patterns (who talks to whom, in what order)
- Claude proposes memory strategy (what to remember, what to forget)

**Phase 3 — Output Design (2-3 minutes)**
- For each agent, Claude proposes output schemas (JSON structure, Markdown templates)
- Claude proposes the folder structure for outputs
- User reviews and adjusts
- Claude determines if SQLite is warranted (high-volume structured data, time-series, need for queries)

**Phase 4 — Dashboard Design & Theming (2-3 minutes)**

Based on everything learned so far, Claude proposes:

*a) Page structure* — which pages/views the dashboard needs:

| Use Case | Proposed Pages |
|----------|----------------|
| Investment research | Portfolio overview, Position detail, Research reports, Market data feed, Watchlist |
| Teaching assistant | Lesson plans browser, Weekly schedule, Curriculum map, Resource library, Student progress |
| Accounting team | Document inbox, Posting suggestions, GL account browser, Reconciliation status, Audit trail |
| Content marketing | Content calendar, Draft pipeline, Published content, Analytics summary, Brand guidelines |

Claude presents a proposed sitemap and lets the user add, remove, or rename pages.

*b) Visual design direction* — Claude proposes 2-3 design themes based on the domain:

| Domain Signal | Proposed Direction |
|---------------|-------------------|
| Finance, legal, accounting | Clean, professional. Muted palette (slate, navy, white). Dense data layouts. Monospace numbers. |
| Education, children, creative | Warm, playful. Rounded corners, friendly colors (teal, coral, amber). Spacious layouts. |
| Engineering, DevOps, technical | Minimal, functional. Dark mode default. Terminal-inspired. High information density. |
| Healthcare, wellness | Calm, trustworthy. Soft blues and greens. Generous whitespace. Clear hierarchy. |
| General / mixed | Modern neutral. The "Linear" aesthetic — clean, dark/light toggle, subtle color accents. |

The user picks a direction or describes their own. The choice is stored in `vibeorg.config.json`:

```json
{
  "theme": {
    "direction": "professional-finance",
    "primary_color": "#1e3a5f",
    "accent_color": "#3b82f6",
    "mode": "dark",
    "density": "comfortable",
    "font_body": "Inter",
    "font_mono": "JetBrains Mono",
    "border_radius": "sm",
    "custom_notes": "User wants portfolio page to feel like a Bloomberg terminal lite"
  }
}
```

*c) Data visualization preferences* — If the use case involves quantitative data, Claude asks about preferred chart types, KPI display style, and whether the user wants dense data tables or card-based layouts.

**Phase 5 — MCP & Integrations (1-2 minutes)**
- Do any agents need external services? (web search, Slack, email, Google Drive, APIs, databases)
- Claude configures `.mcp.json` for project-level MCP servers
- Claude creates `.env.example` with all required keys, guides the user through setting up `.env`
- Verifies connectivity where possible (test API calls)
- Any scheduled tasks? (fetch data from APIs, periodic agent runs)
- Claude configures node-cron jobs and creates the scheduler config

**Phase 6 — Deployment Mode (1 minute)**
- Will you run this locally or on a remote server?
- If remote: preferred access method, dashboard auth preference
- Claude generates appropriate deployment configs

**Phase 7 — Build (automated, 5-10 minutes)**

This is where Claude Code does the heavy lifting:

*a) Scaffolds the agent system:*
- Creates all agent directories, persona files, output schemas, memory files
- Populates `agents.json` and `workflows.json`
- Writes the full CLAUDE.md orchestrator instructions
- Configures `.mcp.json` for any MCP servers needed
- Creates `.env.example` with required environment variables

*b) Generates the custom Next.js dashboard:*

This is NOT a template with data plugged in. Claude writes each page and component specifically for this use case:
- Generates `app/` route structure matching the agreed sitemap
- Writes page components with domain-appropriate layouts (e.g., a portfolio overview page with holdings table, allocation chart, and P&L summary — not a generic "outputs list")
- Creates typed interfaces in `lib/types.ts` matching the actual output schemas
- Builds custom data readers in `lib/fs-reader.ts` that understand the specific file structures
- Applies the chosen theme via a Tailwind config and CSS variables
- Creates domain-specific components (e.g., `PositionCard.tsx`, `LessonPlanViewer.tsx`, `PostingSuggestion.tsx`)

*c) Seeds with realistic test data:*
- Generates 5-10 example outputs per agent that match the output schemas
- Creates plausible memory entries
- Populates shared memory with project context
- The dashboard should look fully functional with this seed data

*d) Starts the dev server:*
- `npm install` in the dashboard directory
- `npm run dev`
- Hands the user `http://localhost:3000` with a working, populated dashboard

*e) Walks the user through what was built:*
- Brief tour of the generated pages
- Explains how to iterate ("tell me to change the portfolio page layout" or "edit dashboard/app/portfolio/page.tsx directly")
- Shows where agent outputs land and how the dashboard picks them up

The onboarding saves a build manifest (`onboarding/build-manifest.json`) documenting every file that was generated and why, so future `/reconfigure` runs know what to regenerate.

**Phase 8 — Iterate**
- User can modify anything through Claude Code conversation
- User can also edit files directly in their editor
- Running `/add-agent` adds a new agent through a mini-onboarding
- Running `/reconfigure` re-enters the setup flow for specific sections

### 4.2 Post-Setup Daily Usage

```
User: "Run the morning research cycle"
Claude (orchestrator): reads agents.json, identifies the workflow, 
  spawns IRIS → passes output file ref to FINN → writes reports → updates memory
User: opens localhost:3000, sees the new reports in the dashboard
```

```
User: "IRIS isn't giving enough detail on competitor analysis, fix that"
Claude: updates IRIS's persona, adjusts output schema, shows diff
```

```
[6:00 AM, cron fires]
Scheduler: fetches market data from API → saves to /data/incoming/
Scheduler: triggers Claude Code with "Process morning data feed"
Claude: orchestrates the agent pipeline, writes outputs
[User wakes up, opens dashboard, everything is there]
```

---

## 5. Project Structure

```
vibeorg-project/
│
├── CLAUDE.md                          # Master orchestrator instructions
├── .mcp.json                          # Project-level MCP server configuration
├── package.json                       # Node.js project root
├── vibeorg.config.json                # Project-level VibeOrg configuration
├── .env.example                       # Required environment variables (committed)
├── .env                               # Actual secrets (gitignored)
├── .gitignore
│
├── onboarding/                        # Onboarding flow definitions
│   ├── ONBOARDING_FLOW.md             # Master onboarding script for Claude
│   ├── TEAM_DESIGN_GUIDE.md           # Heuristics for proposing agent teams
│   ├── OUTPUT_DESIGN_GUIDE.md         # Patterns for output schemas
│   ├── DASHBOARD_DESIGN_GUIDE.md      # Patterns for generating dashboard pages
│   ├── build-manifest.json            # Record of all generated files and why
│   └── templates/                     # Reference templates (Claude adapts, not copies)
│       ├── agent-persona.md.tmpl
│       ├── agent-memory.md.tmpl
│       └── output-schema.json.tmpl
│
├── agents/                            # Agent definitions
│   ├── agents.json                    # Agent registry (roles, routing, capabilities)
│   ├── workflows.json                 # Defined multi-agent workflows
│   ├── orchestrator/
│   │   └── ORCHESTRATOR.md            # Orchestrator behavior & delegation rules
│   ├── [agent-name]/                  # One directory per agent
│   │   ├── PERSONA.md                 # System prompt / role definition
│   │   ├── OUTPUT_SCHEMA.json         # JSON Schema for this agent's outputs
│   │   ├── EXAMPLES.md                # Few-shot examples of good outputs
│   │   └── TOOLS.md                   # Tools/capabilities this agent can use
│   └── ...
│
├── memory/                            # All persistent memory
│   ├── MEMORY_PROTOCOL.md             # Rules for reading/writing memory
│   ├── shared/                        # Institutional / collective memory
│   │   ├── PROJECT_CONTEXT.md         # What this project is, current state
│   │   ├── DECISIONS_LOG.md           # Key decisions with rationale
│   │   ├── GLOSSARY.md                # Domain-specific terminology
│   │   └── LESSONS_LEARNED.md         # What went wrong, what works
│   └── agents/                        # Per-agent memory
│       └── [agent-name]/
│           └── memory.md              # Agent's personal memory file
│
├── outputs/                           # All agent outputs (the "data layer")
│   ├── [agent-name]/                  # Outputs organized by producing agent
│   │   ├── latest.json                # Most recent output (symlink or copy)
│   │   ├── archive/                   # Historical outputs
│   │   │   └── 2026-03-23T08-00.json
│   │   └── index.json                 # Manifest of all outputs
│   └── ...
│
├── data/                              # External data & feeds
│   ├── incoming/                      # Raw data from APIs/fetches
│   ├── processed/                     # Cleaned/transformed data
│   └── sources.json                   # Data source registry
│
├── workflows/                         # Workflow definitions
│   ├── [workflow-name].json           # Step-by-step workflow config
│   └── ...
│
├── scheduler/                         # Scheduled task system
│   ├── scheduler.js                   # node-cron runner
│   ├── tasks.json                     # Task definitions (cron expressions + actions)
│   └── logs/                          # Execution logs
│       └── scheduler.log
│
├── dashboard/                         # Next.js web UI (generated per use case)
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.ts             # Generated from theme settings
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with navigation
│   │   ├── page.tsx                   # Home / overview dashboard
│   │   ├── status/
│   │   │   └── page.tsx               # System health & agent activity
│   │   ├── settings/
│   │   │   └── page.tsx               # Configuration editor (limited writes)
│   │   ├── [domain-specific-pages]/   # Generated based on use case
│   │   │   └── ...                    # e.g., /portfolio, /positions, /reports
│   │   └── api/                       # Internal API routes (mostly read-only)
│   │       ├── outputs/route.ts
│   │       ├── memory/route.ts
│   │       └── settings/route.ts      # Limited write capability
│   ├── components/
│   │   ├── layout/                    # Sidebar, Header, Breadcrumbs
│   │   ├── common/                    # JsonViewer, MarkdownRenderer, etc.
│   │   └── [domain-specific]/         # Generated per use case
│   └── lib/
│       ├── fs-reader.ts               # Reads from /outputs, /memory, /agents
│       ├── types.ts                   # TypeScript types matching output schemas
│       └── config.ts                  # Reads vibeorg.config.json
│
├── deploy/                            # Cloud deployment configs (if configured)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── DEPLOY.md                      # Step-by-step deployment guide
│   └── scripts/
│       ├── setup-server.sh
│       ├── setup-cloudflare.sh
│       └── setup-tailscale.sh
│
├── scripts/                           # Utility scripts
│   ├── seed-test-data.js
│   ├── validate-schemas.js
│   └── export.js
│
├── db/                                # Optional SQLite (only if configured)
│   ├── vibeorg.db
│   └── migrations/
│
├── PLUGIN_SPEC.md                     # Plugin architecture documentation (for v0.2+)
│
└── .github/
    ├── README.md
    ├── CONTRIBUTING.md
    └── workflows/
        └── validate.yml
```

---

## 6. Key Data Structures

### 6.1 `vibeorg.config.json` — Project Configuration

```json
{
  "version": "0.2.0",
  "project": {
    "name": "My Investment Research Team",
    "description": "AI team for Nordic equity research and analysis",
    "created": "2026-03-23T10:00:00Z"
  },
  "settings": {
    "use_sqlite": false,
    "memory_max_entries_per_agent": 100,
    "memory_summarize_after": 50,
    "output_archive_days": 90,
    "dashboard_port": 3000,
    "scheduler_enabled": true,
    "deployment_mode": "local"
  },
  "theme": {
    "direction": "professional-finance",
    "primary_color": "#1e3a5f",
    "accent_color": "#3b82f6",
    "mode": "dark",
    "density": "comfortable",
    "font_body": "Inter",
    "font_mono": "JetBrains Mono",
    "border_radius": "sm",
    "custom_notes": ""
  },
  "data_sources": [
    {
      "id": "market-data",
      "type": "rest_api",
      "url": "https://api.example.com/prices",
      "schedule": "0 6 * * 1-5",
      "output_path": "/data/incoming/market-data/"
    }
  ]
}
```

### 6.2 `agents/agents.json` — Agent Registry

```json
{
  "agents": [
    {
      "id": "iris",
      "name": "IRIS",
      "role": "Research & Analysis",
      "description": "Conducts market research, competitive analysis, and due diligence",
      "persona_file": "agents/iris/PERSONA.md",
      "memory_path": "memory/agents/iris/memory.md",
      "output_dir": "outputs/iris/",
      "output_schema": "agents/iris/OUTPUT_SCHEMA.json",
      "capabilities": ["web_research", "document_analysis", "competitor_tracking"],
      "receives_from": ["orchestrator", "finn"],
      "hands_off_to": ["finn", "felix"],
      "tools": ["web_search", "file_read", "file_write"]
    }
  ],
  "interaction_rules": {
    "handoff_protocol": "Always include a structured handoff summary with: task_completed, key_findings, open_questions, suggested_next_steps. Data passes via file references, not inline content.",
    "conflict_resolution": "Orchestrator decides. Log disagreement in DECISIONS_LOG.md",
    "memory_update_trigger": "After every completed task",
    "output_validation": "All outputs must validate against agent's OUTPUT_SCHEMA.json"
  }
}
```

### 6.3 `.mcp.json` — Project-Level MCP Configuration

```json
{
  "mcpServers": {
    "web-search": {
      "type": "builtin",
      "enabled": true
    },
    "slack": {
      "type": "url",
      "url": "https://mcp.slack.com/sse",
      "note": "Requires Slack OAuth — run /setup-slack to configure"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./data", "./outputs"]
    }
  }
}
```

### 6.4 Agent Persona File (`agents/[name]/PERSONA.md`)

```markdown
# Agent: IRIS
## Role
Research & Analysis Specialist

## Identity
You are IRIS, a meticulous research analyst. You gather information,
identify patterns, and produce structured research outputs.

## Core Responsibilities
- Market research and competitive analysis
- Regulatory landscape monitoring
- Due diligence on companies, deals, and partners

## Behavioral Rules
- Always cite your sources with URLs or document references
- Distinguish between facts, estimates, and opinions explicitly
- Flag low-confidence findings with [LOW CONFIDENCE] tags
- Never fabricate data — say "not found" if you can't find it

## Output Format
All outputs must conform to your OUTPUT_SCHEMA.json.
Write outputs to your output directory: outputs/iris/

## Interaction Rules
- When receiving a task from FINN, expect financial context and questions
- When handing off to FINN, include all quantitative data you found
- When handing off to FELIX, include any technical requirements or specs
- All data passes via file references — write your output, then reference the path

## Memory Protocol
- Read your memory file at task start: memory/agents/iris/memory.md
- After each task, append a summary entry with:
  - Date, task description, key findings, lessons learned
- Read shared context: memory/shared/PROJECT_CONTEXT.md

## Tools Available
- Web search (for current information)
- File read/write (for data and outputs)
- No code execution (hand off to FELIX for that)
```

### 6.5 Output Schema (`agents/[name]/OUTPUT_SCHEMA.json`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "IRIS Research Output",
  "type": "object",
  "required": ["meta", "content"],
  "properties": {
    "meta": {
      "type": "object",
      "required": ["id", "agent", "timestamp", "task_id", "status"],
      "properties": {
        "id": { "type": "string", "description": "Unique output ID: iris-YYYYMMDD-HHMMSS" },
        "agent": { "type": "string", "const": "iris" },
        "timestamp": { "type": "string", "format": "date-time" },
        "task_id": { "type": "string", "description": "ID of the task that produced this" },
        "status": { "type": "string", "enum": ["draft", "final", "superseded"] },
        "version": { "type": "integer", "minimum": 1 },
        "tags": { "type": "array", "items": { "type": "string" } }
      }
    },
    "content": {
      "type": "object",
      "description": "Agent-specific content — schema varies per agent type"
    },
    "handoff": {
      "type": "object",
      "description": "Present if this output is being passed to another agent",
      "properties": {
        "target_agent": { "type": "string" },
        "source_file": { "type": "string", "description": "Path to the full output file" },
        "task_completed": { "type": "string" },
        "key_findings": { "type": "array", "items": { "type": "string" } },
        "open_questions": { "type": "array", "items": { "type": "string" } },
        "suggested_next_steps": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

### 6.6 Workflow Definition (`workflows/[name].json`)

```json
{
  "id": "morning-research-cycle",
  "name": "Morning Research Cycle",
  "description": "Daily research → analysis → report pipeline",
  "trigger": {
    "type": "scheduled",
    "cron": "0 7 * * 1-5",
    "can_trigger_manually": true
  },
  "steps": [
    {
      "step": 1,
      "agent": "iris",
      "task": "Review overnight market developments and news for tracked companies. Check data/incoming/ for new market data.",
      "input_from": "data/incoming/market-data/",
      "output_to": "outputs/iris/",
      "timeout_minutes": 10
    },
    {
      "step": 2,
      "agent": "finn",
      "task": "Read IRIS output at outputs/iris/latest.json. Analyze findings against current portfolio positions. Update financial models if new data warrants it.",
      "input_from": "outputs/iris/latest.json",
      "output_to": "outputs/finn/",
      "timeout_minutes": 10
    },
    {
      "step": 3,
      "agent": "orchestrator",
      "task": "Synthesize IRIS research (outputs/iris/latest.json) and FINN analysis (outputs/finn/latest.json) into a morning briefing.",
      "input_from": ["outputs/iris/latest.json", "outputs/finn/latest.json"],
      "output_to": "outputs/briefings/",
      "timeout_minutes": 5
    }
  ],
  "on_failure": "Log error, continue with available outputs, notify user on next interaction"
}
```

### 6.7 Memory Entry Format

```markdown
## memory/agents/iris/memory.md

# IRIS — Agent Memory

## Summary (auto-updated)
Last active: 2026-03-23. Total tasks completed: 47.
Key expertise developed: Nordic semiconductor sector, EU battery regulation,
Zambian energy policy landscape.

## Recent Entries

### 2026-03-23 — Morning Research Cycle
- **Task:** Review overnight Nordic market developments
- **Key findings:** Ericsson announced 5G infrastructure deal with Deutsche Telekom
- **Sources used:** Reuters, DI.se, company press releases
- **Lessons:** DI.se paywall blocks full article; use Reuters as primary for Swedish corporates
- **Confidence:** High on deal announcement, medium on market impact estimate

### 2026-03-22 — Ad-hoc: Competitor Analysis for FinCo
- **Task:** Deep dive on FinCo's product roadmap
- **Key findings:** [...]
- **Lessons:** LinkedIn job postings are a strong signal for product direction
```

### 6.8 Scheduler Task Definition (`scheduler/tasks.json`)

```json
{
  "tasks": [
    {
      "id": "fetch-market-data",
      "name": "Fetch Morning Market Data",
      "type": "data_fetch",
      "schedule": "0 6 * * 1-5",
      "enabled": true,
      "config": {
        "url": "https://api.example.com/v1/prices?symbols=ERIC-B.ST,VOLV-B.ST",
        "method": "GET",
        "headers": { "Authorization": "Bearer ${env.MARKET_API_KEY}" },
        "output_path": "data/incoming/market-data/",
        "filename_pattern": "prices-{date}.json"
      }
    },
    {
      "id": "morning-cycle",
      "name": "Trigger Morning Research Cycle",
      "type": "agent_workflow",
      "schedule": "15 6 * * 1-5",
      "enabled": true,
      "depends_on": "fetch-market-data",
      "config": {
        "workflow": "morning-research-cycle",
        "claude_command": "Run the morning research cycle workflow"
      }
    },
    {
      "id": "weekly-memory-prune",
      "name": "Summarize and Prune Agent Memories",
      "type": "agent_task",
      "schedule": "0 1 * * 0",
      "enabled": true,
      "config": {
        "task": "Review all agent memory files. Summarize entries older than 14 days into the Summary section. Remove the detailed entries. Update LESSONS_LEARNED.md if patterns emerge.",
        "agent": "orchestrator"
      }
    }
  ]
}
```

---

## 7. Agent Communication Architecture

### 7.1 Orchestrator-Mediated with File-Based Data Passing

All agent communication goes through the orchestrator (Claude Code main session). This is a Claude Code architectural constraint — subagents spawned via the Task tool cannot spawn their own subagents.

Data passes between agents via file references, not inline content. This keeps the orchestrator's context window lean and creates a natural audit trail.

### 7.2 Data Flow Pattern

```
User request
    ↓
Orchestrator (reads agents.json, decides routing)
    ↓
Spawns Agent A via Task tool
  → Injects: persona, memory, task prompt, input file paths
  ← Returns: completion status + summary (short)
  → Agent A writes full output to outputs/agent-a/YYYY-MM-DDTHH-MM.json
  → Agent A updates outputs/agent-a/latest.json
    ↓
Orchestrator reads Agent A's summary (from Task return, not the file)
Decides: does this need Agent B?
    ↓
Spawns Agent B via Task tool
  → Injects: persona, memory, task prompt
  → Task prompt says: "Read Agent A's output at outputs/agent-a/latest.json"
  ← Returns: completion status + summary
  → Agent B writes to outputs/agent-b/YYYY-MM-DDTHH-MM.json
    ↓
Orchestrator synthesizes, updates memory, presents result to user
```

### 7.3 Why File-Based Passing

- Keeps orchestrator context window lean (passes file paths, not file contents)
- Each agent reads only what it needs
- Outputs are automatically persisted and visible in the dashboard
- Natural audit trail — you can see exactly what each agent received and produced
- Scales to longer chains without context window pressure

### 7.4 The Orchestrator's Role in Each Handoff

1. Read the returning agent's summary (short — included in Task return)
2. Decide whether the output needs review, rework, or forwarding
3. Update the returning agent's memory
4. If forwarding: compose the next agent's task prompt with file path references
5. Log the handoff in `memory/shared/INTERACTION_HISTORY.md`

---

## 8. CLAUDE.md — Orchestrator Instructions

The root `CLAUDE.md` is the brain of the system. It tells Claude Code how to behave as the orchestrator. Here's the structural outline (the actual file will be much longer):

```markdown
# VibeOrg — Orchestrator Instructions

## Your Role
You are the orchestrator of an AI agent team. You do NOT do specialist
work directly. You delegate to subagents, review their outputs, manage
memory, and coordinate workflows.

## Slash Commands
- `/init` — Run the full onboarding flow. Read onboarding/ONBOARDING_FLOW.md
- `/add-agent` — Add a new agent through guided setup
- `/reconfigure` — Re-enter setup for specific sections
- `/run [workflow-name]` — Execute a named workflow
- `/status` — Show current state of all agents, recent outputs, memory health
- `/memory` — Show/search institutional memory
- `/dashboard` — Start or restart the Next.js dashboard
- `/setup-deploy` — Configure cloud deployment (generates deploy/ directory)

## Startup Protocol (every session)
1. Read vibeorg.config.json for project config
2. Read agents/agents.json for team roster
3. Read memory/shared/PROJECT_CONTEXT.md for current state
4. Check outputs/ for recent activity
5. Greet the user with a brief status summary

## Task Routing
When the user gives you a task:
1. Classify it against agent capabilities in agents.json
2. If it matches one agent, delegate directly
3. If it spans agents, create an ad-hoc workflow
4. If it's meta (about the team, config, or process), handle directly

## Delegation Protocol
When spawning a subagent via the Task tool:
1. Read the agent's PERSONA.md
2. Read the agent's memory.md
3. Read memory/shared/PROJECT_CONTEXT.md
4. Identify any input files the task requires
5. Compose task prompt:
   - Agent role & identity (from PERSONA.md)
   - Relevant memory context
   - Specific task instructions
   - File paths to read for input (NOT inline content)
   - Expected output format (from OUTPUT_SCHEMA.json)
   - Where to write output
6. Spawn the subagent
7. Read the subagent's return summary
8. Validate output file exists and conforms to schema
9. Update agent memory
10. Route output to next agent if part of a workflow (via file reference)
11. Update shared memory if significant

## Memory Management
[... detailed rules for when and how to read/write memory ...]

## Output Management
[... rules for naming, archiving, validating outputs ...]
```

---

## 9. Dashboard Technical Design

### 9.1 Architecture

The dashboard is a Next.js 14+ App Router project, custom-generated during onboarding to match the specific use case. It reads directly from the filesystem.

```
Request flow:
Browser → Next.js server → reads files from /outputs, /memory, /agents → renders
```

**The dashboard is primarily read-only.** It does NOT trigger agent actions, workflows, or data mutations. It MAY write to configuration files via a settings page (see Section 9.5).

### 9.2 Code Generation Strategy

Claude doesn't use a template engine. During onboarding Phase 7, it writes real Next.js code directly, the same way a developer would:

- Each generated page is a proper React Server Component reading from the filesystem
- Components use real Tailwind classes matching the chosen theme
- TypeScript types match the actual JSON schemas configured for agents
- The code is idiomatic, readable, and editable by the user or by Claude in future iterations

Every page and component that Claude generates includes domain-appropriate layouts. For an investment team, the portfolio overview has a holdings table, allocation chart, and P&L summary. For a teaching team, the lesson plans page has a calendar view and curriculum browser. This is bespoke code, not generic output rendering.

### 9.3 Standard Pages (always generated)

| Route | Purpose |
|-------|---------|
| `/` | Overview dashboard — domain-specific summary, recent activity, key metrics |
| `/status` | System health — agent activity, workflow status, data freshness, memory utilization |
| `/settings` | Configuration editor — theme, preferences, agent persona tweaks |

### 9.4 Domain-Specific Pages (generated per use case)

These vary entirely based on what the onboarding discovers. Examples:

**Investment Research Team:**
| `/portfolio` | Holdings overview with allocation chart and P&L |
| `/portfolio/[position]` | Individual position detail with research history |
| `/reports` | Chronological report browser with filters |
| `/reports/[id]` | Individual report with rendered Markdown/JSON |
| `/watchlist` | Tracked companies with latest data |

**Teaching Assistant Team:**
| `/lessons` | Lesson plan browser by subject and grade |
| `/lessons/[id]` | Individual lesson plan with resources |
| `/schedule` | Weekly calendar view |
| `/curriculum` | Curriculum map with progress tracking |

### 9.5 Dashboard Write Capabilities (Limited)

The dashboard may write to disk for configuration purposes only, implemented via Next.js Server Actions:

| What | File | Write Type |
|------|------|-----------|
| Theme/display preferences | `vibeorg.config.json` → `theme` key | Update JSON field |
| Dashboard layout preferences | `dashboard/user-prefs.json` | Full file write |
| Agent persona tweaks | `agents/[name]/PERSONA.md` | Append or replace section |
| Quick notes on outputs | `outputs/[agent]/[id].annotations.json` | Create/update sidecar file |

The dashboard must NEVER: trigger agent runs or workflows, write to `outputs/` (only agents produce outputs), write to `memory/` (only agents and orchestrator manage memory), delete any files, modify `agents.json` routing or capabilities, or execute shell commands.

When a persona file is edited via the dashboard, show a clear notice: *"Changes saved. This will take effect the next time [Agent Name] runs a task."*

### 9.6 Data Access Layer (`dashboard/lib/fs-reader.ts`)

All filesystem access is centralized in a single module:

```typescript
interface FSReader {
  getConfig(): VibeOrgConfig;
  getAgents(): Agent[];
  getAgent(id: string): Agent & { memory: string; recentOutputs: Output[] };
  getOutputs(options?: { agent?: string; limit?: number; after?: string }): Output[];
  getOutput(id: string): Output;
  getSharedMemory(): SharedMemory;
  getWorkflows(): Workflow[];
  getWorkflowHistory(id: string): WorkflowRun[];
  getSystemStatus(): SystemStatus;
}
```

### 9.7 Auto-Refresh Strategy

1. **Server-side revalidation**: Set `revalidate = 5` (seconds) on data-fetching functions so pages auto-refresh on navigation.
2. **Client-side polling**: On the overview page, poll `/api/outputs?since=<timestamp>` every 10 seconds to show a "New outputs available — click to refresh" banner.
3. **No live streaming**: This is intentionally not real-time. The user checks the dashboard after agents have run, like checking a report.

### 9.8 Status Page

The `/status` page is always generated and shows operational health:

```
┌────────────────────────────────────────────┐
│  System Health                    ● Online  │
├────────────────────────────────────────────┤
│                                            │
│  Agents              Last Active   Outputs │
│  ● IRIS (Research)   2 hours ago      147  │
│  ● FINN (Analysis)   2 hours ago       89  │
│  ● EDNA (Reports)    3 hours ago       62  │
│                                            │
│  Workflows           Last Run    Status    │
│  Morning Cycle       Today 07:15  ✓ Done   │
│  Weekly Summary      Mon 09:00    ✓ Done   │
│                                            │
│  Data Sources        Freshness   Status    │
│  Yahoo Finance       35 min ago   ✓ OK     │
│  News Feed           2 hours ago  ⚠ Stale  │
│                                            │
│  Memory Health                             │
│  Shared: 1,247 words (OK)                  │
│  IRIS: 2,891 words (approaching prune)     │
│  FINN: 1,456 words (OK)                    │
│                                            │
└────────────────────────────────────────────┘
```

All metrics are derived from filesystem reads — output file timestamps, file counts, word counts on memory files. No separate metrics database needed.

---

## 10. Onboarding Flow Design

### 10.1 `onboarding/ONBOARDING_FLOW.md`

This file is the script Claude follows when the user runs `/init`. It's written as instructions to Claude, not as user-facing content:

```markdown
# Onboarding Flow

## When triggered
The user runs `/init` or this is a fresh clone with no vibeorg.config.json.

## Your approach
- Be conversational, not interrogative
- Ask 1-2 questions at a time, not a wall of questions
- Provide smart defaults and examples based on what you learn
- After each phase, summarize what you understood and confirm

## Phase 1: Business Context
Ask the user to describe their project/business in 2-3 sentences.
Then ask what they want their AI team to accomplish.
From this, infer:
- Domain (finance, marketing, engineering, operations, research, etc.)
- Output types (reports, data analysis, content, code, communications)
- Cadence (real-time, daily, weekly, ad-hoc)
- Data sources (APIs, documents, manual input)

[... detailed instructions for each phase ...]
```

### 10.2 `onboarding/TEAM_DESIGN_GUIDE.md`

Heuristics Claude uses to propose agent teams:

```markdown
# Team Design Heuristics

## Common Agent Archetypes
- **Researcher**: Gathers and synthesizes information from external sources
- **Analyst**: Processes data, builds models, finds patterns
- **Writer**: Produces reports, communications, content
- **Engineer**: Writes code, builds tools, manages infrastructure
- **Monitor**: Watches for changes, triggers alerts, tracks KPIs
- **Coordinator**: Manages multi-step processes, quality checks

## Team Size Guidelines
- Start small: 2-4 agents for most projects
- Max recommended: 6-8 agents (complexity grows nonlinearly)
- Every agent must have a clear, distinct responsibility
- If two agents overlap >30%, merge them

## Domain-Specific Templates
### Finance / Investment
- IRIS (Researcher) → FINN (Analyst) → EDNA (Writer/Reporter)
### Content / Marketing
- SCOUT (Researcher) → SAGE (Strategist) → QUILL (Writer)
### Engineering / DevOps
- RECON (Monitor) → ARCH (Architect) → BOLT (Builder)

[... more templates and heuristics ...]
```

### 10.3 `onboarding/DASHBOARD_DESIGN_GUIDE.md`

Patterns for Claude to follow when generating domain-specific dashboard pages. Contains instructions on how to map output schemas to appropriate UI components, how to apply theme settings to generated code, and reference patterns for common page types (data tables, detail views, timeline browsers, chart dashboards).

---

## 11. MCP Configuration & API Key Management

### 11.1 MCP Setup During Onboarding

During Phase 5 (MCP & Integrations), Claude asks what external services agents need and configures `.mcp.json` accordingly. Claude explains each MCP server it's configuring and walks the user through any auth steps.

### 11.2 API Key Management

```bash
# .env (gitignored, never committed)
ANTHROPIC_API_KEY=sk-ant-...       # For scheduler's headless Claude Code invocations
MARKET_API_KEY=...                  # Example: data source API key
SLACK_BOT_TOKEN=xoxb-...           # If Slack integration configured
```

The onboarding:
1. Creates `.env.example` with all required keys listed (no values)
2. Creates `.env` from the example
3. Asks the user to paste in each required key
4. Verifies connectivity where possible (test API calls)
5. Ensures `.env` is in `.gitignore`
6. Records which integrations are configured in `memory/shared/PROJECT_CONTEXT.md`

---

## 12. Scheduler System

### 12.1 Architecture

The scheduler is a lightweight Node.js process using `node-cron`. It runs as a separate process alongside the Next.js dev server.

```javascript
// scheduler/scheduler.js (conceptual)
const cron = require('node-cron');
const tasks = require('./tasks.json');
const { exec } = require('child_process');

for (const task of tasks.tasks) {
  if (!task.enabled) continue;

  cron.schedule(task.schedule, async () => {
    log(`Running task: ${task.name}`);

    switch (task.type) {
      case 'data_fetch':
        await fetchData(task.config);
        break;

      case 'agent_workflow':
        exec(`echo "${task.config.claude_command}" | claude --print`,
          (err, stdout) => { log(stdout); });
        break;

      case 'agent_task':
        exec(`echo "${task.config.task}" | claude --print`,
          (err, stdout) => { log(stdout); });
        break;
    }
  });
}
```

### 12.2 Task Types

| Type | Description | Mechanism |
|------|-------------|-----------|
| `data_fetch` | HTTP request to save data | Direct `fetch()` call, saves response to file |
| `agent_workflow` | Trigger a named workflow | Pipes command to Claude Code CLI |
| `agent_task` | Single agent task | Pipes task prompt to Claude Code CLI |
| `shell_command` | Run arbitrary shell command | `child_process.exec()` |

### 12.3 Limitations & Caveats

- Claude Code must be installed and authenticated on the machine
- Scheduler tasks that invoke Claude Code require an active API session
- The `claude --print` flag runs headlessly — output is logged but not interactive
- Long-running tasks should have timeouts
- The scheduler logs everything to `scheduler/logs/` for debugging

---

## 13. Memory System Design

### 13.1 Two-Tier Memory

**Shared Memory** (`memory/shared/`) — Institutional knowledge accessible to all agents:
- `PROJECT_CONTEXT.md` — What the project is, current objectives, key stakeholders
- `DECISIONS_LOG.md` — Append-only log of significant decisions with rationale
- `GLOSSARY.md` — Domain terms, abbreviations, conventions
- `LESSONS_LEARNED.md` — Patterns that emerged, mistakes to avoid, best practices

**Agent Memory** (`memory/agents/[name]/memory.md`) — Personal to each agent:
- Summary section at top (auto-maintained)
- Chronological entries below
- Each entry has: date, task, key findings, lessons, confidence notes

### 13.2 Memory Protocol (`memory/MEMORY_PROTOCOL.md`)

```markdown
# Memory Protocol

## Reading Memory
At the start of every task, read:
1. Your own memory file (always)
2. memory/shared/PROJECT_CONTEXT.md (always)
3. memory/shared/GLOSSARY.md (if domain-specific terms appear)
4. memory/shared/DECISIONS_LOG.md (if making a decision)
5. Other agents' memory (only if explicitly collaborating)

## Writing Memory
After completing any task:
1. Append an entry to your memory file with:
   - ISO timestamp
   - Task description (1 line)
   - Key findings or outcomes (bullet points)
   - Lessons learned (what to do differently next time)
   - Confidence assessment
2. If you made a significant decision, append to DECISIONS_LOG.md
3. If you learned a new domain term, append to GLOSSARY.md

## Memory Hygiene
- The orchestrator runs weekly memory pruning
- Entries older than 14 days get summarized into the Summary section
- The Summary should never exceed 500 words per agent
- Keep individual entries concise — 5-10 lines max

## Memory Size Limits
- Agent memory files: aim for under 3000 words total
- If a memory file exceeds 5000 words, the orchestrator will prune it
- Shared memory files: no hard limit but keep each file under 2000 words
```

### 13.3 Context Window Budget

Since subagents are spawned fresh each time, every piece of context must be injected:

| Component | Approximate Tokens |
|-----------|-------------------|
| Agent PERSONA.md | 500-800 |
| Agent memory.md | 500-1500 |
| Shared PROJECT_CONTEXT.md | 300-500 |
| Task instructions + file path refs | 200-500 |
| Output schema | 200-400 |
| **Total injected** | **1700-3700** |

The agent then reads input files from disk as needed, keeping the injected context minimal. Memory pruning ensures memory files don't grow unboundedly.

---

## 14. Cloud Deployment

### 14.1 Overview

VibeOrg is designed local-first but can be deployed to a cloud VPS for always-on operation and remote access. During onboarding Phase 6, Claude asks about deployment preference and generates configs accordingly. Running `/setup-deploy` after initial setup also works.

### 14.2 Deployment Topology

```
┌─────────────────────────────────────────────┐
│  Cloud VPS (Hetzner/DigitalOcean/Railway)   │
│                                             │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │  Next.js        │  │  Scheduler       │  │
│  │  Dashboard      │  │  (node-cron)     │  │
│  │  :3000          │  │                  │  │
│  └────────┬────────┘  └────────┬─────────┘  │
│           │                    │             │
│           ▼                    ▼             │
│  ┌─────────────────────────────────────┐    │
│  │  Filesystem (outputs, memory, data) │    │
│  └─────────────────────────────────────┘    │
│           ▲                                 │
│           │                                 │
│  ┌────────┴────────┐                        │
│  │  Claude Code    │ ← headless, scheduler  │
│  │  (CLI)          │ ← interactive, via SSH  │
│  └─────────────────┘                        │
│                                             │
└──────────────────────┬──────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     SSH + Claude   Browser     VS Code
     Code CLI       (dashboard)  Remote SSH
     (phone/laptop) (any device) (full IDE)
```

### 14.3 How to Access Your Deployed VibeOrg

**To give instructions to your agents (from any device):**
- SSH into the server and run Claude Code in the project directory
- Or use VS Code Remote SSH for a full IDE experience
- The scheduler handles automated tasks without you being connected

**To view the dashboard:**
- Open the dashboard URL in any browser
- Protected by your chosen auth method (see below)

**To edit files directly:**
- VS Code Remote SSH gives you full file editing on the server
- Changes are picked up by the dashboard automatically

### 14.4 Authentication Options for Public Dashboard

| Option | Complexity | Best For |
|--------|-----------|----------|
| **Tailscale** | Low | Maximum security. Dashboard stays on private VPN. Install Tailscale on server + your devices. Access via `http://vibeorg:3000` on your Tailscale network. No public exposure. |
| **Cloudflare Tunnel + Access** | Low-Medium | Sharing with others. Dashboard gets a public URL but Cloudflare handles auth (GitHub login, one-time-pin, etc.). Free tier covers this. |
| **NextAuth + GitHub OAuth** | Medium | Good if not using Cloudflare. Login with your GitHub account. |
| **HTTP Basic Auth (nginx)** | Very Low | Quick and dirty. Single username/password. Fine for personal use. |

**Recommendation:** Tailscale if it's just you, Cloudflare Tunnel if you want to share the URL.

### 14.5 Deployment Files

```
deploy/
├── Dockerfile                  # Multi-stage: dashboard + scheduler
├── docker-compose.yml          # Dashboard + scheduler services
├── nginx.conf                  # Optional reverse proxy with basic auth
├── DEPLOY.md                   # Step-by-step deployment guide
└── scripts/
    ├── setup-server.sh         # Install dependencies on a fresh VPS
    ├── setup-cloudflare.sh     # Configure Cloudflare Tunnel
    └── setup-tailscale.sh      # Configure Tailscale
```

### 14.6 `deploy/DEPLOY.md` — Step-by-Step Guide

This file must be extremely clear and walk the user through every step. Outline:

```markdown
# Deploying VibeOrg to a Cloud Server

## What You'll End Up With
- Your dashboard running 24/7 at a URL you can access from any device
- Your scheduler running automated tasks (data fetches, agent workflows)
- Claude Code accessible via SSH for giving instructions to your agents

## Prerequisites
- A VPS (Hetzner, DigitalOcean, etc.) — 2GB RAM is sufficient
- A domain name (optional, but recommended)
- SSH access to the server

## Step 1: Set Up the Server
[exact commands to run on a fresh Ubuntu VPS]

## Step 2: Clone Your Project
[git clone, environment setup]

## Step 3: Install Claude Code on the Server
[exact installation steps, authentication]

## Step 4: Start the Services
[docker-compose up, or systemd setup]

## Step 5: Set Up Authentication
### Option A: Tailscale (recommended for personal use)
[step-by-step with screenshots]
### Option B: Cloudflare Tunnel (recommended for sharing)
[step-by-step]

## Step 6: Verify Everything Works
[checklist of things to test]

## Troubleshooting
[common issues and fixes]
```

---

## 15. Optional SQLite Layer

### 15.1 When to Enable

SQLite is **not** the default. It's enabled when the onboarding flow detects:
- High-volume time-series data (daily price data, metrics, logs)
- Need for structured queries across outputs (find all outputs where X > Y)
- Relational data that's awkward in flat files (many-to-many relationships)

### 15.2 Schema

If enabled, SQLite mirrors the file system rather than replacing it:

```sql
CREATE TABLE outputs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL,
  tags TEXT,
  content_path TEXT NOT NULL,
  summary TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE memory_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT,
  timestamp TEXT NOT NULL,
  task_description TEXT,
  key_findings TEXT,
  lessons TEXT,
  source_file TEXT NOT NULL
);

CREATE TABLE workflow_runs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,
  steps_completed INTEGER,
  error_message TEXT
);

CREATE TABLE data_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  data TEXT NOT NULL
);
```

### 15.3 Sync Strategy

Files remain the source of truth. SQLite is a read-optimized index:
- When agents write output files, a post-write hook indexes them in SQLite
- The dashboard queries SQLite for filtering/sorting, then reads the actual file for display
- If SQLite gets corrupted, it can be rebuilt from files with `scripts/rebuild-db.js`

---

## 16. Plugin System Architecture (v0.2 Roadmap)

Not in v0.1 scope, but the v0.1 architecture should make plugins natural to add later.

### 16.1 Plugin Types

**Agent Templates** — Pre-built agent configurations:
```
@vibeorg/agent-equity-researcher/
├── PERSONA.md              # Battle-tested researcher persona
├── OUTPUT_SCHEMA.json      # Well-structured research output format
├── EXAMPLES.md             # Few-shot examples of good outputs
├── TOOLS.md                # Required MCP servers and capabilities
└── README.md               # What this agent does, how to customize
```

**Data Source Connectors** — Pre-built fetch configurations:
```
@vibeorg/source-yahoo-finance/
├── fetcher.js              # Data fetch logic with error handling
├── schema.json             # Output data schema
├── scheduler-task.json     # Pre-configured cron task
└── README.md               # Setup instructions, required API keys
```

**Dashboard View Packages** — Pre-built page components:
```
@vibeorg/view-portfolio-tracker/
├── PortfolioOverview.tsx    # Main portfolio page
├── PositionDetail.tsx       # Individual position page
├── types.ts                 # TypeScript interfaces
├── README.md                # Required data format, customization options
└── preview.png              # Screenshot
```

### 16.2 Installation Flow (future)

```
User: "I want to add a stock portfolio tracker to my dashboard"
Claude: "There's a community plugin @vibeorg/view-portfolio-tracker. 
         Want me to install it and adapt it to your theme and data?"
User: "Yes"
Claude: installs, adapts to theme, wires up data readers, adds routes
```

### 16.3 v0.1 Preparation

To make plugins easy to add later, v0.1 should:
1. Keep agent definitions fully self-contained in their directory
2. Keep dashboard page components self-contained (no cross-page dependencies)
3. Use a consistent interface for data readers (so plugins can provide their own)
4. Store all theme tokens in CSS variables (so plugins inherit the theme automatically)
5. Document the expected directory structure in `PLUGIN_SPEC.md`

---

## 17. Implementation Plan

### Phase 1 — Foundation (build first)

| Task | Description | Est. Hours |
|------|-------------|-----------|
| 1.1 | Project scaffolding — directory structure, package.json, gitignore | 1 |
| 1.2 | `vibeorg.config.json` schema and reader | 0.5 |
| 1.3 | `agents.json` schema and agent registry system | 1 |
| 1.4 | Agent persona template and output schema template | 1 |
| 1.5 | Memory system — protocol file, shared memory templates, agent memory templates | 1 |
| 1.6 | CLAUDE.md orchestrator instructions (full version) | 2 |
| 1.7 | `.mcp.json` template and MCP configuration guide | 0.5 |
| 1.8 | `.env.example` and environment variable management | 0.5 |

### Phase 2 — Onboarding Flow

| Task | Description | Est. Hours |
|------|-------------|-----------|
| 2.1 | ONBOARDING_FLOW.md — complete guided setup script (all 8 phases) | 4 |
| 2.2 | TEAM_DESIGN_GUIDE.md — archetypes, heuristics, domain templates | 2 |
| 2.3 | OUTPUT_DESIGN_GUIDE.md — patterns for different output types | 1.5 |
| 2.4 | DASHBOARD_DESIGN_GUIDE.md — patterns for generating domain-specific pages | 2 |
| 2.5 | Slash command handlers in CLAUDE.md (`/init`, `/add-agent`, `/status`, etc.) | 1 |

### Phase 3 — Dashboard Code Generation System

| Task | Description | Est. Hours |
|------|-------------|-----------|
| 3.1 | Next.js base project with App Router, Tailwind, TypeScript | 1 |
| 3.2 | Theme engine — CSS variables, Tailwind config generation from theme settings | 2 |
| 3.3 | `fs-reader.ts` — generic data access layer, typed JSON/MD reading | 2 |
| 3.4 | Layout shell — sidebar, header, breadcrumbs (generated based on sitemap) | 1.5 |
| 3.5 | Common components — JsonViewer, MarkdownRenderer, DataTable, StatusBadge, ChartWrapper | 3 |
| 3.6 | Status page (always generated, shows system health) | 1.5 |
| 3.7 | Settings page with limited write capabilities | 1.5 |
| 3.8 | Code generation patterns in DASHBOARD_DESIGN_GUIDE.md — instructions for Claude to follow when generating domain-specific pages | 3 |
| 3.9 | 3 example generated dashboards (finance, education, content marketing) to validate the generation approach | 4 |
| 3.10 | Seed data generation script | 1.5 |
| 3.11 | Auto-refresh / polling mechanism | 1 |

### Phase 4 — Scheduler & Workflows

| Task | Description | Est. Hours |
|------|-------------|-----------|
| 4.1 | Scheduler runtime (`scheduler.js` with node-cron) | 1.5 |
| 4.2 | Task type handlers (data_fetch, agent_workflow, agent_task, shell_command) | 2 |
| 4.3 | Workflow engine in CLAUDE.md (multi-step execution with file-based passing) | 2 |
| 4.4 | Logging system for scheduler | 1 |

### Phase 5 — Deployment

| Task | Description | Est. Hours |
|------|-------------|-----------|
| 5.1 | Dockerfile (multi-stage for dashboard + scheduler) | 1.5 |
| 5.2 | docker-compose.yml | 1 |
| 5.3 | DEPLOY.md — extremely detailed step-by-step deployment guide | 3 |
| 5.4 | Setup scripts (server, Cloudflare, Tailscale) | 1.5 |
| 5.5 | Onboarding integration (local vs remote question, config generation) | 0.5 |

### Phase 6 — Polish & Documentation

| Task | Description | Est. Hours |
|------|-------------|-----------|
| 6.1 | README.md with quickstart, architecture diagram, examples | 2.5 |
| 6.2 | CONTRIBUTING.md | 0.5 |
| 6.3 | PLUGIN_SPEC.md (architecture documentation for future plugins) | 1 |
| 6.4 | Schema validation script | 1 |
| 6.5 | Example project (investment research team) fully configured and seeded | 2.5 |
| 6.6 | GitHub Actions CI (lint, validate schemas) | 1 |

**Total estimated effort: ~60-65 hours**

---

## 18. Technical Constraints & Dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| Claude Code | Latest | Agent orchestration + subagent spawning |
| Next.js | 14+ | Dashboard |
| React | 18+ | UI components |
| Tailwind CSS | 3+ | Styling |
| TypeScript | 5+ | Type safety |
| node-cron | 3+ | Scheduler |
| better-sqlite3 | Latest | Optional SQLite (if enabled) |
| gray-matter | Latest | Parse frontmatter in markdown files |
| react-markdown | Latest | Render markdown in dashboard |
| react-json-view | Latest | Pretty JSON display |
| Docker | Latest | Cloud deployment (optional) |

### System Requirements
- Claude Code installed and authenticated
- Node.js 18+
- Git
- ~100MB disk for a fresh project (grows with outputs)
- Docker (only for cloud deployment)

---

## 19. Future Roadmap (beyond v0.1)

| Feature | Description | Priority |
|---------|-------------|----------|
| Plugin system | Shareable agent templates, data connectors, dashboard views (see Section 16) | High |
| Multi-user support | Auth and role-based dashboard access for teams | Medium |
| LLM cost tracking | Cross-reference workflow timestamps with Anthropic API usage dashboard | Medium |
| Export & interop | Push outputs to Google Docs, Notion, Slack, email | Low |
| Agent-to-agent pub/sub | File-based message bus for more autonomous agent collaboration | Low |

---

## 20. Success Criteria

VibeOrg v0.1 is successful if:

1. A user can go from `git clone` to a working agent team with a custom dashboard in under 15 minutes
2. The onboarding flow produces a sensible team structure for at least 5 different business domains
3. The generated dashboard looks and feels tailored to the specific use case — not generic
4. Agents produce valid, schema-conforming outputs that render correctly in the dashboard
5. File-based agent handoffs work reliably through the orchestrator
6. Memory accumulates meaningfully over 10+ agent interactions
7. A scheduled workflow runs unattended and produces outputs
8. Cloud deployment works following the DEPLOY.md guide without needing to ask for help
9. The entire system is understandable by reading the files — no hidden state, no magic

---

*End of specification.*
