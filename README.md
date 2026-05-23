Markdown
<div align="center">

# 💬 Tasca Digital

**_Aqui manda-se a posta e bate-se o copo. (Here we drop takes and raise glasses)._**

An internal social network themed as a traditional Portuguese "Tasca" (tavern).

[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📜 Menu (Table of Contents)

- [Stack](#stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start (Docker)](#quick-start-docker)
- [Local Development](#local-development)
- [API](#api)
- [Real-Time Events (WebSocket)](#real-time-events-websocket)
- [Troubleshooting](#troubleshooting)
- [Notes](#notes)
- [License](#license)

---

## 🛠️ Stack

| Layer | Technologies |
|---|---|
| **Backend** | Go 1.26 · [Gin](https://github.com/gin-gonic/gin) · [gorilla/websocket](https://github.com/gorilla/websocket) · JWT (HttpOnly cookie) · bcrypt |
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · date-fns |
| **Database** | PostgreSQL 15 |
| **Infra** | Docker · Docker Compose v2 |

---

## ✨ Features

- **Postas (Feed)** — Create, delete (author only), react, and comment on posts.
- **Notice Board (Events)** — Organize meetups with RSVP (Going / Leaving) and event comments.
- **The Backroom (DMs)** — Real-time private messaging with dual-sided soft-delete (conversations are deleted only for the user who cleared them).
- **Counter Alerts (Toasts)** — Instant WebSocket notifications for new reactions or comments, without accumulating history.
- **Patron's Tab (Profile)** — Update name, profession, avatar color, and password.
- **Public Showcase** — Blurred preview of the latest posts for unauthenticated visitors.

---

## 🗂️ Project Structure

```text
.
├── backend/                 # Go API
│   ├── cmd/api/             # Entry point (main.go)
│   └── internal/
│       ├── auth/            # Login, signup, JWT, middleware
│       ├── chat/            # Direct Messages (DM)
│       ├── database/        # Connection and migrations
│       ├── event/           # Events, RSVPs, comments
│       ├── id/              # Random ID generation
│       ├── middleware/      # CORS
│       ├── post/            # Posts, comments, reactions
│       ├── routes/          # Route registration
│       ├── user/            # Profile, password hashing
│       └── ws/              # WebSocket Hub
├── frontend/                # Next.js App
│   └── src/
│       ├── app/             # Pages (App Router)
│       │   ├── components/  # Shared components
│       │   ├── dashboard/   # Feed (The Counter)
│       │   ├── events/      # Notice board
│       │   ├── messages/    # The Backroom (DMs)
│       │   ├── settings/    # Patron's Tab (Settings)
│       │   ├── login/
│       │   └── signup/
│       └── lib/             # API clients and auth
├── docker-compose.yml
└── .env.example
```

---

## Quick Start (Docker)

> **Prerequisites:** Docker Engine + Docker Compose v2 (plugin).  
> The correct command is `docker compose` (with a space), not `docker-compose`.

### Prerequisites by operating system

**macOS / Windows**  
Install [Docker Desktop](https://www.docker.com/products/docker-desktop/). Compose v2 is already included.

**Linux**
```bash
# Install Docker Engine + Compose plugin
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2

# Add your user to the docker group (avoids using sudo)
sudo usermod -aG docker $USER
```

Log out and log back in (or reboot) so the group is applied to all sessions.

---

```bash
# 1. Clone the repository
git clone https://github.com/thaisliira/Tasca-Digital.git
cd Tasca-Digital

# 2. Copy the environment example and adjust JWT_SECRET
cp .env.example .env

# 3. Start the three services (db, backend, frontend)
docker compose up --build
```

Access:

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | <http://localhost:3000>      |
| Backend   | <http://localhost:8080>      |
| Postgres  | `localhost:5433` (host) → `5432` (container) |

To stop:

```bash
docker compose down       # keeps database data in the volume
docker compose down -v    # also removes the Postgres volume
```

---

## Local Development

### Backend

```bash
cd backend

# Start only the Postgres service from compose, or use a local Postgres:
# docker compose up db

export DB_USER=user DB_PASSWORD=password DB_NAME=notification_db
export DB_HOST=localhost DB_PORT=5433
export JWT_SECRET=any_large_secret
export APP_ENV=development

go mod download
go run ./cmd/api
```

API available at <http://localhost:8080>.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at <http://localhost:3000>. The client points to `http://localhost:8080` when running in the browser.

---

## Real-Time Events (WebSocket)

The server emits messages in the format `{ type, payload }`:

| Event               | Trigger                                               | Scope                                |
|---------------------|-------------------------------------------------------|--------------------------------------|
| `post.created`      | A new post is published                               | All connected patrons                |
| `post.deleted`      | A post is removed by the author                       | All connected patrons                |
| `reaction.updated`  | A reaction is added / removed                         | All connected patrons                |
| `comment.created`   | A new comment is added to a post                      | All connected patrons                |
| `dm.created`        | A direct message is sent                              | Sender and recipient only            |

---

## Troubleshooting

### `permission denied while trying to connect to the Docker API` (Linux)

Your user is not part of the `docker` group:

```bash
sudo usermod -aG docker $USER
```

Log out and log back in (or reboot). `newgrp docker` only applies to the current session — it does not fix new terminals.

### `ModuleNotFoundError: No module named 'distutils'`

You are using legacy `docker-compose` (v1, Python). Use the v2 plugin instead:

```bash
docker compose up --build   # with a space, not a hyphen
```

### `error getting credentials - exec: "docker-credential-desktop": executable file not found`

Your `~/.docker/config.json` file contains a Docker Desktop reference that does not exist on Linux. Remove the `credsStore` line:

```bash
# Open the file and remove the line "credsStore": "desktop"
nano ~/.docker/config.json
```

The file should look like this:

```json
{
  "auths": {},
  "currentContext": "default"
}
```

### `lookup db on 127.0.0.11:53: server misbehaving` (backend does not start)

There are orphaned containers or networks from a previous session. Perform a full cleanup and start again:

```bash
docker compose down
docker network prune -f
docker compose up
```

### `The "JWT_SECRET" variable is not set`

The `.env` file in the project root does not have `JWT_SECRET` defined. Check with:

```bash
grep JWT_SECRET .env
```

The correct format is:

```env
JWT_SECRET=value_without_spaces
```

(no spaces around `=`).

---

## Notes

- The backend runs `DROP TABLE` on some tables during startup to guarantee the expected schema. **Do not use this in production without replacing it with proper migrations** (Goose, Atlas, golang-migrate, etc.).
- The Postgres credentials inside `docker-compose.yml` are development values. In production, move them to environment variables or secrets.
- DM *soft-delete* is per-user: when you delete a conversation, it only disappears from your history — the other user still sees it until they also delete it.
- The JWT cookie is `HttpOnly` and only uses `Secure` when `APP_ENV=production`.

## License

[MIT](LICENSE)
