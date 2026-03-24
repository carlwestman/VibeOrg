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

## Phase 0: Project Initialization (automatic, ~10 seconds)

**Entry conditions:** `/init` was triggered. This phase runs automatically before asking any questions.

**Skip condition:** If `vibeorg.config.json` already has a non-empty `project.name`, this is a re-run — skip Phase 0 entirely and enter the `/reconfigure` flow instead.

**Your task:**
Ensure the project has a clean git history disconnected from the VibeOrg scaffolding repo.

**Steps:**

1. Check if a `.git` directory exists and if it has a remote pointing to the VibeOrg scaffolding repo:
   ```
   git remote -v
   ```
   Look for any remote URL containing "vibeorg" (case-insensitive).

2. **If a scaffolding remote is found:**
   - Remove the existing git history:
     ```
     rm -rf .git
     ```
   - Initialize a fresh repo:
     ```
     git init
     ```
   - Verify `.gitignore` is comprehensive (must include `.env`, `.env.local`, `.env.production`, `node_modules/`, `scheduler/logs/`, `db/*.db`, `db/*.db-journal`, `db/*.db-wal`, `dashboard/.next/`, `dashboard/out/`, `.DS_Store`, `Thumbs.db`, `.claude/`). If any entries are missing, append them.
   - Stage and commit the scaffolding files:
     ```
     git add .
     git commit -m "Initial commit: VibeOrg project scaffolded"
     ```
   - Inform the user:
     "I've disconnected this project from the VibeOrg template repo and initialized a fresh git history. I'll help you connect it to your own repository at the end of setup."

3. **If `.git` doesn't exist** (user downloaded a zip or used degit):
   - Initialize a fresh repo:
     ```
     git init
     ```
   - Same `.gitignore` check and initial commit as above.
   - Inform the user:
     "I've initialized a git repo for your project."

4. **If `.git` exists but the remote is NOT the scaffolding repo** (user already set up their own repo):
   - Do nothing. The user has already handled this.

5. Proceed to Phase 1.

---

## Phase 1: Business Context

**Entry conditions:** Phase 0 complete (or skipped). `vibeorg.config.json` has empty `project.name`.

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
Configure MCP servers, assign tools to agents, and set up integrations.

**Step 5a — MCP Server Configuration:**

Ask the user:
"Do you have any MCP servers or external tools your agents should use? You can give me GitHub repo URLs, npm package names, or describe what you need."

The user may respond with:
- GitHub URLs (e.g., "github.com/carlwestman/borsdata-mcp-server")
- Plain descriptions (e.g., "I need Slack integration and stock data")
- A mix of both

**GitHub Auto-Discovery:**

For each GitHub URL the user provides:

1. **Fetch the README** using web search or web fetch.
   Try in order:
   - Fetch: `https://raw.githubusercontent.com/{user}/{repo}/main/README.md`
   - Fetch: `https://raw.githubusercontent.com/{user}/{repo}/master/README.md`
   - Search: "github.com/{user}/{repo}" and read the repo page

   Also check for:
   - `package.json` (for dependencies, scripts, entry point)
   - `.env.example` (for required environment variables)
   - `src/index.ts` or `index.js` (for tool definitions if README is sparse)

2. **Extract key information** from the README and repo files:
   - Server purpose: what domain/data does it cover?
   - Tool list: names and descriptions of all exposed tools/functions
   - API keys: any required environment variables or authentication
   - Runtime: Node, Bun, Python? Any build step needed?
   - Installation: can it run via `npx github:user/repo` or needs cloning?

3. **Present a summary** to the user:
   "I found borsdata-mcp-server — 27 tools for Nordic equity data including instruments, prices, reports, KPIs, insider holdings, and more. It needs a BORSDATA_API_KEY. Want me to add it?"

