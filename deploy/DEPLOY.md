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

## Step 6: Verify Everything Works

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
