# Feature Request: Claude Code Channels Integration

**Feature ID:** VORG-FR-001
**Priority:** High
**Status:** Ready for implementation
**Depends on:** VibeOrg v0.2 spec (already built)
**Estimated effort:** 6-8 hours

---

## Summary

Integrate Claude Code Channels (shipped March 20, 2026) as the primary remote interaction method for VibeOrg. This replaces the previously considered custom Telegram bot approach with Anthropic's native, first-class feature. The result: users can manage their entire agent team from their phone via Telegram (or Discord) by messaging a bot that connects directly into the live Claude Code session.

---

## Context

Claude Code v2.1.80 introduced Channels — an MCP-based system where external messaging platforms (Telegram, Discord) push events directly into a running Claude Code session. The session has full access to the project filesystem, CLAUDE.md instructions, agents, memory, and all configured MCP servers. This means a user messaging from Telegram gets the exact same orchestrator behavior as typing into the terminal.

Key properties:
- A channel is an MCP server running as a subprocess of Claude Code, communicating over stdio
- The plugin polls the messaging platform's API outbound — no inbound ports, no webhooks, no public URLs
- Two-way: Claude receives messages AND replies back through the same platform
- Pairing-code authentication binds the channel to a single user ID — all other senders are silently dropped
- Events only arrive while the session is open — requires tmux/screen for persistence
- Requires Claude Code v2.1.80+, claude.ai subscription (Pro or higher), and Bun runtime
- Currently in research preview; Telegram and Discord are the officially supported platforms

This is a significant upgrade to the VibeOrg deployment story. Instead of SSH-only interaction when away from the machine, users get a native mobile experience.

---

## What to Build

### 1. Update CLAUDE.md Orchestrator Instructions

Add a new section to the orchestrator instructions covering channel-aware behavior.

**File:** `CLAUDE.md`

Add the following section:

```markdown
## Channel Communication

When receiving messages via a Claude Code Channel (Telegram, Discord):
- You have full access to the project, agents, memory, and all tools — behave exactly as you would in the terminal
- Keep responses concise and mobile-friendly — the user is likely on their phone
- For long outputs (reports, detailed analysis), write to a file and send the file via the reply tool rather than pasting walls of text
- Use emoji sparingly for status updates: ⏳ working, ✅ done, ❌ error, 📄 file attached
- When a workflow completes, proactively send a brief summary without waiting to be asked
- If a task will take more than 30 seconds, send an acknowledgment immediately ("⏳ Starting the morning research cycle...") so the user knows the message was received
- Photos and files sent via Telegram are downloaded to ~/.claude/channels/telegram/inbox/ — you can read them directly
- If the user sends a photo of a document, handwritten notes, or a whiteboard, process it as you would any image input
```

### 2. Update Onboarding Flow

Add channel setup as a sub-step within the existing Phase 5 (MCP & Integrations).

**File:** `onboarding/ONBOARDING_FLOW.md`

Add the following within the Phase 5 instructions:

```markdown
### Remote Access via Messaging (Telegram/Discord)

Ask the user:
"Would you like to manage your agent team from your phone? Claude Code 
Channels lets you message a Telegram or Discord bot that connects directly 
into this session. Setup takes about 5 minutes."

If yes, ask which platform (Telegram recommended for simplicity).

#### Telegram Setup (guide the user through this):

1. "Open Telegram and search for @BotFather. Send /newbot"
2. "Give your bot a display name (e.g., 'My VibeOrg Team') and a username ending in 'bot' (e.g., 'myvibeorg_bot')"
3. "BotFather will give you a bot token. Paste it here."
4. Save the token to .env as TELEGRAM_BOT_TOKEN
5. Install the Telegram channel plugin:
   ```bash
   claude /plugin install telegram@claude-plugins-official
   ```
6. Explain: "Now when you start Claude Code, add the --channels flag:
   claude --channels plugin:telegram@claude-plugins-official"
7. "Open a DM with your bot in Telegram. It will reply with a 6-character pairing code. Enter that code here in the terminal."
8. Verify the connection works by having the user send a test message
9. Update memory/shared/PROJECT_CONTEXT.md to note that Telegram channel is configured

If the user chose remote/VPS deployment:
- Explain that the session must run inside tmux or screen to survive disconnects
- Add the tmux launch command to deploy/DEPLOY.md
- Add TELEGRAM_BOT_TOKEN to .env.example

#### Discord Setup (if chosen instead):

1. "Go to discord.com/developers/applications and create a New Application"
2. "Under the Bot tab, click Reset Token and copy the token. Paste it here."
3. "Enable the Message Content Intent toggle under Privileged Gateway Intents"
4. "Use this URL to invite the bot to your server: [generate OAuth2 URL with bot scope and Send Messages permission]"
5. Save token to .env as DISCORD_BOT_TOKEN
6. Install and configure similarly to Telegram
```