4. **Generate the `.mcp.json` entry:**

   For repos that can run via npx (have a proper `package.json` with bin):
   ```json
   {
     "borsdata": {
       "command": "npx",
       "args": ["-y", "github:user/repo"],
       "env": { "BORSDATA_API_KEY": "${BORSDATA_API_KEY}" }
     }
   }
   ```

   For repos that need cloning and building:
   ```json
   {
     "borsdata": {
       "command": "node",
       "args": ["./mcp-servers/borsdata-mcp-server/dist/index.js"],
       "env": { "BORSDATA_API_KEY": "${BORSDATA_API_KEY}" }
     }
   }
   ```
   Inform the user: "This server needs to be built locally. I'll clone it to `./mcp-servers/` and run the build step."
   Then run:
   ```
   mkdir -p mcp-servers
   cd mcp-servers && git clone <repo-url>
   cd <repo-name> && npm install && npm run build
   ```

   For remote URL-based servers (e.g., Slack, Gmail):
   ```json
   {
     "slack": { "type": "url", "url": "https://mcp.slack.com/sse" }
   }
   ```

5. **Handle API keys:**
   - Add the key name to `.env.example` with a comment explaining where to get it
   - Ask the user: "Paste your [service] API key:"
   - Save to `.env`
   - If the README mentions where to get the key, tell the user

6. **Handle discovery failures gracefully:**
   If the README is sparse or missing:
   - Ask: "I couldn't find a detailed tool listing in the README. Can you tell me what this server does and what tools it provides?"
   - Or: "Want me to try starting the server to discover its tools? I'll run `claude /mcp` after configuring it."
   If the repo is private:
   - "I can't access that repo — it may be private. Can you describe what it does, or paste the relevant section of the README here?"

For plain descriptions (no URL), suggest servers from the common patterns table below, or ask the user if they have a specific server in mind.

**Common MCP Server Patterns:**

When the user describes their needs without providing URLs, suggest relevant MCP servers:

| User Need | Suggested MCP Server | Configuration |
|-----------|---------------------|---------------|
| "Slack integration" | Slack MCP | `type: "url"`, `url: "https://mcp.slack.com/sse"` |
| "Email" | Gmail MCP | `type: "url"`, `url: "https://gmail.mcp.claude.com/mcp"` |
| "Calendar" | Google Calendar MCP | `type: "url"`, `url: "https://gcal.mcp.claude.com/mcp"` |
| "File system access" | Filesystem MCP | `npx @modelcontextprotocol/server-filesystem` |
| "Database access" | Postgres/SQLite MCP | `npx @modelcontextprotocol/server-postgres` |
| "Web scraping" | Puppeteer MCP | `npx @modelcontextprotocol/server-puppeteer` |
| "GitHub" | GitHub MCP | `npx @modelcontextprotocol/server-github` |

Also check: https://github.com/modelcontextprotocol/servers for the official server list. The user may also have their own MCP servers on GitHub — always ask.

**Tool-to-Agent Assignment:**

After ALL MCP servers are configured, present the full tool landscape and propose assignments in a single conversational turn:

"Here's everything your agents can work with:

 MCP Servers:
 - [server] ([N] tools) — [purpose]

 Built-in tools:
 - web search — Web research
 - file read/write — Filesystem access

 Your agents:
 - [AGENT] — [Role]

 I'd suggest this mapping:

 [AGENT] ([Role]):
   - [server] — [why this agent needs it]
   - Typical flow: [tool1] → [tool2] → [tool3]

 Does this look right? Want to change anything?"

Let the user adjust. They might say things like:
- "IRIS should also have portfolio-optimizer for quick stress tests" → Add, scoped to specific tools only
- "Only FINN should use the optimizer" → Restrict to FINN
- "Don't give EDNA web search" → Remove from EDNA
- "Give everyone borsdata" → Add to all with role-appropriate usage notes

After each adjustment, confirm the updated mapping before proceeding.

**Usage Guidance Per Agent:**

For each agent-tool pairing, generate specific guidance covering:
- **When to use it**: "Use borsdata when researching Nordic equities. For non-Nordic stocks, use web search instead."
- **Typical call sequence**: "Always call search_instruments first to get the instrumentId, then use it for all subsequent calls."
- **Scope boundaries**: "IRIS uses portfolio-optimizer ONLY for run_stress_test when evaluating a new position. For full portfolio optimization, hand off to FINN."
- **What NOT to do**: "Don't use get_latest_prices for research — that's end-of-day data only."

Present the proposed guidelines and ask: "I've drafted usage guidelines for each agent. Should I adjust any of these?"

The user's answers flow directly into each agent's `TOOLS.md` and into the `mcp_tool_notes` field in `agents.json`.

**Generate Configuration Files:**

