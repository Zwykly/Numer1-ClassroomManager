# Classroom Manager — VPS deployment

This folder is a **self-contained deployment bundle**. The server only needs
these files (plus a `.env` you create) — not the source repository. All
application images are built by GitHub Actions and pulled from GHCR.

```
deploy/vps/
├── docker-compose.yml        # the whole stack (images only)
├── .env.example              # copy to .env and edit
├── rclone/
│   └── rclone.conf.example   # copy to rclone.conf and edit (offsite backups)
├── update.sh                 # manual "pull latest images and restart"
└── README.md
```

## 1. Get the files onto the server

Pick one:

- **Artifact (recommended):** open the latest successful GitHub Actions run on
  `main`, download the **`vps-bundle`** artifact (a zip), upload it to the VPS
  and unzip it.
- **Copy this folder** (`deploy/vps/`) with `scp`/`rsync`.
- **Sparse clone:** `git clone --filter=blob:none --sparse <repo> && cd <repo> && git sparse-checkout set deploy/vps`

## 2. Prerequisites (Debian)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"   # re-login afterwards
```

## 3. Configure

```bash
cp .env.example .env
# Generate a secret and paste it into BETTER_AUTH_SECRET
openssl rand -base64 32
```

Set `BETTER_AUTH_URL`, `BUN_PUBLIC_API_URL` and `TRUSTED_ORIGINS` to your public
URLs (see the comments in `.env.example`).

### Offsite backups (rclone)

```bash
# On a machine with a browser (or on the VPS) create the remote and bucket:
rclone config
rclone mkdir b2:classroom-backups

# Then copy the generated remote block into the file mounted by the container:
cp rclone/rclone.conf.example rclone/rclone.conf
# edit rclone/rclone.conf and set RCLONE_REMOTE in .env
```

## 4. Start

The images are public on GHCR, so no login is needed. (If you made the packages
private, run `docker login ghcr.io` first.)

```bash
docker compose pull
docker compose up -d
docker compose logs -f backend
```

On startup the backend applies migrations, seeds the first admin (idempotent),
then serves the API.

### Default admin credentials

| Field    | Value                   |
| -------- | ----------------------- |
| Email    | `admin@classroom.local` |
| Password | `Admin1234!`            |

Change these via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` **before the first
start**. The seed only creates the account once; changing `ADMIN_PASSWORD` later
has no effect on an existing account (use the app UI, or wipe the `db_data`
volume to re-seed).

## 5. nginx reverse proxy (host)

The stack binds to `127.0.0.1`, so nginx on the host is the public entry point.

```nginx
# /etc/nginx/sites-available/classroom

server {
    listen 80;
    server_name app.example.com;          # frontend
    location / {
        proxy_pass http://127.0.0.1:3030;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.example.com;          # backend + better-auth
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

```bash
sudo ln -s /etc/nginx/sites-available/classroom /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com -d api.example.com
```

## 6. Data persistence & outages

- PostgreSQL data lives in the named volume **`db_data`** and survives restarts,
  `docker compose down`, reboots and image updates. Never run
  `docker compose down -v` unless you intend to erase all data.
- All services use `restart: unless-stopped`; the database has a healthcheck and
  the backend waits for it before migrating.
- Offsite dumps are kept in the separate **`db_backups`** volume.

## 7. Updates

When a pull request targeting `main` is opened/updated, GitHub Actions builds all
images and pushes them tagged `pr-<number>` and `sha-<commit>`. **When the PR is
merged to `main`, `:latest` is published.** Watchtower on the server polls every
5 minutes and recreates `backend` and `frontend` automatically.

Manual update / rollback:

```bash
bash update.sh                       # pull latest and recreate
# or
docker compose pull && docker compose up -d
```

To pin a specific build, set the image tag in `.env` and recreate:

```env
BACKEND_IMAGE=ghcr.io/zwykly/numer1-classroommanager-backend:sha-<commit>
FRONTEND_IMAGE=ghcr.io/zwykly/numer1-classroommanager-frontend:sha-<commit>
```

## 8. Verify & restore backups

```bash
# Offsite contents
docker compose exec backup rclone ls "$RCLONE_REMOTE" --config /config/rclone.conf

# Local dumps in the db_backups volume
docker compose exec backup ls -lh /backups

# Restore
docker compose exec backup rclone ls "$RCLONE_REMOTE" --config /config/rclone.conf
docker compose exec backup rclone copy \
  "$RCLONE_REMOTE/classroom_<timestamp>.sql.gz" /backups --config /config/rclone.conf
docker compose stop backend frontend
docker compose exec -T backup sh -c \
  'gunzip -c /backups/classroom_<timestamp>.sql.gz | psql "$DATABASE_URL"'
docker compose start backend frontend
```

## Common commands

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f backup
docker compose restart backend
docker compose down
docker compose up -d
```