### 3. Update `.env.example`

**File:** `.env.example`

Add:

```bash
# Claude Code Channels (optional — for remote access via messaging)
# Set up via /init onboarding or manually via @BotFather on Telegram
TELEGRAM_BOT_TOKEN=
# DISCORD_BOT_TOKEN=
```

### 4. Update Deployment Documentation

**File:** `deploy/DEPLOY.md`

Add a new section after the existing "Step 4: Start the Services" section:

```markdown
## Step 5: Set Up Remote Access via Telegram

This lets you manage your agent team from your phone. You'll message a 
Telegram bot, and your messages go directly into the Claude Code session 
running on this server.

### Prerequisites
- Bun runtime installed on the server (`curl -fsSL https://bun.sh/install | bash`)
- A Telegram account on your phone
- Your bot token (from the /init setup, stored in .env)

### Create the Bot (skip if already done during /init)
1. Open Telegram on your phone
2. Search for @BotFather and start a chat
3. Send `/newbot`
4. Choose a display name (e.g., "My VibeOrg Team")
5. Choose a username ending in `bot` (e.g., `myvibeorg_bot`)
6. Copy the token BotFather gives you
7. On the server, add it to your .env file:
   ```bash
   echo 'TELEGRAM_BOT_TOKEN=your-token-here' >> .env
   ```

### Install the Channel Plugin
```bash
claude /plugin install telegram@claude-plugins-official
```

### Start Claude Code with Channels (persistent)

This is the critical part. Claude Code must stay running for messages to 
arrive. We use tmux to keep the session alive even when you disconnect 
from SSH.

```bash
# Create a persistent tmux session named "vibeorg"
tmux new-session -d -s vibeorg

# Send the claude startup command into that session
tmux send-keys -t vibeorg 'cd /path/to/your/vibeorg-project && source .env && claude --channels plugin:telegram@claude-plugins-official' Enter
```

### Pair Your Phone
1. Open Telegram on your phone
2. Find your bot and send any message (e.g., "hello")
3. The bot replies with a 6-character pairing code
4. Attach to the tmux session to enter the code:
   ```bash
   tmux attach -t vibeorg
   ```
5. Enter the pairing code when prompted
6. Detach from tmux: press Ctrl+B, then D

### Verify It Works
Send a message to your bot from Telegram:
```
You: "What's the status of the team?"
Bot: "✅ All 3 agents configured. Last activity: IRIS ran 2 hours ago..."
```

### Managing the Session

```bash
# Check if the session is running
tmux has-session -t vibeorg 2>/dev/null && echo "Running" || echo "Not running"

# View what's happening (read-only)
tmux attach -t vibeorg
# Detach without stopping: Ctrl+B, then D

# Restart the session if it died
tmux kill-session -t vibeorg 2>/dev/null
tmux new-session -d -s vibeorg
tmux send-keys -t vibeorg 'cd /path/to/your/vibeorg-project && source .env && claude --channels plugin:telegram@claude-plugins-official' Enter
```

### Important Limitations
- **Messages sent while the session is down are lost.** The bot only sees 
  messages in real-time. If tmux crashes or the server reboots, any messages 
  sent during downtime will not be delivered.
- **One user only.** The pairing code binds the channel to your Telegram 
  user ID. Messages from anyone else are silently ignored.
- **Requires claude.ai subscription.** Channels requires Pro or higher. 
  API key authentication does not work with channels. The scheduler can 
  still use API key auth for its own headless invocations.
- **Photo handling.** Photos sent via Telegram are downloaded to 
  ~/.claude/channels/telegram/inbox/ on the server. Claude can read them 
  directly. Send as "File" (long-press) if you need the uncompressed original.
```

### 5. Update `vibeorg.config.json` Schema

**File:** `vibeorg.config.json`

Add a `channels` section:

```json
{
  "channels": {
    "enabled": true,
    "platform": "telegram",
    "plugin": "telegram@claude-plugins-official",
    "startup_command": "claude --channels plugin:telegram@claude-plugins-official",
    "tmux_session_name": "vibeorg"
  }
}
```

This is informational — Claude reads it during startup to remind the user about their channel configuration and include it in `/status` output.

### 6. Update `/status` Slash Command

**File:** `CLAUDE.md` (within the `/status` handler section)

Add channel status to the `/status` output:

```markdown
When reporting status, include channel information if configured:

## Channel Status
If vibeorg.config.json has channels.enabled = true:
- Report whether the session was started with --channels flag
- Report the configured platform (Telegram/Discord)
- Note: you cannot programmatically check if the channel is connected,
  but you can remind the user of the tmux session name and startup command
  if they need to reconnect
