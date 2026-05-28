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
- `EC2_USER`: SSH user (for Ubuntu AMI usually `ubuntu`)
- `EC2_SSH_KEY`: Private key content for the EC2 key pair
- `EC2_DEPLOY_PATH`: Absolute path on EC2, for example `/opt/CIA_WEB`

Optional:
- `EC2_PORT`: SSH port, default `22`
- `REACT_APP_API_URL`: Frontend API URL at build time, for example `YOUR_EC2_PUBLIC_IP:3000`
- `API_BIND_IP`: API host bind, default `0.0.0.0`
- `FRONT_BIND_IP`: Frontend host bind, default `0.0.0.0`

## EC2 Prerequisites

Install on EC2:
- Docker
- Docker Compose plugin or docker-compose binary

Create deployment directory:
- `/opt/CIA_WEB`

Allow inbound security group ports as needed:
- `22` for SSH
- `8080` for frontend
- `3000` for backend API

## Local Default Security

Compose files default to localhost-only binds for local development:
- Backend: `${API_BIND_IP:-127.0.0.1}:3000:3000`
- Frontend: `${FRONT_BIND_IP:-127.0.0.1}:8080:80`

In CI deploy, those default to `0.0.0.0` unless you override with secrets.
