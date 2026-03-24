# VibeOrg

**Open-source scaffolding framework for AI agent teams in Claude Code.**

VibeOrg is to AI agent teams what `create-next-app` is to web projects — clone, run one command, answer some questions, and you have a fully working system: a team of specialized AI agents, a persistent memory layer, structured outputs, automated workflows, and a custom-built Next.js dashboard tailored to your exact domain.

> **The mental model:** You are the manager. Claude is the orchestrator (your COO). The subagents are your team. You don't do the work — you hire the right people, define roles, set strategy, delegate, review, and adjust. The dashboard is your company's internal reporting system.

---

## Table of Contents

- [Quick Start](#quick-start)
- [The Big Picture](#the-big-picture)
- [How It Works](#how-it-works)
- [The Onboarding Flow](#the-onboarding-flow)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
  - [Agents](#agents)
  - [Memory System](#memory-system)
  - [Outputs](#outputs)
  - [Workflows](#workflows)
  - [Dashboard](#dashboard)
  - [Scheduler](#scheduler)
- [Commands Reference](#commands-reference)
- [Manage from Your Phone](#manage-from-your-phone)
- [Daily Usage](#daily-usage)
- [Configuration](#configuration)
- [Cloud Deployment](#cloud-deployment)
- [Extensibility & Plugin Architecture](#extensibility--plugin-architecture)
- [Technical Stack](#technical-stack)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

### Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Claude Code** — installed and authenticated (`npm install -g @anthropic-ai/claude-code`)
- **Git**

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-org/vibeorg.git my-project
cd my-project

# 2. Start Claude Code
claude

# 3. Run the onboarding flow
/init
```

That's it. The `/init` command walks you through a guided conversational setup. Answer some questions about your business, review the proposed agent team, pick a dashboard theme, and Claude builds everything — custom agents, output schemas, a tailored dashboard, and seed data. In under 15 minutes you'll have a working system at `http://localhost:3000`.

---

## The Big Picture

Most AI coding tools help you write code. VibeOrg helps you build **an organization** — a team of AI agents that work together, remember what they've learned, produce structured outputs, and present their work in a dashboard built specifically for your domain.

**What VibeOrg gives you:**

| Layer | What It Does |
|-------|-------------|
| **Agent Team** | 2-6 specialized AI agents with distinct roles, personas, and expertise |
| **Memory System** | Persistent institutional knowledge — agents learn and remember across sessions |
| **Structured Outputs** | Schema-validated JSON outputs organized by agent, timestamped and archived |
| **Orchestrator** | Claude Code as the intelligent coordinator — routes tasks, manages handoffs, validates quality |
| **Custom Dashboard** | A Next.js web app generated specifically for your domain — not a generic UI with data plugged in |
| **Scheduler** | Automated tasks — fetch data, run workflows, maintain memory — on cron schedules |
| **Deployment** | Docker configs and guides for running 24/7 on a cloud VPS |

**What VibeOrg is NOT:**

- Not a generic chatbot UI
- Not an abstraction layer over multiple AI providers (Claude Code only)
- Not a no-code platform — you should be comfortable with git, the terminal, and `npm install`
- Not a template with different data plugged in — the dashboard is custom-generated code

---

## How It Works

```
┌─────────────────────────────────────────────────────┐
│                     YOU (the manager)                │
│         Set strategy, review outputs, adjust         │
└──────────────────────┬──────────────────────────────┘
                       │ give instructions via Claude Code
                       ▼
┌─────────────────────────────────────────────────────┐
│              CLAUDE (the orchestrator)               │
│    Routes tasks, manages memory, validates output    │
│         Defined by: CLAUDE.md + agents.json          │
└───────┬──────────────┬──────────────┬───────────────┘
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ Agent A  │   │ Agent B  │   │ Agent C  │
   │Researcher│   │ Analyst  │   │  Writer  │
   └────┬─────┘   └────┬─────┘   └────┬─────┘
        │              │              │
        ▼              ▼              ▼
   outputs/a/     outputs/b/     outputs/c/
   (JSON files)   (JSON files)   (JSON files)
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│               DASHBOARD (Next.js)                    │
│     Reads outputs from filesystem, renders UI        │
│     Domain-specific pages tailored to your use case  │
└─────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

1. **Files are the database.** Agents read and write JSON and Markdown files. The filesystem is the source of truth. Everything is human-readable and git-trackable.

2. **The UI is a window, not a cockpit.** The dashboard is primarily read-only. You interact with your agents through Claude Code, not through the dashboard. The dashboard shows you what your agents have done.

3. **Data passes via file references.** When Agent A hands off to Agent B, the orchestrator passes the file path to Agent A's output — not the contents. This keeps the context window lean and creates a natural audit trail.

4. **Everything is git-native.** Your agent team's history is your commit history. Memory, outputs, configurations — all version-controlled.

---

## The Onboarding Flow

When you run `/init`, Claude walks you through 8 phases:

### Phase 1 — Business Context (2-3 min)
Claude asks what your business does, what you want your agent team to accomplish, what outputs you need, and at what cadence. From this, it infers your domain and requirements.

### Phase 2 — Team Design (3-5 min)
Based on your answers, Claude proposes an agent team from a library of archetypes (Researcher, Analyst, Writer, Engineer, Monitor, Coordinator). You review, adjust, add, or remove agents. Claude explains who talks to whom and why.

### Phase 3 — Output Design (2-3 min)
For each agent, Claude proposes output schemas — structured JSON with domain-relevant fields. You approve or customize the formats.

### Phase 4 — Dashboard Design & Theming (2-3 min)
Claude proposes dashboard pages based on your outputs (a finance team gets portfolio views; a teaching team gets lesson plan browsers). Then picks a visual theme matching your domain. You choose or customize.

### Phase 5 — MCP & Integrations (1-2 min)
Claude asks about external services (web search, Slack, APIs) and configures MCP servers and environment variables. Tests connectivity where possible.

### Phase 6 — Deployment Mode (1 min)
Local or remote? If remote, Claude configures deployment files.

### Phase 7 — Build (automated, 5-10 min)
Claude does the heavy lifting:
- Scaffolds all agent directories, personas, schemas, memory files
- Generates the custom Next.js dashboard with domain-specific pages
- Seeds realistic test data
- Installs dependencies and starts the dev server
- Hands you `http://localhost:3000` with a fully populated dashboard

### Phase 8 — Iterate
Claude explains how to modify anything — through conversation or direct file editing. Shows you `/add-agent`, `/reconfigure`, and other commands.

---

## Project Structure

```
vibeorg-project/
│
├── CLAUDE.md                          # Master orchestrator instructions (the brain)
├── vibeorg.config.json                # Project configuration (theme, settings, data sources)
├── .mcp.json                          # MCP server configuration (generated during onboarding)
├── .env.example                       # Required environment variables (committed)
├── .env                               # Actual secrets (gitignored)
│
├── onboarding/                        # Onboarding flow definitions
│   ├── ONBOARDING_FLOW.md             # Master onboarding script for Claude
│   ├── TEAM_DESIGN_GUIDE.md           # Agent archetypes & domain templates
│   ├── OUTPUT_DESIGN_GUIDE.md         # Output schema patterns
│   ├── DASHBOARD_DESIGN_GUIDE.md      # Dashboard generation patterns
│   ├── build-manifest.json            # Record of what was generated and why
│   └── templates/                     # Reference templates Claude adapts
│       ├── agent-persona.md.tmpl
│       ├── agent-memory.md.tmpl
│       └── output-schema.json.tmpl
│
├── agents/                            # Agent definitions
│   ├── agents.json                    # Agent registry (roles, routing, capabilities)
│   ├── orchestrator/
│   │   └── ORCHESTRATOR.md            # Detailed orchestrator behavior rules
│   └── [agent-name]/                  # One directory per agent
│       ├── PERSONA.md                 # System prompt / role definition
│       ├── OUTPUT_SCHEMA.json         # JSON Schema for outputs
│       ├── EXAMPLES.md                # Few-shot examples of good outputs
│       └── TOOLS.md                   # Tools/capabilities this agent can use
│
├── memory/                            # Persistent memory
│   ├── MEMORY_PROTOCOL.md             # Rules for reading/writing memory
│   ├── shared/                        # Institutional memory (all agents)
│   │   ├── PROJECT_CONTEXT.md         # What this project is, current state
│   │   ├── DECISIONS_LOG.md           # Key decisions with rationale
│   │   ├── GLOSSARY.md                # Domain terminology
│   │   └── LESSONS_LEARNED.md         # Patterns and insights
│   └── agents/                        # Per-agent memory
│       └── [agent-name]/
│           └── memory.md
│
├── outputs/                           # All agent outputs
│   └── [agent-name]/
│       ├── latest.json                # Most recent output
│       ├── index.json                 # Manifest of all outputs
│       ├── 2026-03-23T08-00.json      # Timestamped outputs
│       └── archive/                   # Older outputs
│
├── data/                              # External data & feeds
│   ├── incoming/                      # Raw data from APIs
│   ├── processed/                     # Cleaned/transformed data
│   └── sources.json                   # Data source registry
│
├── workflows/                         # Multi-step workflow definitions
│   └── [workflow-name].json
│
├── dashboard/                         # Next.js web UI (custom-generated)
│   ├── app/                           # App Router pages
│   │   ├── layout.tsx                 # Root layout with sidebar
│   │   ├── page.tsx                   # Overview dashboard
│   │   ├── status/page.tsx            # System health
│   │   ├── settings/page.tsx          # Configuration editor
│   │   ├── [domain-pages]/            # Generated per use case
│   │   └── api/                       # Internal API routes
│   ├── components/
│   │   ├── layout/                    # Sidebar, Header, Breadcrumbs
│   │   ├── common/                    # JsonViewer, DataTable, Charts, etc.
│   │   └── [domain-specific]/         # Generated per use case
│   └── lib/
│       ├── fs-reader.ts               # Centralized filesystem data access
│       ├── types.ts                   # TypeScript interfaces
│       └── config.ts                  # Config reader
│
├── scheduler/                         # Automated task scheduler
│   ├── scheduler.js                   # node-cron runner
│   ├── tasks.json                     # Task definitions
│   └── logs/
│
├── deploy/                            # Cloud deployment
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── DEPLOY.md                      # Step-by-step deployment guide
│   └── scripts/                       # Server setup scripts
│
├── scripts/                           # Utilities
│   ├── validate-schemas.js            # Validate all outputs against schemas
│   ├── seed-test-data.js              # Generate sample data
│   └── export.js                      # Export outputs to CSV/JSON
│
├── db/                                # Optional SQLite (if configured)
│   └── migrations/
│
└── PLUGIN_SPEC.md                     # Plugin architecture documentation
```

---

## Core Concepts

### Agents

Each agent is a specialized AI team member with a distinct role. An agent is defined by four files in its directory:

| File | Purpose |
|------|---------|
| `PERSONA.md` | Identity, role, responsibilities, behavioral rules, interaction protocols |
| `OUTPUT_SCHEMA.json` | JSON Schema defining the structure of this agent's outputs |
| `EXAMPLES.md` | 3-5 few-shot examples of good outputs (guides quality) |
| `TOOLS.md` | Which tools/capabilities this agent can use |

**Agent archetypes** (from `onboarding/TEAM_DESIGN_GUIDE.md`):

| Archetype | Role | Example Names |
|-----------|------|---------------|
| **Researcher** | Gathers and synthesizes information from external sources | IRIS, SCOUT, ATLAS, LEXIS |
| **Analyst** | Processes data, builds models, finds patterns | FINN, METRIC, NEXUS, VALOR |
| **Writer** | Produces reports, communications, content | EDNA, QUILL, REED, BRIEF |
| **Engineer** | Writes code, builds tools, manages infrastructure | BOLT, FELIX |
| **Monitor** | Watches for changes, tracks KPIs, triggers alerts | VIGIL, RECON, PULSE |
| **Coordinator** | Manages processes, quality checks | (Usually the orchestrator) |

**Domain templates** are provided for: Finance, Content Marketing, Engineering/DevOps, Education, Operations, Legal, Healthcare, Real Estate, Consulting, and E-commerce.

Agents are registered in `agents/agents.json` which tracks each agent's ID, role, capabilities, output directory, and routing (who they receive from and hand off to).

### Memory System

VibeOrg has a two-tier memory system:

**Shared Memory** (`memory/shared/`) — Institutional knowledge accessible to all agents:
- `PROJECT_CONTEXT.md` — What the project is, current objectives, key stakeholders
- `DECISIONS_LOG.md` — Append-only log of decisions with rationale
- `GLOSSARY.md` — Domain-specific terminology
- `LESSONS_LEARNED.md` — Patterns, mistakes, and insights

**Agent Memory** (`memory/agents/[name]/memory.md`) — Personal to each agent:
- Summary section at the top (auto-maintained, max 500 words)
- Chronological entries below with: date, task, findings, lessons, confidence

**Memory hygiene** is automated:
- Entries older than 14 days are summarized and pruned
- Agent memory files target under 3,000 words (hard limit: 5,000)
- The orchestrator manages pruning via scheduled tasks or manual `/memory` commands

The full protocol is documented in `memory/MEMORY_PROTOCOL.md`.

### Outputs

Every agent produces structured JSON outputs following a universal envelope:

```json
{
  "meta": {
    "id": "iris-20260323-080000",
    "agent": "iris",
    "timestamp": "2026-03-23T08:00:00Z",
    "task_id": "morning-research",
    "status": "final",
    "version": 1,
    "tags": ["morning-cycle", "market-research"]
  },
  "content": {
    // Agent-specific content — varies by role and domain
  },
  "handoff": {
    // Present only when passing output to another agent
    "target_agent": "finn",
    "task_completed": "Reviewed overnight market developments",
    "key_findings": ["..."],
    "open_questions": ["..."],
    "suggested_next_steps": ["..."]
  }
}
```

Outputs are stored at `outputs/[agent-id]/` with timestamped filenames. Each agent also maintains a `latest.json` (most recent) and `index.json` (manifest of all outputs).

Output patterns are documented in `onboarding/OUTPUT_DESIGN_GUIDE.md` with templates for research, analysis, reports, monitoring alerts, and data processing outputs.

### Workflows

Workflows define multi-step agent pipelines. A workflow specifies which agents run in what order, what data flows between them, and what happens on failure.

```json
{
  "id": "morning-research-cycle",
  "name": "Morning Research Cycle",
  "trigger": { "type": "scheduled", "cron": "0 7 * * 1-5" },
  "steps": [
    { "step": 1, "agent": "iris", "task": "Review overnight developments..." },
    { "step": 2, "agent": "finn", "task": "Analyze IRIS output..." },
    { "step": 3, "agent": "orchestrator", "task": "Synthesize into briefing..." }
  ],
  "on_failure": "Log error, continue with available outputs, notify user"
}
```

Run a workflow manually with `/run morning-research-cycle` or let the scheduler trigger it automatically.

### Dashboard

The dashboard is a **Next.js 14+ App Router** application that reads directly from the filesystem. It's not a generic template — during onboarding, Claude generates domain-specific pages, components, and types tailored to your exact use case.

**Standard pages** (always present):
| Route | Purpose |
|-------|---------|
| `/` | Overview — key metrics, recent activity, agent status |
| `/status` | System health — agent activity, workflow runs, memory utilization, data freshness |
| `/settings` | Configuration viewer — theme, agents, system settings |

**Domain-specific pages** (generated during onboarding):

| Use Case | Example Pages |
|----------|--------------|
| Investment Research | `/portfolio`, `/portfolio/[position]`, `/reports`, `/watchlist` |
| Teaching Assistant | `/lessons`, `/lessons/[id]`, `/schedule`, `/curriculum` |
| Content Marketing | `/calendar`, `/pipeline`, `/published`, `/analytics` |

**Theming** — The dashboard uses CSS variables for all colors, fonts, and spacing. The theme is configured in `vibeorg.config.json` and applied automatically. Five theme directions are available:

| Direction | Style |
|-----------|-------|
| Professional Finance | Muted slate/navy, dense data, monospace numbers |
| Warm Playful | Rounded corners, friendly colors, spacious layouts |
| Minimal Technical | Dark mode, terminal-inspired, high density |
| Calm Trustworthy | Soft blues/greens, generous whitespace |
| Modern Neutral | Clean dark/light toggle, subtle accents (default) |

**Auto-refresh** — Pages revalidate every 5 seconds server-side. The overview page polls for new outputs and shows a "New outputs available" banner.

### Scheduler

The scheduler is a lightweight Node.js process using `node-cron` that runs automated tasks:

| Task Type | Description | Mechanism |
|-----------|-------------|-----------|
| `data_fetch` | HTTP requests to save data to files | Direct `fetch()` call |
| `agent_workflow` | Trigger a named multi-agent workflow | Pipes command to `claude --print` |
| `agent_task` | Single agent task | Pipes task to `claude --print` |
| `shell_command` | Run arbitrary shell commands | `child_process.exec()` |

Tasks are defined in `scheduler/tasks.json` and configured during onboarding. The scheduler logs all activity to `scheduler/logs/scheduler.log`.

Start the scheduler with:
```bash
npm run scheduler
```

---

## Commands Reference

All commands are typed in Claude Code within the project directory.

| Command | Description |
|---------|-------------|
| `/init` | Full onboarding — configure your project from scratch. Walks through all 8 phases. |
| `/status` | System overview — agents, recent outputs, memory health, data freshness, scheduler status. |
| `/run [workflow]` | Execute a named workflow. Without a name, lists all available workflows. |
| `/add-agent` | Add a new agent through a guided mini-onboarding. |
| `/reconfigure` | Re-enter setup for a specific section (team, outputs, dashboard, theme, integrations, scheduler, deployment). |
| `/memory` | Search or display institutional memory. With a search term, greps all memory files. |
| `/dashboard` | Start or restart the Next.js dashboard dev server. |
| `/setup-deploy` | Configure cloud deployment — generates Docker configs and setup guides. |

---

## Manage from Your Phone

VibeOrg supports Claude Code Channels, letting you message your agent team from Telegram or Discord. Send instructions, check status, review outputs, and receive notifications — all from your phone.

```
You (Telegram): "Run the morning research cycle"
VibeOrg: "⏳ Starting morning cycle..."
VibeOrg: "✅ IRIS found 3 developments. FINN updated 2 positions."
VibeOrg: "📄 Morning briefing ready."
[sends briefing file]
```

Set up during `/init` onboarding (Phase 5), or see [deploy/DEPLOY.md](deploy/DEPLOY.md) for manual setup on a VPS.

**Requirements:** Claude Code v2.1.80+ and a claude.ai Pro subscription. The scheduler can also send one-way Telegram notifications for task completion/failure independently of the channel session.

---

## Daily Usage

### Give your agents a task

```
You: "Run the morning research cycle"
Claude: reads agents.json, identifies the workflow, spawns agents in sequence,
        writes outputs, updates memory
You: opens localhost:3000, sees the new reports
```

### Adjust agent behavior

```
You: "IRIS isn't giving enough detail on competitor analysis"
Claude: updates IRIS's PERSONA.md, adjusts output schema, shows you the diff
```

### Ad-hoc tasks

```
You: "Research the new EU battery regulation and how it affects our portfolio"
Claude: routes to IRIS (research), then FINN (financial impact analysis),
        presents a summary and files the outputs
```

### Automated workflows

```
[6:00 AM, scheduler fires]
→ Fetches market data from API → saves to data/incoming/
→ Triggers Claude Code with "Process morning data feed"
→ Claude orchestrates the agent pipeline, writes outputs
[You wake up, open dashboard, everything is there]
```

---

## Configuration

### `vibeorg.config.json`

The central configuration file. Generated during onboarding, editable at any time.

```json
{
  "version": "0.2.0",
  "project": {
    "name": "My Investment Research Team",
    "description": "AI team for Nordic equity research",
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

### Environment Variables

Secrets go in `.env` (gitignored). The `.env.example` file documents all required keys:

```bash
ANTHROPIC_API_KEY=sk-ant-...       # For scheduled agent tasks
MARKET_API_KEY=...                  # Data source API keys
SLACK_BOT_TOKEN=xoxb-...           # If Slack is configured
```

### MCP Configuration

External service integrations are configured in `.mcp.json` at the project root. Claude sets this up during onboarding Phase 5.

---

## Cloud Deployment

VibeOrg is local-first but can run 24/7 on a cloud VPS.

### What you get

- Dashboard accessible from any device
- Scheduler running automated tasks around the clock
- Claude Code accessible via SSH for interactive use

### Deployment topology

```
┌─────────────────────────────────────────┐
│           Cloud VPS (2GB RAM)           │
│                                         │
│  ┌───────────────┐  ┌───────────────┐  │
│  │   Dashboard   │  │   Scheduler   │  │
│  │  (Next.js)    │  │  (node-cron)  │  │
│  │  :3000        │  │               │  │
│  └───────┬───────┘  └───────┬───────┘  │
│          └──────┬───────────┘          │
│                 ▼                       │
│    ┌───────────────────────┐           │
│    │  Filesystem (shared)  │           │
│    │  outputs, memory, data│           │
│    └───────────────────────┘           │
│                 ▲                       │
│    ┌────────────┴──────────┐           │
│    │  Claude Code (CLI)    │           │
│    └───────────────────────┘           │
└──────────────────┬──────────────────────┘
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
  SSH + Claude   Browser     VS Code
  (phone/laptop) (dashboard) Remote SSH
```

### Authentication options

| Option | Complexity | Best For |
|--------|-----------|----------|
| **Tailscale** | Low | Personal use. Private VPN, zero public exposure. |
| **Cloudflare Tunnel** | Low-Medium | Sharing with others. Public URL with auth. |
| **NextAuth + GitHub** | Medium | Standard web auth. |
| **nginx Basic Auth** | Very Low | Quick and simple. |

### Getting started

```bash
# Configure deployment
/setup-deploy

# Or manually follow the guide
cat deploy/DEPLOY.md
```

See [deploy/DEPLOY.md](deploy/DEPLOY.md) for the full step-by-step guide.

---

## Extensibility & Plugin Architecture

VibeOrg v0.1 is designed with extension points that make a plugin system natural to add in v0.2.

### Extension points

| Mechanism | How It Works |
|-----------|-------------|
| **Agent directories** | Self-contained in `agents/[id]/`. Drop in a folder, add to `agents.json`. |
| **Dashboard pages** | Self-contained, import only from `@/components/common/` and `@/lib/`. |
| **CSS variable theming** | Plugin components inherit the theme automatically via `var(--color-primary)`. |
| **JSON registries** | `agents.json`, `navigation.json`, `sources.json`, `tasks.json` — all extensible arrays. |
| **FSReader interface** | Stable data access contract documented in `PLUGIN_SPEC.md`. |

### Future plugin types

- **Agent Templates** — Pre-built agent configurations (persona, schema, examples)
- **Data Source Connectors** — Pre-built fetch configurations with scheduler tasks
- **Dashboard View Packages** — Pre-built page components for common use cases

See [PLUGIN_SPEC.md](PLUGIN_SPEC.md) for the full architecture documentation.

---

## Technical Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | >= 18 |
| AI Orchestration | Claude Code | Latest |
| Dashboard | Next.js (App Router) | 14+ |
| UI Framework | React | 18+ |
| Styling | Tailwind CSS | 3+ |
| Type Safety | TypeScript | 5+ |
| Scheduler | node-cron | 3+ |
| Markdown Parsing | gray-matter, react-markdown | Latest |
| Charts | Recharts | 2+ |
| Database (optional) | better-sqlite3 | Latest |
| Deployment | Docker, Docker Compose | Latest |

### System requirements

- Claude Code installed and authenticated
- Node.js 18+
- Git
- ~100MB disk for a fresh project (grows with outputs)
- Docker (only for cloud deployment)

---

## Scripts

```bash
# Start the dashboard in development mode
npm run dev

# Build the dashboard for production
npm run build

# Start the scheduler
npm run scheduler

# Validate all schemas and project structure
npm run validate

# Generate seed data for the dashboard
npm run seed
```

### Utility scripts

```bash
# Export agent outputs to CSV
node scripts/export.js --agent iris --format csv

# Export all outputs to JSON
node scripts/export.js --all --format json

# Rebuild SQLite database from filesystem (if SQLite enabled)
node scripts/rebuild-db.js
```

---

## Optional SQLite Layer

SQLite is **not** enabled by default. It's available for projects with:
- High-volume time-series data
- Need for structured queries across outputs
- Complex filtering/sorting in the dashboard

When enabled, SQLite **mirrors** the filesystem — files remain the source of truth, SQLite is a read-optimized index. If the database gets corrupted, rebuild it with:

```bash
node scripts/rebuild-db.js
```

---

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

**Key principles:**
- Agent directories are self-contained
- Dashboard pages import only from common paths
- CSS variables for all theming
- Files are the database — no external databases for core functionality
- Run `npm run validate` before submitting

---

## Success Criteria

VibeOrg v0.1 is successful when:

1. A user goes from `git clone` to a working agent team with a custom dashboard in under 15 minutes
2. The onboarding produces sensible teams for at least 5 different business domains
3. The generated dashboard looks tailored to the specific use case — not generic
4. Agents produce valid, schema-conforming outputs that render correctly
5. File-based agent handoffs work reliably through the orchestrator
6. Memory accumulates meaningfully over 10+ interactions
7. A scheduled workflow runs unattended and produces outputs
8. The entire system is understandable by reading the files — no hidden state

---

## License

MIT — see [LICENSE](LICENSE).

Copyright (c) 2026 Carl Westman
