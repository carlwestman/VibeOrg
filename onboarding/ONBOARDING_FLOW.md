# Onboarding Flow

Instructions for Claude Code to follow when the user runs `/init` or when a fresh clone has no configured `vibeorg.config.json` (empty `project.name`).

---

## Your Approach

- Be conversational, not interrogative
- Ask 1-2 questions at a time, never a wall of questions
- Provide smart defaults and examples based on what you learn
- After each phase, summarize what you understood and confirm before proceeding
- The user can say "go back" to re-enter a previous phase
- Track all decisions in memory as you go

---

## Phase 1: Business Context

**Entry conditions:** `/init` was triggered, `vibeorg.config.json` has empty `project.name`.

**Your task:**
Ask the user to describe their project or business in a few sentences. Then ask what they want their AI agent team to accomplish.

**Questions (ask 1-2 at a time):**
1. "What does your business or project do? Give me 2-3 sentences."
2. "What are you trying to accomplish with this agent team? What key outputs do you need?" (reports, analyses, emails, data, code, content, etc.)
3. "Are there external data sources or APIs involved?" (market data, CRM, social media, documents, etc.)
4. "What's the cadence? Will agents run on-demand when you ask, on a daily schedule, weekly, or event-driven?"

**From the answers, infer:**
- **Domain**: finance, marketing, engineering, operations, research, education, healthcare, legal, creative, etc.
- **Output types**: reports, data analysis, content, code, communications, monitoring alerts
- **Cadence**: real-time, daily, weekly, ad-hoc, event-driven
- **Data sources**: APIs, documents, web scraping, manual input, databases

**Confirmation gate:**
"Here's what I understand about your project: [summary]. Is this right, or should I adjust anything?"

