# VibeOrg

**Open-source scaffolding framework for AI agent teams in Claude Code.**

VibeOrg is to AI agent teams what `create-next-app` is to web projects. Clone the repo, run one command, answer some questions, and you have a working AI agent team with a custom dashboard.

## Quick Start

```bash
git clone https://github.com/your-org/vibeorg.git my-project
cd my-project
claude          # Start Claude Code
/init           # Run the onboarding flow
```

The `/init` command walks you through a guided setup:
1. Describe your business/project
2. Review the proposed agent team
3. Approve output formats
4. Choose a dashboard theme
5. Configure integrations
6. Claude builds everything automatically

In under 15 minutes, you'll have a working agent team and a custom dashboard at `http://localhost:3000`.

## How It Works

```
You (the manager)
  ↓ give instructions via Claude Code
Claude (the orchestrator)
  ↓ delegates to specialized agents
Agent Team (researchers, analysts, writers, etc.)
  ↓ produce structured outputs
Dashboard (Next.js)
  ↓ displays outputs in a domain-specific UI
```

- **The human is the manager.** You set strategy, review outputs, adjust the team.
- **Claude is the orchestrator.** It routes tasks, manages memory, coordinates agents.
- **Agents are specialists.** Each has a persona, memory, output schema, and defined tools.
- **The dashboard is a window.** Read-only view of your agent team's work.

## Architecture

```
vibeorg-project/
├── CLAUDE.md                 # Orchestrator instructions (the brain)
├── vibeorg.config.json       # Project configuration
├── agents/                   # Agent definitions (personas, schemas)
├── memory/                   # Persistent memory (shared + per-agent)
├── outputs/                  # Agent outputs (JSON, organized by agent)
├── data/                     # External data & feeds
├── workflows/                # Multi-step workflow definitions
├── dashboard/                # Next.js web UI (custom-generated)
├── scheduler/                # Automated task scheduler (node-cron)
├── deploy/                   # Cloud deployment configs
└── scripts/                  # Utility scripts
```

## Core Principles

- **Files are the database.** Everything is JSON/Markdown, human-readable, git-trackable.
- **The UI is a window, not a cockpit.** Dashboard is read-only. Actions flow through Claude Code.
- **Convention over configuration.** Strong defaults, everything overridable.
- **Git-native.** Your agent team's history is your commit history.
- **Claude Code only.** No abstraction layers. Built exclusively for Claude Code.

## Commands

| Command | Description |
|---------|-------------|
| `/init` | Full onboarding — configure your project from scratch |
| `/status` | Show system status — agents, outputs, memory health |
| `/run [workflow]` | Execute a named workflow |
| `/add-agent` | Add a new agent to the team |
| `/reconfigure` | Re-enter setup for a specific section |
| `/memory` | Search or display institutional memory |
| `/dashboard` | Start/restart the dashboard |

## Requirements

- Node.js 18+
- Claude Code (installed and authenticated)
- Git

## License

MIT
