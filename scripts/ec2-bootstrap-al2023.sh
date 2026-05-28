#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${1:-/opt/CIA_WEB}"

sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

sudo mkdir -p "$DEPLOY_PATH"
sudo chown -R ec2-user:ec2-user "$DEPLOY_PATH"

echo "Bootstrap complete. Re-login to apply docker group changes."
echo "Then validate with: docker version && (docker compose version || docker-compose version)"
