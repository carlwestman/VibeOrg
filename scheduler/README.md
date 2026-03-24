# VibeOrg Scheduler

Lightweight task scheduler using node-cron. Runs automated data fetches, agent workflows, and maintenance tasks on cron schedules.

## Usage

```bash
# From the project root
npm run scheduler

# Or directly
node scheduler/scheduler.js
```

## Task Types

| Type | Description | Mechanism |
|------|-------------|-----------|
| `data_fetch` | HTTP requests to save data to files | Direct `fetch()` call |
| `agent_workflow` | Trigger a named multi-agent workflow | Pipes command to `claude --print` |
| `agent_task` | Single agent task | Pipes task to `claude --print` |
| `shell_command` | Run arbitrary shell commands | `child_process.exec()` |

## Configuration

Tasks are defined in `scheduler/tasks.json`. See the spec for the full schema.

## Telegram Notifications

If `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set in `.env`, the scheduler sends completion/failure notifications directly to your Telegram. This uses the Bot API directly — it works independently of whether a Claude Code Channels session is running.

---

## Channels vs Scheduler

The scheduler and Claude Code Channels serve different purposes and use different auth methods:

**Scheduler** — automated, machine-triggered tasks:
- Runs as a separate Node.js process
- Uses `claude --print` with API key auth for headless agent invocations
- Handles data fetches, timed workflows, memory pruning
- Does NOT require a claude.ai subscription (API key works)
- Runs independently of whether a channel session is open

**Channels** — human-triggered interaction from Telegram/Discord:
- Runs inside the main Claude Code session
- Uses claude.ai subscription auth (Pro or higher)
- Handles ad-hoc requests, status checks, reviews, delegation
- Requires the session to be running in tmux

Both can run simultaneously. The scheduler fires its cron tasks independently, and the channel session handles human messages as they arrive. They share the same filesystem (outputs, memory, agents) so the user can check on scheduler-produced outputs via Telegram.

**Scheduler notifications via Telegram:** If you want the scheduler to notify you when a task completes or fails, it uses the Telegram Bot API directly (a simple HTTP POST). This is a one-way notification, separate from the channel's two-way communication. Configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`.
