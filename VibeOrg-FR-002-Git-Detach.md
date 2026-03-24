# Feature Request: Git Detach & Reattach During Onboarding

**Feature ID:** VORG-FR-002
**Priority:** Critical (must ship before public release)
**Status:** Ready for implementation
**Depends on:** VibeOrg v0.2 spec (already built)
**Estimated effort:** 1-2 hours

---

## Summary

After a user clones the VibeOrg scaffolding repo and runs `/init`, they must be cleanly detached from the scaffolding repo's git history and given a fresh git repo for their project. Without this, the user risks accidentally pushing their project (agents, secrets, outputs) back to the public scaffolding repo.

---

## Problem

The current flow is:

```
git clone https://github.com/[org]/vibeorg.git my-project
cd my-project
claude
/init
```

After `/init`, the `.git` directory still points at the VibeOrg scaffolding repo. If the user runs `git push`, their agents, API keys (if `.gitignore` is misconfigured), memory files, and generated dashboard code go to the public scaffolding repo. This is a security and usability problem.

---

## Solution

Nuke the scaffolding repo's git history and reinitialize as the user's own project. This is the same pattern used by `create-next-app`, `degit`, and similar scaffolding tools.

---

## What to Build

### 1. Add Phase 0 to Onboarding Flow

**File:** `onboarding/ONBOARDING_FLOW.md`

Insert before Phase 1 as the very first step:

```markdown
## Phase 0 — Project Initialization (automatic, 10 seconds)

Before asking any questions, perform this silently:

1. Check if a .git directory exists and if it has a remote pointing to the 
   VibeOrg scaffolding repo:
   
   git remote -v
   
   Look for any remote URL containing "vibeorg" (case-insensitive).

2. If a scaffolding remote is found:
   - Remove the existing git history:
     rm -rf .git
   - Initialize a fresh repo:
     git init
   - Ensure .gitignore is correct (must include .env, node_modules, 
     scheduler/logs/, db/*.db at minimum)
   - Stage and commit the scaffolding files:
     git add .
     git commit -m "Initial commit: VibeOrg project scaffolded"
   - Inform the user:
     "I've disconnected this project from the VibeOrg template repo and 
      initialized a fresh git history. I'll help you connect it to your 
      own repository at the end of setup."

3. If .git doesn't exist (user may have downloaded a zip or used degit):
   - Initialize a fresh repo:
     git init
   - Same .gitignore check and initial commit as above
   - Inform the user:
     "I've initialized a git repo for your project."

4. If .git exists but the remote is NOT the scaffolding repo (user 
   already set up their own repo):
   - Do nothing. The user has already handled this.

5. Proceed to Phase 1.
```

### 2. Add Phase 7e — Repository Connection

**File:** `onboarding/ONBOARDING_FLOW.md`

Insert at the end of Phase 7 (Build), after the dashboard is running and the user has been given localhost:3000:

```markdown
## Phase 7e — Connect to Your Repository

After everything is built and the user has seen the dashboard:

Ask: "Last step — want to connect this project to your own GitHub repo?"

### Option A: User has an existing empty repo
Ask for the URL (HTTPS or SSH). Then run:

  git remote add origin <url>
  git add .
  git commit -m "VibeOrg setup complete: agents, dashboard, and workflows configured"
  git push -u origin main

Confirm: "Your project is now connected to <url>. All future commits 
go to your repo."

### Option B: Create a new repo via GitHub CLI
Check if `gh` CLI is installed and authenticated:

  gh auth status

If available, ask for the repo name and visibility:
  "What should I call the repo? And should it be private or public?"

Then run:

  gh repo create <name> --private --source=. --push

Confirm: "Created github.com/<user>/<name> and pushed your project."

### Option C: Skip for now
If the user wants to do it later, tell them:

  "No problem. Whenever you're ready, run:
   git remote add origin <your-repo-url>
   git push -u origin main"

Store a reminder in memory/shared/PROJECT_CONTEXT.md:
  "Note: No remote repository connected yet."
```

### 3. Verify .gitignore Completeness

**File:** `.gitignore`

Ensure the scaffolding repo ships with a comprehensive `.gitignore` that protects the user from day one. This file must exist BEFORE Phase 0 runs `git add .`:

```gitignore
# Environment and secrets
.env
.env.local
.env.production

# Dependencies
node_modules/
dashboard/node_modules/

# Scheduler logs
scheduler/logs/

# SQLite database (if enabled)
db/*.db
db/*.db-journal
db/*.db-wal

# Next.js build output
dashboard/.next/
dashboard/out/

# OS files
.DS_Store
Thumbs.db

# Channel plugin data
.claude/
```

If the existing `.gitignore` is missing any of these entries, Phase 0 should append them before the initial commit.

### 4. Update CLAUDE.md

**File:** `CLAUDE.md`

Add a safety check to the startup protocol:

```markdown
## Startup Protocol (every session)
0. **Safety check**: Verify that `git remote -v` does NOT point to the 
   VibeOrg scaffolding repo. If it does, warn the user immediately and 
   offer to detach: "Your project is still connected to the VibeOrg 
   template repo. Want me to disconnect it and set up your own repo?"
1. Read vibeorg.config.json for project config
[... rest of existing startup protocol ...]
```

---

## Files Changed (Summary)

| File | Change Type | Description |
|------|------------|-------------|
| `onboarding/ONBOARDING_FLOW.md` | Modify | Add Phase 0 (git detach) and Phase 7e (repo connection) |
| `.gitignore` | Modify | Ensure comprehensive coverage before first commit |
| `CLAUDE.md` | Modify | Add scaffolding remote safety check to startup protocol |

---

## Acceptance Criteria

1. After `/init` completes Phase 0, `git remote -v` returns empty (no remotes) or shows the user's own repo
2. `git log` shows a clean single commit ("Initial commit: VibeOrg project scaffolded"), not the scaffolding repo's history
3. `.env` is never staged or committed at any point during the flow
4. If the user has `gh` CLI installed and authenticated, they can create and connect a repo without leaving the onboarding flow
5. If the user skips repo setup, a reminder is stored in PROJECT_CONTEXT.md
6. On every subsequent Claude Code session, the startup protocol warns if the scaffolding remote is still present

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User downloaded a .zip instead of cloning | No .git directory exists — Phase 0 initializes a fresh repo, no detach needed |
| User used `degit` or `npx degit` | Same as .zip — no .git directory |
| User already ran `git remote set-url` themselves | Phase 0 detects the remote is not the scaffolding repo and does nothing |
| User has uncommitted changes when running `/init` on a previously initialized project | Phase 0 only runs on first `/init` (check for existence of `vibeorg.config.json` — if it exists, this is a re-run, skip Phase 0) |
| User runs `/init` twice | Second run detects `vibeorg.config.json` exists and skips Phase 0. Enters `/reconfigure` flow instead |

---

## Out of Scope

- GitHub Actions or CI setup for the user's repo (future FR)
- Forking the scaffolding repo (not the right pattern — users should have a clean, independent repo)
- Multi-remote setups (e.g., keeping the scaffolding repo as an upstream for template updates — adds complexity, not worth it for v0.1)