**Output artifacts:**
- Store answers in memory (don't write config yet — that happens in Phase 7)

**Exit conditions:** User confirms the summary.

---

## Phase 2: Team Design

**Entry conditions:** Phase 1 complete. You have domain, output types, cadence, data sources.

**Your task:**
Based on Phase 1, propose an agent team. Read `onboarding/TEAM_DESIGN_GUIDE.md` for archetypes and domain templates.

**Steps:**
1. Identify the closest domain template in TEAM_DESIGN_GUIDE.md
2. Propose 2-4 agents with: name, role, responsibilities, key outputs
3. For each agent, explain WHY they exist (what gap they fill)
4. Present the interaction pattern (who hands off to whom)
5. Propose a memory strategy (what each agent should remember)
6. Ask: "Does this team structure work? Want to add, remove, or change anyone?"

**Decision logic:**
- Simple domain with linear workflow → 2-3 agents
- Complex domain with parallel needs → 3-5 agents
- NEVER propose more than 6 agents in initial setup
- Every agent must have a distinct, non-overlapping role
- If two agents would overlap >30%, merge them
- Always include a clear data flow: who produces what, who consumes it

**Confirmation gate:**
"Here's the team I'm proposing: [table with name, role, responsibilities, interactions]. Should I proceed with this team, or would you like changes?"

**Output artifacts:**
- Draft agent list with roles, capabilities, interaction patterns (held in conversation)

**Exit conditions:** User approves the team structure.

---

## Phase 3: Output Design

**Entry conditions:** Phase 2 complete. Agent team is defined.

**Your task:**
Design the output schemas and folder structure. Read `onboarding/OUTPUT_DESIGN_GUIDE.md` for patterns.

**Steps:**
1. For each agent, propose an output format (JSON structure with domain-relevant fields)
2. Propose which outputs are JSON (structured data) vs Markdown (reports, narratives)
3. Propose the folder structure under `outputs/`
4. Ask if the user needs any specific fields, formats, or conventions
5. Determine if SQLite is warranted (high-volume time-series, structured queries, many-to-many relationships)

**Decision logic:**
- Structured data (financial, metrics, inventory) → JSON with typed fields
- Narrative content (reports, analyses, articles) → JSON wrapper with Markdown content field
- Mixed → JSON with both structured fields and a content field
- SQLite: only recommend if the user describes high-volume data or complex query needs

**Confirmation gate:**
"Here's how each agent's outputs will be structured: [summary per agent]. Does this work?"

**Output artifacts:**
- Draft output schemas per agent (held in conversation)
- SQLite decision (yes/no)

**Exit conditions:** User approves output designs.

---

## Phase 4: Dashboard Design & Theming

**Entry conditions:** Phase 3 complete. Outputs are designed.

**Your task:**
Design the dashboard pages and visual theme. Read `onboarding/DASHBOARD_DESIGN_GUIDE.md` for patterns.

**Step 4a — Page structure:**
Based on the agents and outputs, propose which pages the dashboard needs. Always include: Overview (/), Status (/status), Settings (/settings). Then add domain-specific pages.

Present a proposed sitemap:
```
/ — Overview dashboard (key metrics, recent activity)
/status — System health, agent activity
/settings — Configuration
/[domain-page-1] — [description]
/[domain-page-2] — [description]
...
```

Ask: "Does this page structure work? Want to add, remove, or rename any pages?"

**Step 4b — Visual design direction:**
Propose 2-3 theme directions based on the domain:

| Domain Signal | Direction |
|---------------|-----------|
| Finance, legal, accounting | Clean, professional. Muted palette (slate, navy, white). Dense data. Monospace numbers. |
| Education, creative, children | Warm, playful. Rounded corners, friendly colors (teal, coral, amber). Spacious. |
| Engineering, DevOps, technical | Minimal, functional. Dark mode default. Terminal-inspired. High density. |
| Healthcare, wellness | Calm, trustworthy. Soft blues/greens. Generous whitespace. Clear hierarchy. |
| General / mixed | Modern neutral. Clean, dark/light toggle, subtle color accents. |

Present options and ask the user to pick one or describe their own preference.

**Step 4c — Data visualization:**
If the use case involves quantitative data, ask:
- Preferred chart types (line, bar, pie, tables, cards)
- KPI display style (big numbers, sparklines, gauges)
- Dense tables or card-based layouts?

**Confirmation gate:**
"Here's the dashboard plan: [sitemap + theme choice + data viz preferences]. Ready to proceed?"

**Output artifacts:**
- Dashboard sitemap
- Theme configuration (direction, colors, mode, density, fonts, border radius)
- Data visualization preferences

**Exit conditions:** User approves the dashboard design.

---

## Phase 5: MCP & Integrations

**Entry conditions:** Phase 4 complete.

**Your task:**
Configure external service integrations.

**Steps:**
1. Review the agents' capabilities — which ones need external services?
2. Ask: "Do any of your agents need access to external services? Common ones include: web search, Slack, email, Google Drive, GitHub, specific APIs."
3. For each integration:
   - Configure the MCP server entry in `.mcp.json`
   - Add required environment variables to `.env.example`
   - Walk the user through getting API keys
   - Test connectivity where possible
4. Ask about scheduled data fetches: "Should any data be fetched automatically on a schedule? (e.g., market data every morning, news feeds hourly)"
5. Configure scheduler tasks for any scheduled fetches

**Confirmation gate:**
"I've configured these integrations: [list]. All API keys are set up. Ready to proceed?"

**Output artifacts:**
- `.mcp.json` configuration (draft)
- `.env.example` additions (draft)
- Scheduler task definitions (draft)

**Exit conditions:** User confirms integrations are set up.

---

## Phase 6: Deployment Mode

**Entry conditions:** Phase 5 complete.

**Your task:**
Determine how the user will run VibeOrg.

**Questions:**
1. "Will you run this locally on your machine, or deploy to a remote server?"
2. If remote: "What's your preferred server? (Hetzner, DigitalOcean, Railway, other)"
3. If remote: "How should the dashboard be accessed? Options: Tailscale (private VPN, most secure), Cloudflare Tunnel (shareable URL), HTTP Basic Auth (simple), or NextAuth with GitHub login."

**Decision logic:**
- Local → set `deployment_mode: "local"`, skip deployment config generation
- Remote → set `deployment_mode: "remote"`, generate `deploy/` directory contents in Phase 7

**Confirmation gate:**
"Got it — [local/remote] deployment. [If remote: using X for access]. Ready to build?"

**Output artifacts:**
- Deployment mode decision

**Exit conditions:** User confirms deployment preference.

---

## Phase 7: Build

**Entry conditions:** Phases 1-6 complete. All decisions captured.

**Your task:**
This is where you do the heavy lifting. Build everything the user approved.

**Step 7a — Write configuration:**
1. Update `vibeorg.config.json` with all settings (project info, theme, data sources, deployment mode)
2. Write `.mcp.json` with configured MCP servers
3. Update `.env.example` with all required keys
4. Create `.env` from `.env.example` (user should have already pasted keys in Phase 5)

**Step 7b — Scaffold the agent system:**
For each agent:
1. Create `agents/[agent-id]/PERSONA.md` — follow the template in `onboarding/templates/agent-persona.md.tmpl`, customize for this specific agent
2. Create `agents/[agent-id]/OUTPUT_SCHEMA.json` — JSON Schema matching the approved output design
3. Create `agents/[agent-id]/EXAMPLES.md` — 3-5 few-shot examples of good outputs for this agent
4. Create `agents/[agent-id]/TOOLS.md` — list of tools this agent can use
5. Create `memory/agents/[agent-id]/memory.md` — initialized with the template from `onboarding/templates/agent-memory.md.tmpl`
6. Create `outputs/[agent-id]/` directory
7. Create `outputs/[agent-id]/index.json` — empty manifest: `{ "outputs": [] }`

Then:
8. Update `agents/agents.json` with all agents and their routing
9. Create `workflows/*.json` for any defined workflows
10. Update `memory/shared/PROJECT_CONTEXT.md` with the project description, objectives, and team overview

**Step 7c — Generate the dashboard:**
Read `onboarding/DASHBOARD_DESIGN_GUIDE.md` for patterns.

1. Update `dashboard/tailwind.config.ts` with the theme settings
2. Update `dashboard/app/globals.css` with CSS variables matching the theme
3. Update `dashboard/navigation.json` with the approved sitemap
4. Generate each domain-specific page as a React Server Component in `dashboard/app/`
5. Generate domain-specific components in `dashboard/components/`
6. Update `dashboard/lib/types.ts` with domain-specific TypeScript types matching output schemas

**Important dashboard generation rules:**
- Each page should be a proper React Server Component reading from the filesystem via `fs-reader.ts`
- Use real Tailwind classes matching the chosen theme
- TypeScript types must match the actual JSON schemas
- Code must be idiomatic, readable, and editable
- Each page should have domain-appropriate layouts, NOT generic output lists
- Components should import only from `@/components/common/`, `@/lib/`, or their own directory

**Step 7d — Seed test data:**
Generate 3-5 example outputs per agent that match their output schemas. The data should be:
- Realistic for the domain (not lorem ipsum)
- Include proper meta fields (timestamps, IDs, tags)
- Cover different output statuses (draft, final)
- Create plausible memory entries for each agent
- Populate shared memory with project context

**Step 7e — Configure scheduler (if applicable):**
1. Update `scheduler/tasks.json` with configured tasks
2. Write any custom fetch scripts

**Step 7f — Configure deployment (if remote):**
1. Generate `deploy/Dockerfile`
2. Generate `deploy/docker-compose.yml`
3. Generate `deploy/DEPLOY.md` customized to the user's choices
4. Generate relevant setup scripts

**Step 7g — Start the dashboard:**
1. Run `npm install` in the `dashboard/` directory
2. Run `npm run dev` in `dashboard/`
3. Tell the user the dashboard is available at `http://localhost:3000`

**Step 7h — Save the build manifest:**
Write `onboarding/build-manifest.json` documenting every file that was generated:
```json
{
  "version": "0.2.0",
  "built_at": "ISO timestamp",
  "phases_completed": [1, 2, 3, 4, 5, 6, 7],
  "generated_files": [
    { "path": "agents/iris/PERSONA.md", "reason": "Agent persona for IRIS", "phase": 7 },
    ...
  ],
  "user_decisions": {
    "domain": "...",
    "team_size": 3,
    "theme": "...",
    "deployment": "local"
  }
}
```

---

## Phase 8: Iterate

**Entry conditions:** Phase 7 complete. The system is running.

**Your task:**
Walk the user through what was built and show them how to iterate.

**Steps:**
1. Give a brief tour of the generated pages (what each one shows)
2. Explain how to modify things:
   - "Tell me to change the [page] layout" — you'll edit the dashboard code
   - "Edit `dashboard/app/[page]/page.tsx` directly" — they can edit in their IDE
   - Agent behavior: "Tell me to adjust [agent name]'s persona" — you'll edit PERSONA.md
3. Show where agent outputs land and how the dashboard picks them up
4. Explain the slash commands: `/run`, `/status`, `/add-agent`, `/reconfigure`
5. If scheduler is configured, explain how scheduled tasks work

**Tell the user:**
"Your agent team is ready. Here's what you can do next:
- Give me a task and I'll route it to the right agent
- Run `/status` to see the system state at any time
- Run `/add-agent` to add a new team member
- Run `/reconfigure` to change any part of the setup
- Edit any file directly — the dashboard picks up changes automatically"
