# Classroom Manager

Classroom Manager is an easy to use system designed to manage classroom reservations, students, groups, and teachers. It allows teachers to keep track of physical classrooms, online sessions, and manage role-based access to this data.

## Tech Stack

- **[Bun](https://bun.sh/)**: A fast all-in-one JavaScript runtime, bundler, and package manager.
- **[ElysiaJS](https://elysiajs.com/)**: An ergonomic, highly performant web framework specifically built for Bun.
- **[Drizzle ORM](https://orm.drizzle.team/)**: A headless TypeScript ORM that brings maximum type safety to SQL databases and performs schema generation.
- **[PostgreSQL](https://www.postgresql.org/)**: The robust relational database storing all the data.
- **[Better Auth](https://better-auth.com/)**: A modern, comprehensive authentication library handling users, sessions, and database integrations.
- **React 19 + React Router + Tailwind CSS 4**: The frontend, also served by the Bun runtime.

## Project Structure

- **`backend/app/`**: The Bun/Elysia API.
  - **`src/db/`**: Database initialization (`db.ts`) and schema definitions (`schema.ts`).
  - **`src/models/`**: Typebox validation schemas for requests and responses.
  - **`src/controllers/`**: Core business logic and request handling.
  - **`src/routes/`**: Elysia route definitions and middleware/guards.
  - **`src/auth/`**: Better Auth configuration and authorization macros.
  - **`drizzle/`**: Generated SQL migrations.
  - **`seed-admin.ts`**: Idempotent seed for the first administrator account.
- **`frontend/`**: The React single-page application.
- **`docker-compose.yml`**: Full production stack (database, backend, frontend, backups, auto-updates).
- **`deploy/`**: Operations helpers (offsite backup script, rclone example, update script).

---

# Docker Deployment (Debian VPS)

The entire stack — PostgreSQL, the backend API, the frontend, the 24h offsite
backup sidecar and Watchtower auto-updates — runs from a **self-contained
deployment bundle** in [`deploy/vps/`](./deploy/vps). The VPS does **not** need
the source repository: all images are built by GitHub Actions and pulled from
GitHub Container Registry (GHCR). See
[`deploy/vps/README.md`](./deploy/vps/README.md) for the short version.

The root [`docker-compose.yml`](./docker-compose.yml) is for building/running
from source during development.

## Architecture

| Service     | Port (host)              | Description                                        |
| ----------- | ------------------------ | -------------------------------------------------- |
| `frontend`  | `127.0.0.1:3030`         | React SPA served by Bun                            |
| `backend`   | `127.0.0.1:3000`         | Elysia API + Better Auth (`/api/auth/*`)           |
| `db`        | not published            | PostgreSQL 16 with a persistent named volume       |
| `backup`    | none                     | `pg_dump` + rclone offsite upload every 24h        |
| `watchtower`| none                     | Polls GHCR and auto-updates backend/frontend       |

Only the frontend and backend are published, and by default they bind to
`127.0.0.1` so that **your existing host nginx** is the only public entry point.

## 1. Prerequisites (Debian)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg git

# Docker official repository
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"   # re-login afterwards
```

Optional but recommended firewall (nginx is the only public service):

```bash
sudo apt-get install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 2. Get the deployment files and configure

The VPS only needs the files in [`deploy/vps/`](./deploy/vps). Copy that folder
to the server (or download the **`vps-bundle`** artifact from the latest
successful Actions run on `main`), then:

```bash
cd deploy/vps
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
POSTGRES_PASSWORD=<a long random password>
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://api.example.com
TRUSTED_ORIGINS=https://app.example.com
BUN_PUBLIC_API_URL=https://api.example.com
RCLONE_REMOTE=b2:classroom-backups
```

- `TRUSTED_ORIGINS` is a comma separated allow-list of frontend origins (CORS +
  Better Auth). Keep `http://localhost:3030` in the list if you also want to
  test locally.
- `BUN_PUBLIC_API_URL` is baked into the browser bundle at runtime; it must be
  the public HTTPS URL of the backend.
- If you are testing without a domain/nginx, use
  `BETTER_AUTH_URL=http://<vps-ip>:3000`, `BUN_PUBLIC_API_URL=http://<vps-ip>:3000`,
  `TRUSTED_ORIGINS=http://<vps-ip>:3030` and set `BIND_ADDR=0.0.0.0`.

## 3. First deploy

Images are pulled from GHCR (public packages), so no build or registry login is
needed on the server:

```bash
docker compose pull
docker compose up -d
docker compose logs -f backend
```

To build the images locally from source instead, clone the repo and use the root
compose file, which contains the build contexts:

```bash
git clone https://github.com/Zwykly/Numer1-ClassroomManager.git
cd Numer1-ClassroomManager
cp .env.example .env
docker compose up -d --build
```

On startup the backend automatically:

1. applies all Drizzle migrations,
2. seeds the first administrator account (idempotent — safe on every restart),
3. starts the API.

### Default admin credentials

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@classroom.local` |
| Password | `Admin1234!`           |

> Change these **before the first start** through `ADMIN_EMAIL` / `ADMIN_PASSWORD`
> in `.env`. The seed only creates the account once; changing `ADMIN_PASSWORD`
> later has no effect on an existing account — use the app UI to change the
> password, or remove the database volume to re-seed from scratch.

## 4. nginx reverse proxy + HTTPS

Two server blocks are needed: the SPA and the API. Replace `app.example.com`
and `api.example.com` with your DNS names.

```nginx
# /etc/nginx/sites-available/classroom

# Frontend (React SPA)
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:3030;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API + Better Auth
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then enable the site and request certificates:

```bash
sudo ln -s /etc/nginx/sites-available/classroom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com -d api.example.com
```

Certbot rewrites the blocks for TLS and sets up automatic renewal.

## 5. Data persistence & outage safety

- PostgreSQL data lives in the named Docker volume **`db_data`**
  (`/var/lib/postgresql/data`). It survives container restarts, `docker compose
  down`, host reboots and image updates. It is only removed by
  `docker compose down -v` — do **not** use `-v` unless you intend to wipe data.
- Every service uses `restart: unless-stopped`, so containers come back
  automatically after a crash or reboot.
- The database has a `pg_isready` healthcheck; the backend waits for it before
  migrating, which prevents startup race conditions after an outage.
- Backups are stored in the separate **`db_backups`** volume and shipped
  offsite, so data can be recovered even if the whole server is lost.

## 6. Updating when a new version lands on `main`

The workflow in
[`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml):

- **On a pull request into `main`:** builds all three images (`backend`,
  `frontend`, `backup`) and pushes them tagged `pr-<number>` and `sha-<commit>`.
  This validates the PR and makes the exact build available for testing.
- **When the PR is merged to `main`:** builds again and publishes **`:latest`**.

**Watchtower** on the VPS polls every 5 minutes and recreates `backend` and
`frontend` when `:latest` changes. The database is never auto-updated; schema
migrations run inside the backend entrypoint on restart. (`backup` is
intentionally not auto-updated so an in-progress dump is never interrupted.)

One-time step: make the three GHCR packages public (GitHub → your profile →
**Packages** → package → *Package settings* → *Change visibility*), so the VPS
can pull without credentials. If you prefer private packages, run
`docker login ghcr.io` on the VPS and mount the Docker config into Watchtower
(`-v $HOME/.docker/config.json:/config.json`).

After the first deploy, updates are fully automatic. To force one manually (from
inside `deploy/vps` on the VPS):

```bash
# Option A - helper script
bash update.sh

# Option B - images only
docker compose pull
docker compose up -d
```

Branches from forks can't push to GHCR with the default token, so their PRs only
build (no images are published) — which is expected.

To roll back, pin a built commit tag in `.env` and recreate:

```env
BACKEND_IMAGE=ghcr.io/zwykly/numer1-classroommanager-backend:sha-<commit>
FRONTEND_IMAGE=ghcr.io/zwykly/numer1-classroommanager-frontend:sha-<commit>
BACKUP_IMAGE=ghcr.io/zwykly/numer1-classroommanager-backup:sha-<commit>
```

## 7. Offsite database backups every 24 hours

The `backup` service dumps PostgreSQL with `pg_dump`, gzips it, uploads it with
rclone to any remote (Backblaze B2, S3, Google Drive, …), prunes old dumps and
sleeps 24h. It takes the first backup immediately on start.

### 7.1 Create the rclone remote

Run this on your **local machine** (it opens a browser/OAuth flow) or on the
VPS, then copy the resulting config to the server:

```bash
rclone config            # create a remote, e.g. "b2" or "s3"
rclone mkdir b2:classroom-backups
```

Copy the config into the `rclone/` folder that the backup container mounts:

```bash
cp rclone/rclone.conf.example rclone/rclone.conf
# paste the remote block that `rclone config` produced
```

Set the destination in `.env`:

```env
RCLONE_REMOTE=b2:classroom-backups
BACKUP_INTERVAL_SECONDS=86400   # 24h
BACKUP_RETENTION_DAYS=14        # keep 14 days offsite + locally
```

Restart the sidecar:

```bash
docker compose up -d backup
docker compose logs -f backup
```

`rclone/rclone.conf` is gitignored and mounted read-only into the container, so
credentials never end up in the image.

### 7.2 Verify backups

```bash
# Offsite contents
docker compose exec backup rclone ls "$RCLONE_REMOTE" --config /config/rclone.conf

# Local dumps kept in the db_backups volume
docker compose exec backup ls -lh /backups
```

### 7.3 Restore a backup

```bash
# 1. List the dumps available offsite
docker compose exec backup rclone ls "$RCLONE_REMOTE" --config /config/rclone.conf

# 2. Download the one you need into the container's /backups volume
docker compose exec backup rclone copy \
  "$RCLONE_REMOTE/classroom_<timestamp>.sql.gz" /backups --config /config/rclone.conf

# 3. Stop the app so nothing writes while restoring
docker compose stop backend frontend

# 4. Restore into the database
docker compose exec -T backup sh -c \
  'gunzip -c /backups/classroom_<timestamp>.sql.gz | psql "$DATABASE_URL"'

# 5. Start the app again
docker compose start backend frontend
```

## 8. Common operations

```bash
docker compose ps                  # service status
docker compose logs -f backend     # follow backend logs
docker compose logs -f backup      # follow backup logs
docker compose restart backend     # restart a single service
docker compose down                # stop everything (data + backups preserved)
docker compose up -d               # start everything again
docker compose exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"   # DB shell
```

---

# Local Development (without Docker)

## Backend

1. **Install Bun** — see the [Bun installation docs](https://bun.sh/docs/installation).
2. **Install dependencies:**
   ```bash
   cd backend/app
   bun install
   ```
3. **Environment:** create `backend/app/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/classroom_manager"
   BETTER_AUTH_SECRET="your_random_secret_string"
   BETTER_AUTH_URL="http://localhost:3000"
   ```
4. **Migrations:**
   ```bash
   bun drizzle-kit generate
   bun drizzle-kit migrate
   ```
5. **Seed the admin (optional):**
   ```bash
   bun run seed:admin
   ```
6. **Run:**
   ```bash
   bun run dev
   ```

## Frontend

```bash
cd frontend
bun install
bun run dev      # http://localhost:3030
```

Set `BUN_PUBLIC_API_URL` (see `frontend/.env.local`) only when the API is not
reachable at `http://<current-host>:3000`.
