# Deploying denoise-docs

Internal guide for developers maintaining this documentation site. End users of
denoise do not deploy the app (it is hosted as SaaS).

Production runs on the **washington** Raspberry Pi (Tailscale) on port **4321**.
A Cloudflare Tunnel on the Pi forwards public traffic to `localhost:4321` —
deploys do not change tunnel configuration as long as that port stays mapped.

## Local Docker

Build and run with Docker Compose from this directory:

```bash
npm run build
docker compose up -d
```

Rebuild after changes:

```bash
npm run build
docker compose up -d --force-recreate
```

## Pi deployment (washington)

All developers deploy to the **same** stack:

| Setting          | Default                   |
| ---------------- | ------------------------- |
| SSH host         | `denoise-docs@washington` |
| Deploy directory | `/opt/denoise-docs`       |
| Image            | `denoise-docs:latest`     |
| Host port        | `4321`                    |

Each developer uses their **personal SSH public key** (added to
`denoise-docs@washington`), not a shared private key. The deploy script
cross-compiles the image on your laptop, transfers it over SSH, and runs
`docker compose up` on the Pi.

### Developer setup

1. **Tailscale** — ensure you can reach `washington`.
2. **SSH access** — see [Request deploy access](#request-deploy-access) below.
3. **Docker buildx** — required locally for `linux/arm64` cross-builds.
4. Confirm SSH, then deploy:

```bash
make check_deploy
make deploy
```

`make check_deploy` only tests SSH; it does not build or change anything on the
Pi. If you run `make deploy` without access, the script fails on the first SSH
connection (before Astro/Docker run) with `Permission denied (publickey)` and
production stays as-is.

### Request deploy access

Send a Pi admin your **public** key (never the private key):

```bash
cat ~/.ssh/id_ed25519.pub
# or: ssh-keygen -t ed25519 -C "you@company"
```

Admin on **washington** (append only — do not replace the whole file):

```bash
echo 'ssh-ed25519 AAAA... you@laptop' | sudo tee -a /home/denoise-docs/.ssh/authorized_keys
sudo chown denoise-docs:denoise-docs /home/denoise-docs/.ssh/authorized_keys
sudo chmod 600 /home/denoise-docs/.ssh/authorized_keys
```

After the admin confirms, run `make check_deploy`. When that succeeds, run
`make deploy`.

### Overrides

```bash
DEPLOY_HOST=user@hostname make deploy
DEPLOY_HOST=user@hostname DEPLOY_DIR=/custom/path make deploy
./scripts/deploy.sh user@hostname /custom/path
```

### What `make deploy` does

1. Open SSH to the Pi (fails fast if unauthorized)
2. Build the Astro static site (`make build`)
3. Cross-compile the Docker image for `linux/arm64`
4. `docker save | ssh | docker load` to the Pi
5. Copy `compose.yml` to the deploy directory
6. `COMPOSE_PROJECT_NAME=denoise-docs docker compose up -d --force-recreate`

Production **`.env` lives on the Pi** at `/opt/denoise-docs/.env`. The deploy
script does not copy `.env` from your laptop (avoids accidental overwrites).

### One-time Pi migration (admin)

If production previously ran under a personal account (e.g.
`/home/nick/denoise-docs`), run once on washington before the first shared
deploy:

```bash
# Create shared deploy user
sudo useradd -m -s /bin/bash denoise-docs 2>/dev/null || true
sudo usermod -aG docker denoise-docs
sudo mkdir -p /opt/denoise-docs
sudo chown denoise-docs:denoise-docs /opt/denoise-docs

# Authorize developer SSH keys
sudo mkdir -p /home/denoise-docs/.ssh
sudo chmod 700 /home/denoise-docs/.ssh
# Append each developer public key:
# sudo tee -a /home/denoise-docs/.ssh/authorized_keys
sudo chown -R denoise-docs:denoise-docs /home/denoise-docs/.ssh
sudo chmod 600 /home/denoise-docs/.ssh/authorized_keys

# Migrate prod .env from the old deploy location
sudo cp /home/nick/denoise-docs/.env /opt/denoise-docs/.env
sudo chown denoise-docs:denoise-docs /opt/denoise-docs/.env

# Stop the old stack to free port 4321
cd /home/nick/denoise-docs && docker compose down
```

After migration, any authorized developer runs `make deploy` from their machine.
Verify on the Pi:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4321
```

Then confirm the public Cloudflare URL still loads.

## Deno Deploy (cloud)

For cloud hosting via Deno Deploy, see
[README.md](README.md#deploy-to-deno-deploy).
