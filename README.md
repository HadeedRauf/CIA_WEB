# CIA Web — Inventory Management System

A full-stack inventory management web application with a Node.js/Express backend and React frontend, fully containerised with Docker and deployed to AWS EC2 via GitHub Actions CI/CD.

## Deployed Application

| Service | URL |
|---------|-----|
| Frontend | http://52.47.190.239:8080 |
| Backend API | http://52.47.190.239:3000 |

Default admin credentials: `admin` / `admin`

---

## Stack

- **Backend**: Node.js, Express, TypeScript, TypeORM, MySQL 5.7
- **Frontend**: React, TypeScript, Redux, Nginx
- **Infrastructure**: Docker, Docker Compose, AWS EC2 (Amazon Linux 2023, eu-west-3)
- **CI/CD**: GitHub Actions

---

## Role-Based Access Control

The API enforces two roles: `ADMIN` and `USER`. Every protected route requires a valid JWT (checked by `checkJwt` middleware) and optionally a role check (`checkRole`).

### Admin (`ADMIN`)
Admins have full access to everything:

| Resource | Actions |
|----------|---------|
| Products | View all, view stats, view one, **create, edit, delete** |
| Orders | View all, view stats, view one, **edit, delete** |
| Users | View all, view one, **create, edit, delete** |
| Auth | Login, register, view own profile, change password |

### User (`USER`)
Regular users have limited access:

| Resource | Actions |
|----------|---------|
| Products | View all, view stats, view one (read-only) |
| Orders | **Place a new order** only (cannot view others' orders) |
| Auth | Login, register, view own profile, change password |

> Users cannot access order history, manage products, or manage other users. Any attempt returns `401 Unauthorized`.

---

## Security Hardening

### Logging — No Sensitive Data Exposed
- JWT tokens are never logged
- Passwords are never logged
- Authorization headers are stripped from logs
- Morgan uses a custom `safe-body` token that redacts any field matching: `password`, `token`, `auth`, `authorization`, `jwt`
- All sensitive fields are recursively sanitised before being written to stdout
- A single combined log format is used — no separate token/auth header logging lines

### Network — Minimal Port Exposure
- Locally, both services bind to `127.0.0.1` only (not exposed on the network interface)
- On EC2, bind address is controlled via environment variables (`API_BIND_IP`, `FRONT_BIND_IP`) injected at deploy time
- The MySQL database container has **no published host ports** — it is only reachable inside the Docker bridge network


### CI/CD — All Secrets in GitHub Secrets
No credentials or sensitive values are stored in the codebase. All are injected at deploy time via GitHub Actions secrets:

| Secret | Purpose |
|--------|---------|
| `EC2_HOST` | EC2 public IP |
| `EC2_USER` | SSH user (`ec2-user`) |
| `EC2_SSH_KEY` | Private SSH key for EC2 access |
| `EC2_PORT` | SSH port (22) |
| `EC2_DEPLOY_PATH` | Deploy directory on EC2 |
| `REACT_APP_API_URL` | Backend API URL baked into the React build |
| `API_BIND_IP` | Host bind address for the backend |
| `FRONT_BIND_IP` | Host bind address for the frontend |

---

## CI/CD Pipeline

Defined in `.github/workflows/deploy-ec2.yml`. Triggers automatically on every push to `main`.

**What the pipeline does:**
1. SSHs into the EC2 instance
2. Clones or pulls the latest code from this repository
3. Sets up 2 GB swap if not present (handles low-RAM builds on t3.micro)
4. Detects which service changed (`back_student/` or `front_student/`) and only rebuilds that service
5. Runs `docker compose up -d --build` for changed services
6. Waits up to 2 minutes with retry for the backend to be ready (MySQL init takes time on first run)
7. Health-checks both services (`localhost:3000/product` and `localhost:8080`)
8. Saves the deployed SHA to avoid unnecessary rebuilds on the next run

---

## Bugs Fixed

| Bug | Fix |
|-----|-----|
| JWT and passwords appearing in server logs | Added `sanitizeLogBody()` with recursive redaction; removed all header/auth log tokens from Morgan |
| Backend Docker container started without running migrations | Fixed `Dockerfile` — replaced two `CMD` lines (only the last one runs) with a single `CMD` that runs `schema:sync → migration:run → start` |
| Frontend calling `http://http://...` (double protocol) | The code prepends `http://` to `REACT_APP_API_URL`; corrected the secret to contain only the host and port without the protocol |
| MySQL database port exposed on host | Removed `ports` section from the `db` service in `docker-compose.yml` |
| All services binding to `0.0.0.0` in local dev | Changed to `127.0.0.1` default bind with environment variable override for production |

---

## Repository Structure

```
CIA_WEB/
├── back_student/          # Express + TypeORM backend
│   ├── src/
│   ├── Dockerfile
│   └── docker-compose.yml
├── front_student/         # React frontend
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── docker-compose.yml
└── .github/
    └── workflows/
        └── deploy-ec2.yml # CI/CD pipeline
```
