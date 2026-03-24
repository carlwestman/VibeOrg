#!/bin/bash
# VibeOrg Tailscale VPN Setup
# Keeps your dashboard on a private VPN — most secure option

set -e

echo "=== Tailscale VPN Setup ==="

# Install Tailscale
echo "Installing Tailscale..."
curl -fsSL https://tailscale.com/install.sh | sh

# Start Tailscale
echo ""
echo "Starting Tailscale — you'll need to authenticate."
echo "Follow the URL that appears to connect this server to your Tailscale network."
echo ""
tailscale up

# Show the Tailscale IP
echo ""
echo "=== Tailscale Configured ==="
TAILSCALE_IP=$(tailscale ip -4)
echo "Your server's Tailscale IP: $TAILSCALE_IP"
echo "Dashboard URL: http://$TAILSCALE_IP:3000"
echo ""
echo "Make sure Tailscale is installed on your devices too:"
echo "  - Desktop: https://tailscale.com/download"
echo "  - Mobile: Search 'Tailscale' in your app store"
echo ""
echo "Once connected, access your dashboard at: http://$TAILSCALE_IP:3000"
