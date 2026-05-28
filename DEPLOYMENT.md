# CI/CD Deployment To AWS EC2

This repository includes automatic deployment on every push to `main` or `master`.

## Workflow

Workflow file:
- `.github/workflows/deploy-ec2.yml`

Trigger:
- Push to `main`
- Push to `master`
- Manual run from Actions tab

## Required GitHub Secrets

Add these in repository settings:
- `EC2_HOST`: Public IP or DNS of your EC2 instance
- `EC2_USER`: SSH user (for Amazon Linux 2023 use `ec2-user`)
- `EC2_SSH_KEY`: Private key content for the EC2 key pair
- `EC2_DEPLOY_PATH`: Absolute path on EC2, for example `/opt/CIA_WEB`

Optional:
- `EC2_PORT`: SSH port, default `22`
- `REACT_APP_API_URL`: Frontend API URL at build time, for example `YOUR_EC2_PUBLIC_IP:3000`
- `API_BIND_IP`: API host bind, default `0.0.0.0`
- `FRONT_BIND_IP`: Frontend host bind, default `0.0.0.0`

## EC2 Prerequisites

For your instance type (Amazon Linux 2023):

One-time bootstrap from your machine:

```bash
chmod 400 /home/hadeed/Downloads/CIA_KEY.pem
ssh -i /home/hadeed/Downloads/CIA_KEY.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

Then on EC2:

```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
sudo mkdir -p /opt/CIA_WEB
sudo chown -R ec2-user:ec2-user /opt/CIA_WEB
```

Reconnect once to apply docker group membership:

```bash
exit
ssh -i /home/hadeed/Downloads/CIA_KEY.pem ec2-user@YOUR_EC2_PUBLIC_IP
docker version
docker compose version || docker-compose version
```

Install on EC2:
- Docker
- Docker Compose plugin or docker-compose binary

Create deployment directory:
- `/opt/CIA_WEB`

Allow inbound security group ports as needed:
- `22` for SSH
- `8080` for frontend
- `3000` for backend API

## Current Instance (as of 2026-05-29)

- Instance ID: `i-0194cd90760dd5d1d`
- Public IP: `52.47.190.239`
- Region: `eu-west-3`
- Key pair: `CIA_KEY` (`/home/hadeed/Downloads/CIA_KEY.pem`)

## Suggested Secret Values For Your Current Setup

- `EC2_HOST`: `52.47.190.239`
- `EC2_USER`: `ec2-user`
- `EC2_PORT`: `22`
- `EC2_DEPLOY_PATH`: `/opt/CIA_WEB`
- `API_BIND_IP`: `0.0.0.0`
- `FRONT_BIND_IP`: `0.0.0.0`
- `REACT_APP_API_URL`: `http://52.47.190.239:3000`

Important:
- Do not set `EC2_SSH_KEY` to the file path. Paste the full key file content from `/home/hadeed/Downloads/CIA_KEY.pem` into the secret value.

## Local Default Security

Compose files default to localhost-only binds for local development:
- Backend: `${API_BIND_IP:-127.0.0.1}:3000:3000`
- Frontend: `${FRONT_BIND_IP:-127.0.0.1}:8080:80`

In CI deploy, those default to `0.0.0.0` unless you override with secrets.
