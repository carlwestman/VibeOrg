# VibeOrg Plugin Specification

**Status:** Architecture documentation for future plugin system (v0.2+)

This document describes the extension points in VibeOrg v0.1 that are designed to support plugins in a future release. Plugin installation and management are not yet implemented — this spec documents the conventions that make plugins natural to add later.

---

## Plugin Types

### 1. Agent Templates

Pre-built agent configurations that can be dropped into a VibeOrg project.

**Directory structure:**
```
@vibeorg/agent-[name]/
├── PERSONA.md              # Agent persona definition
├── OUTPUT_SCHEMA.json      # Output schema
├── EXAMPLES.md             # Few-shot examples
├── TOOLS.md                # Required tools/capabilities
└── README.md               # Documentation
```

**Installation (future):**
1. Copy the directory contents into `agents/[agent-id]/`
2. Add an entry to `agents/agents.json`
3. Create `memory/agents/[agent-id]/memory.md`
4. Create `outputs/[agent-id]/`

**Current convention:** Agent directories are self-contained. Nothing outside `agents/[id]/` is needed for the agent definition. Memory and outputs use predictable paths derived from the agent ID.

### 2. Data Source Connectors

Pre-built fetch configurations for external data sources.

**Directory structure:**
```
@vibeorg/source-[name]/
├── fetcher.js              # Data fetch logic
├── schema.json             # Output data schema
├── scheduler-task.json     # Pre-configured cron task
└── README.md               # Setup instructions
```

**Installation (future):**
1. Add fetcher script to `scripts/` or a `sources/` directory
2. Add task definition to `scheduler/tasks.json`
3. Add data source entry to `data/sources.json`
4. Add required env vars to `.env.example`

**Current convention:** Data source definitions live in `data/sources.json`. Scheduler tasks in `scheduler/tasks.json`. Both use JSON registries that can be extended.

### 3. Dashboard View Packages

Pre-built page components for the dashboard.

**Directory structure:**
```
@vibeorg/view-[name]/
├── page.tsx                # Main page component
├── components/             # Domain-specific components
│   └── *.tsx
├── types.ts                # TypeScript interfaces
└── README.md               # Documentation
```

**Installation (future):**
1. Copy page.tsx to `dashboard/app/[page-name]/page.tsx`
2. Copy components to `dashboard/components/[domain]/`
3. Merge types into `dashboard/lib/types.ts`
4. Add navigation entry to `dashboard/navigation.json`

**Current convention:** Dashboard pages are self-contained. They import only from:
- `@/components/common/` — shared components
- `@/lib/` — data access and types
- Their own directory — page-specific components

No cross-page component imports.

---

## Extension Points

### agents/agents.json
The agent registry. Plugins add entries here. Each entry has a predictable structure (see `lib/types.ts: Agent`).

### dashboard/navigation.json
The sidebar navigation registry. Plugins add entries here. Each entry has `{ label, href }`.

### data/sources.json
The data source registry. Plugins add entries here.

### scheduler/tasks.json
The task scheduler registry. Plugins add entries here.

### CSS Variables
The theme system uses CSS variables exclusively. Plugin components that use `var(--color-primary)`, `var(--color-bg)`, etc. automatically inherit the project's theme.

### FSReader Interface
The `dashboard/lib/fs-reader.ts` provides the data access contract. Plugin pages can use these functions to read agents, outputs, memory, and system status.

---

## Conventions for Plugin Compatibility

1. **Agent directories are self-contained** — all definition files live in `agents/[id]/`
2. **Dashboard pages import only from common paths** — `@/components/common/`, `@/lib/`
3. **All theme tokens are CSS variables** — components inherit theme automatically
4. **JSON registries are the extension mechanism** — agents.json, navigation.json, sources.json, tasks.json
5. **File-based data exchange** — agents communicate via files in `outputs/`, not code imports
6. **Predictable path conventions** — given an agent ID, all paths are derivable
