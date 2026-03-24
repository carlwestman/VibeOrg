# Deploying VibeOrg to a Cloud Server

## What You'll End Up With

- Your dashboard running 24/7 at a URL you can access from any device
- Your scheduler running automated tasks (data fetches, agent workflows)
- Claude Code accessible via SSH for giving instructions to your agents

## Prerequisites

- A VPS with at least 2GB RAM (Hetzner, DigitalOcean, Railway, etc.)
- SSH access to the server
- A domain name (optional but recommended)
- Your VibeOrg project configured and working locally

---

## Step 1: Set Up the Server

SSH into your fresh Ubuntu VPS and run the setup script:

```bash
# Upload the setup script
scp deploy/scripts/setup-server.sh user@your-server:/tmp/

# SSH in and run it
ssh user@your-server
chmod +x /tmp/setup-server.sh
sudo /tmp/setup-server.sh
```

This installs: Node.js 18+, Git, Docker, Docker Compose.

## Step 2: Clone Your Project

```bash
# On the server
cd /home/your-user
git clone your-repo-url vibeorg
cd vibeorg

# Copy your .env file (contains API keys — don't commit this)
# Option A: create it manually
nano .env
# Paste your environment variables

# Option B: scp from your local machine
# (from your local terminal)
scp .env user@your-server:/home/your-user/vibeorg/.env
```

## Step 3: Install Claude Code on the Server

Claude Code is needed for scheduled agent tasks and interactive use via SSH.

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Authenticate (follow the prompts)
claude auth
```

## Step 4: Start the Services

### Option A: Docker Compose (recommended)

```bash
cd deploy
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### Option B: Direct (no Docker)

```bash
# Install dependencies
npm install
cd scheduler && npm install && cd ..

# Start the dashboard (in a tmux/screen session or as a systemd service)
npm run dev

# Start the scheduler (in another session)
npm run scheduler
```

## Step 5: Set Up Access to the Dashboard

### Option A: Tailscale (recommended for personal use)

Most secure — the dashboard stays on a private VPN.

```bash
chmod +x deploy/scripts/setup-tailscale.sh
sudo deploy/scripts/setup-tailscale.sh
```

Then install Tailscale on your devices. Access the dashboard at `http://your-server-tailscale-ip:3000`.

### Option B: Cloudflare Tunnel (recommended for sharing)

Gives you a public URL with Cloudflare handling authentication.

```bash
chmod +x deploy/scripts/setup-cloudflare.sh
deploy/scripts/setup-cloudflare.sh
```

Follow the prompts to connect your domain and set up access policies.

### Option C: nginx + Basic Auth

Quick and simple. Single username/password.

```bash
sudo apt install nginx apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd yourusername
sudo cp deploy/nginx.conf /etc/nginx/sites-available/vibeorg
sudo ln -s /etc/nginx/sites-available/vibeorg /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Step 6: Set Up Remote Access via Telegram (Optional)

This lets you manage your agent team from your phone. You'll message a Telegram bot, and your messages go directly into the Claude Code session running on this server.

### Prerequisites
- Bun runtime installed on the server (`curl -fsSL https://bun.sh/install | bash`)
- A Telegram account on your phone
- Your bot token (from the /init setup, stored in .env)
- Claude Code v2.1.80+ and a claude.ai Pro subscription

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

This is the critical part. Claude Code must stay running for messages to arrive. We use tmux to keep the session alive even when you disconnect from SSH.

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
- **Messages sent while the session is down are lost.** The bot only sees messages in real-time. If tmux crashes or the server reboots, messages sent during downtime will not be delivered.
- **One user only.** The pairing code binds the channel to your Telegram user ID. Messages from anyone else are silently ignored.
- **Requires claude.ai subscription.** Channels requires Pro or higher. API key authentication does not work with channels. The scheduler can still use API key auth for its own headless invocations.
- **Photo handling.** Photos sent via Telegram are downloaded to ~/.claude/channels/telegram/inbox/ on the server. Claude can read them directly. Send as "File" (long-press) if you need the uncompressed original.

### Advanced: Auto-restart on Reboot

For production deployments, consider a systemd service to restart the tmux session on server reboot:

```bash
# /etc/systemd/system/vibeorg-channels.service
[Unit]
Description=VibeOrg Claude Code Channels Session
After=network.target

[Service]
Type=forking
User=your-user
ExecStart=/usr/bin/tmux new-session -d -s vibeorg -c /path/to/vibeorg 'source .env && claude --channels plugin:telegram@claude-plugins-official'
ExecStop=/usr/bin/tmux kill-session -t vibeorg
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## Step 7: Verify Everything Works

- [ ] Dashboard loads in the browser
- [ ] Status page shows your agents and their state
- [ ] SSH in and run `claude` in the project directory — orchestrator greets you
- [ ] Give an agent a test task and verify the output appears in the dashboard
- [ ] If scheduler is enabled: check `scheduler/logs/scheduler.log` for activity

## How to Use Your Deployed VibeOrg

**Give instructions to agents:** SSH into the server and run `claude` in the project directory. Or use VS Code Remote SSH for a full IDE experience.

**View the dashboard:** Open the URL in any browser (protected by your auth choice).

**Edit files:** VS Code Remote SSH gives full file editing on the server. Changes are picked up by the dashboard automatically.

---

## Troubleshooting

**Dashboard not loading:**
- Check `docker-compose logs dashboard` for errors
- Verify port 3000 is not blocked by a firewall
- Try `curl http://localhost:3000` on the server

**Scheduler not running tasks:**
- Check `scheduler/logs/scheduler.log`
- Verify `.env` has all required API keys
- Check that Claude Code is authenticated: `claude --version`

**Agent tasks failing:**
- Check scheduler logs for error messages
- Verify Claude Code can run headlessly: `echo "hello" | claude --print`
- Check API key limits and quotas