After the MCP conversation is complete:
1. Write/update `.mcp.json` with all configured servers
2. Update `agents/agents.json` with `mcp_tools` arrays and `mcp_tool_notes`
3. Generate `agents/[name]/TOOLS.md` for each agent (see `onboarding/OUTPUT_DESIGN_GUIDE.md` for the TOOLS.md pattern)
4. Create/update `MCP_SERVERS.md` with the full server reference
5. Update `.env.example` and `.env` with all required keys

**Scheduled data fetches:**

After MCP servers are configured, ask: "Should any data be fetched automatically on a schedule? (e.g., market data every morning, news feeds hourly)"
Configure scheduler tasks for any scheduled fetches.

**Step 5b — Remote Access via Messaging (Telegram/Discord):**

Ask the user:
"Would you like to manage your agent team from your phone? Claude Code Channels lets you message a Telegram or Discord bot that connects directly into this session. Setup takes about 5 minutes."

If yes, ask which platform (Telegram recommended for simplicity).

**Telegram Setup (guide the user through this):**

1. "Open Telegram and search for @BotFather. Send /newbot"
2. "Give your bot a display name (e.g., 'My VibeOrg Team') and a username ending in 'bot' (e.g., 'myvibeorg_bot')"
3. "BotFather will give you a bot token. Paste it here."
4. Save the token to `.env` as `TELEGRAM_BOT_TOKEN`
5. Install the Telegram channel plugin:
   ```bash
   claude /plugin install telegram@claude-plugins-official
   ```
6. Explain: "Now when you start Claude Code, add the --channels flag:
   `claude --channels plugin:telegram@claude-plugins-official`"
7. "Open a DM with your bot in Telegram. It will reply with a 6-character pairing code. Enter that code here in the terminal."
8. Verify the connection works by having the user send a test message
9. Update `memory/shared/PROJECT_CONTEXT.md` to note that Telegram channel is configured
10. Update `vibeorg.config.json` with the channels configuration

If the user chose remote/VPS deployment:
- Explain that the session must run inside tmux or screen to survive disconnects
- Note this will be covered in detail in `deploy/DEPLOY.md`
- Add `TELEGRAM_BOT_TOKEN` to `.env.example`

**Discord Setup (if chosen instead):**

1. "Go to discord.com/developers/applications and create a New Application"
2. "Under the Bot tab, click Reset Token and copy the token. Paste it here."
3. "Enable the Message Content Intent toggle under Privileged Gateway Intents"
4. "Use this URL to invite the bot to your server: [generate OAuth2 URL with bot scope and Send Messages permission]"
5. Save token to `.env` as `DISCORD_BOT_TOKEN`
6. Install and configure similarly to Telegram

If the user declines channels, skip this sub-step entirely.

**Confirmation gate:**
"I've configured these integrations: [list]. All API keys are set up. Ready to proceed?"

**Output artifacts:**
- `.mcp.json` configuration (draft)
- `.env.example` additions (draft)
- Scheduler task definitions (draft)
- Channel configuration in `vibeorg.config.json` (if set up)

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

**Step 7i — Connect to Your Repository:**

After everything is built and the user has seen the dashboard:

Ask: "Last step — want to connect this project to your own GitHub repo?"

**Option A: User has an existing empty repo.**
Ask for the URL (HTTPS or SSH). Then run:
```
git remote add origin <url>
git add .
git commit -m "VibeOrg setup complete: agents, dashboard, and workflows configured"
git push -u origin main
```
Confirm: "Your project is now connected to `<url>`. All future commits go to your repo."

**Option B: Create a new repo via GitHub CLI.**
Check if `gh` CLI is installed and authenticated:
```
gh auth status
```
If available, ask for the repo name and visibility:
"What should I call the repo? And should it be private or public?"

Then run:
```
git add .
git commit -m "VibeOrg setup complete: agents, dashboard, and workflows configured"
gh repo create <name> --private --source=. --push
```
Confirm: "Created `github.com/<user>/<name>` and pushed your project."

**Option C: Skip for now.**
If the user wants to do it later, tell them:
"No problem. Whenever you're ready, run:
`git remote add origin <your-repo-url>` then `git push -u origin main`"

Store a reminder in `memory/shared/PROJECT_CONTEXT.md`:
"Note: No remote repository connected yet."

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