```

### 7. Update Scheduler Integration Notes

**File:** `scheduler/README.md` (create if it doesn't exist, or add to existing scheduler docs)

Add a section clarifying the relationship between channels and the scheduler:

```markdown
## Channels vs Scheduler

The scheduler and Claude Code Channels serve different purposes and use 
different auth methods:

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

Both can run simultaneously. The scheduler fires its cron tasks independently, 
and the channel session handles human messages as they arrive. They share 
the same filesystem (outputs, memory, agents) so the user can check on 
scheduler-produced outputs via Telegram.

Note: If you want the scheduler to notify you via Telegram when a task 
completes or fails, it should write a status file that the channel session 
can pick up, or use the Telegram Bot API directly (a simple HTTP POST to 
https://api.telegram.org/bot<token>/sendMessage). This is a one-way 
notification, separate from the channel's two-way communication.
```

### 8. Add Scheduler-to-Telegram Notification Helper (Optional Enhancement)

**File:** `scheduler/notify.js`

A small utility the scheduler can use to send notifications via Telegram without going through Claude Code:

```javascript
// scheduler/notify.js
// Sends a notification directly to the user's Telegram.
// This is a simple HTTP call, not a channel message.
// Use this for scheduler completion/failure alerts.

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // User's chat ID, saved during pairing

async function notify(message) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[notify] Telegram not configured, skipping notification');
    return;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      }
    );

    if (!response.ok) {
      console.error('[notify] Telegram API error:', await response.text());
    }
  } catch (err) {
    console.error('[notify] Failed to send notification:', err.message);
  }
}

module.exports = { notify };
```

Update `scheduler/scheduler.js` to use it:

```javascript
const { notify } = require('./notify');

// After a workflow completes:
await notify(`✅ *${task.name}* completed successfully.`);

// After a failure:
await notify(`❌ *${task.name}* failed: ${error.message}`);
```

Add `TELEGRAM_CHAT_ID` to `.env.example`:

```bash
# Your Telegram chat ID (obtained during channel pairing)
# The onboarding process saves this automatically
TELEGRAM_CHAT_ID=
```

### 9. Update README.md

**File:** `README.md`

Add a section under "Getting Started" or "Features":

```markdown
## Manage from Your Phone

VibeOrg supports Claude Code Channels, letting you message your agent team 
from Telegram or Discord. Send instructions, check on status, review outputs, 
and receive notifications — all from your phone.

```
You (Telegram): "Run the morning research cycle"
VibeOrg: "⏳ Starting morning cycle..."
VibeOrg: "✅ IRIS found 3 developments. FINN updated 2 positions."
VibeOrg: "📄 Morning briefing ready."
[sends briefing file]
```

Set up during `/init` onboarding, or see `deploy/DEPLOY.md` for manual setup.

Requires Claude Code v2.1.80+ and a claude.ai Pro subscription.
```

---

## Files Changed (Summary)

| File | Change Type | Description |
|------|------------|-------------|
| `CLAUDE.md` | Modify | Add channel communication section and update /status handler |
| `onboarding/ONBOARDING_FLOW.md` | Modify | Add channel setup sub-phase within Phase 5 |
| `.env.example` | Modify | Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID |
| `deploy/DEPLOY.md` | Modify | Add full Telegram setup + tmux persistence guide |
| `vibeorg.config.json` | Modify | Add channels configuration section |
| `scheduler/notify.js` | Create | Telegram notification helper for scheduler alerts |
| `scheduler/scheduler.js` | Modify | Wire up notify() calls on task completion/failure |
| `scheduler/README.md` | Create or Modify | Document channels vs scheduler relationship |
| `README.md` | Modify | Add "Manage from Your Phone" section |

## Files NOT Changed

- No changes to the dashboard (Next.js app)
- No changes to agent definitions, schemas, or memory system
- No changes to workflow definitions
- No new npm dependencies in the main project (the channel plugin is managed by Claude Code's plugin system)

---

## Acceptance Criteria

1. Running `/init` on a fresh project includes the option to set up Telegram/Discord channels
2. A user following `deploy/DEPLOY.md` can set up Telegram access on a VPS without external help
3. Messages sent from Telegram reach the Claude Code orchestrator with full project context
4. Claude replies back through Telegram with concise, mobile-friendly responses
5. The scheduler sends completion/failure notifications to Telegram independently of the channel session
6. `/status` reports channel configuration status
7. The README documents the feature clearly with an example conversation

---

## Out of Scope

- Custom channel plugins (Slack, WhatsApp, etc.) — future work, document in PLUGIN_SPEC.md
- Telegram group/team support — channels pair to a single user only
- Message queue for offline messages — this is a Channels limitation, not something we can fix
- Dashboard integration with channels — the dashboard remains a read-only viewer
- Auto-restart of tmux session on server reboot — document as a manual step, suggest systemd service in DEPLOY.md as an advanced option
