#!/bin/bash
# VibeOrg Cloudflare Tunnel Setup
# Gives your dashboard a public URL with Cloudflare handling authentication

set -e

echo "=== Cloudflare Tunnel Setup ==="

# Install cloudflared
echo "Installing cloudflared..."
curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
dpkg -i /tmp/cloudflared.deb
rm /tmp/cloudflared.deb

# Login to Cloudflare
echo ""
echo "You'll need to authenticate with your Cloudflare account."
echo "A browser window will open (or copy the URL if headless)."
echo ""
cloudflared tunnel login

# Create tunnel
echo ""
read -p "Enter a name for your tunnel (e.g., vibeorg): " TUNNEL_NAME
cloudflared tunnel create "$TUNNEL_NAME"

# Configure tunnel
TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
echo ""
read -p "Enter your domain (e.g., dashboard.yourdomain.com): " DOMAIN

cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:3000
  - service: http_status:404
EOF

# Create DNS record
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"

# Install as service
cloudflared service install

echo ""
echo "=== Cloudflare Tunnel Configured ==="
echo "Your dashboard will be available at: https://$DOMAIN"
echo ""
echo "To set up access policies (require login):"
echo "1. Go to https://one.dash.cloudflare.com"
echo "2. Navigate to Access > Applications"
echo "3. Add an application for $DOMAIN"
echo "4. Set up a policy (e.g., email-based one-time-pin)"
