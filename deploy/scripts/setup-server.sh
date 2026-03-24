#!/bin/bash
# VibeOrg Server Setup Script
# Run on a fresh Ubuntu 22.04+ VPS

set -e

echo "=== VibeOrg Server Setup ==="

# Update system
echo "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install Node.js 18+
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Git
echo "Installing Git..."
apt-get install -y git

# Install Docker
echo "Installing Docker..."
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
echo "Installing Docker Compose..."
apt-get install -y docker-compose-plugin

# Verify installations
echo ""
echo "=== Installation Complete ==="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Git: $(git --version)"
echo "Docker: $(docker --version)"
echo ""
echo "Next steps:"
echo "1. Clone your VibeOrg project"
echo "2. Copy your .env file"
echo "3. Install Claude Code: npm install -g @anthropic-ai/claude-code"
echo "4. Run: cd deploy && docker-compose up -d"
