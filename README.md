# Wordcloud

A real-time, shared word cloud. Anyone visiting the site can add words; everyone
sees the cloud update within a few seconds. Repeated words grow larger.

The stack is fully containerized:

- **client** — Vite + TypeScript single-page app, served in production by nginx
  (which also proxies `/api` to the backend). Rendering uses `wordcloud2.js`,
  with GSAP animating only newly added words.
- **server** — Node.js + Express REST API that stores word counts in Postgres.
- **db** — Postgres with a persistent volume.

```
wordcloud/
├─ docker-compose.yml   # builds + runs client, server, db together
├─ .env.example         # copy to .env to configure ports/credentials
├─ client/              # frontend (Vite, TypeScript)
│  ├─ Dockerfile        # build stage + nginx runtime
│  ├─ nginx.conf        # serves the SPA, proxies /api → server
│  ├─ vite.config.ts    # dev proxy /api → localhost:3000
│  └─ src/
└─ server/              # backend (Express + pg)
   ├─ Dockerfile
   └─ index.js
```

## API

| Method   | Path         | Description                                           |
| -------- | ------------ | ----------------------------------------------------- |
| `GET`    | `/api/words` | Returns all counts: `{ "hello": 3, ... }`             |
| `POST`   | `/api/words` | Body `{ "word": "hello" }`; increments count          |
| `DELETE` | `/api/words` | Admin-only: clears all words (requires `ADMIN_TOKEN`) |
| `GET`    | `/health`    | Liveness check: `{ "ok": true }`                      |

Words are normalized server-side: trimmed, lowercased, max 30 chars, single
word only (no spaces).

### Clearing all words (admin)

`DELETE /api/words` is not used by the frontend — hit it manually. It is
disabled unless `ADMIN_TOKEN` is set, and every request must send a matching
`x-admin-token` header:

```bash
curl -X DELETE -H "x-admin-token: $ADMIN_TOKEN" http://<host>/api/words
```

The cloud empties for everyone within a few seconds.

## Run everything with Docker (recommended)

Requires Docker with the Compose plugin.

```bash
cp .env.example .env     # optional: adjust WEB_PORT and DB credentials
docker compose up --build
```

Open <http://localhost:8080> (or whatever `WEB_PORT` you set). Stop with
`Ctrl+C`; add `-d` to run detached.

Reset the database (removes the `pgdata` volume):

```bash
docker compose down -v
```

## Local development (hot reload)

Run each step in its own terminal.

```bash
# 1. Start just the database
docker compose up -d db

# 2. Backend on :3000
cd server
npm install
DATABASE_URL=postgres://wordcloud:wordcloud@localhost:5432/wordcloud npm start

# 3. Frontend dev server (proxies /api → :3000)
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>).

## Configuration

Compose reads these from `.env` (see [.env.example](.env.example)):

| Variable            | Default     | Purpose                                      |
| ------------------- | ----------- | -------------------------------------------- |
| `WEB_PORT`          | `8080`      | Public port the site is served on            |
| `POSTGRES_USER`     | `wordcloud` | Database user                                |
| `POSTGRES_PASSWORD` | `wordcloud` | Database password (change in production)     |
| `POSTGRES_DB`       | `wordcloud` | Database name                                |
| `ADMIN_TOKEN`       | _(empty)_   | Secret for `DELETE /api/words`; empty = off  |

The backend connects to Postgres using discrete `PGHOST`/`PGUSER`/`PGPASSWORD`/
`PGDATABASE` variables (set by Compose from the values above), so passwords with
special characters like `@ # $` work as-is — no URL-encoding needed. Postgres is
bound to `127.0.0.1:5432` so it is never exposed to the public network.

## Deploy on a VM

The app works on any VM IP or domain with no code changes (the frontend uses
relative `/api` calls).

```bash
# 1. Install Docker + Compose
curl -fsSL https://get.docker.com | sh

# 2. Get the code
git clone <your-repo-url> wordcloud && cd wordcloud

# 3. Configure: set WEB_PORT=80 and a strong POSTGRES_PASSWORD
cp .env.example .env
nano .env

# 4. Build and run in the background
docker compose up --build -d
```

Open `http://<your-vm-ip>`.

Checklist:

- Open inbound port `80` (and `443` for HTTPS) in the VM firewall / cloud
  security group.
- For HTTPS, put a reverse proxy (e.g. Caddy) in front to terminate TLS and
  forward to `WEB_PORT`.
- Redeploy after changes: `git pull && docker compose up --build -d`. Data
  persists in the `pgdata` volume.
