# Deploying pipeline-alert as a systemd daemon (Ubuntu 24.04, `ubuntu` user)

The app is a long-running poller (`src/index.ts`). It already traps `SIGTERM`
and shuts down cleanly, so it behaves well under systemd.

## 1. Install Node.js via NVM (on the EC2 instance)

`better-sqlite3` is a native module — `build-essential` + `python3` let it
compile if no prebuilt binary is available for your arch.

```bash
sudo apt-get update
sudo apt-get install -y build-essential python3 git

# Install nvm (check github.com/nvm-sh/nvm for the latest version tag)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh

nvm install 22
nvm alias default 22

node -v                       # expect v22.x
nvm which default             # <-- COPY THIS ABSOLUTE PATH
```

### Wire the nvm node path into the unit file

systemd does **not** source your shell profile, so it can't see `nvm` or the
`node` on your interactive PATH. Take the path from `nvm which default`
(e.g. `/home/ubuntu/.nvm/versions/node/v22.11.0/bin/node`) and put it into
`deploy/pipeline-alert.service` in **two** places — `ExecStart` and the bin dir
in `Environment=PATH`:

```ini
Environment=PATH=/home/ubuntu/.nvm/versions/node/v22.11.0/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/home/ubuntu/.nvm/versions/node/v22.11.0/bin/node dist/src/index.js
```

> Note: this pins a specific node version. After an `nvm install <newer>`, update
> both paths and run `sudo systemctl daemon-reload && sudo systemctl restart pipeline-alert`.

## 2. Get the code

```bash
cd /home/ubuntu
git clone <YOUR_REPO_URL> pipeline-alert
cd pipeline-alert
npm ci
```

## 3. Create `.env`

`.env` is gitignored, so create it on the box. Required keys (see `.env.example`
and `src/config/index.ts` for validation rules):

```bash
cp .env.example .env
nano .env
```

Required: `BB_API_TOKEN`, `BB_BOT_EMAIL`, `BB_WORKSPACE`, `BB_REPO`,
`TELEGRAM_BOT_TOKEN`, `LLM_DEFAULT_MODEL`.
Conditionally required by `LLM_PROVIDER`:
- `bedrock` (default) → `AWS_BEARER_TOKEN_BEDROCK`, `AWS_REGION`
- `openai` → `OPENAI_API_TOKEN`

The config schema calls `process.exit(1)` on missing/invalid env, so the service
will crash-loop until `.env` is correct — check `journalctl` if it won't start.

## 4. Build, and confirm the entry path

```bash
npm run build
find dist -name index.js          # note the real path
```

With the current `tsconfig.json` (`rootDir: "./"`) the entry is
**`dist/src/index.js`** — which is what the unit file uses. If `find` shows a
different path, edit `ExecStart` accordingly.

## 5. Install and start the service

```bash
sudo cp deploy/pipeline-alert.service /etc/systemd/system/pipeline-alert.service
sudo systemctl daemon-reload
sudo systemctl enable --now pipeline-alert
sudo systemctl status pipeline-alert --no-pager
journalctl -u pipeline-alert -f          # follow logs
```

## 6. Updating after a code change

```bash
cd /home/ubuntu/pipeline-alert
git pull
npm ci && npm run build
sudo systemctl restart pipeline-alert
```

## Notes / gotchas

- **Single instance only.** Telegram `getUpdates` allows one long-poll per bot
  token. Running this twice (e.g. a stray `npm run dev` alongside the service)
  causes a 409 conflict. `Restart=on-failure` + `TimeoutStopSec=15` give the old
  poll time to release before a restart.
- **SQLite lives in the working dir.** `database.db` (+ `-wal`/`-shm`) is created
  relative to CWD, so `ubuntu` must own `/home/ubuntu/pipeline-alert`.
- **EC2 outbound access.** The security group must allow outbound HTTPS (443) to
  reach Bitbucket, Telegram, and your LLM provider (Bedrock/OpenAI). No inbound
  port is needed — the app makes no inbound connections.
