# GoFlyTexas

Next.js 14 marketing site for GoFlyTexas (Aero Valley Airport, Roanoke TX). Includes a lightweight
lead capture + nurture system so contact form submissions don't fall through the cracks.

## Lead capture / follow-up system

Three pieces wired together:

1. **Contact form (`/contact`)** → `POST /api/leads` → row in Postgres → instant auto-reply to the
   lead + notification email to `info@goflytexas.com`.
2. **Admin console (`/admin`)** → see every lead, filter by status, mark contacted/converted, or
   add a lead manually (for people who call in or walk up).
3. **Weekly follow-up cron** → `GET /api/cron/weekly-followup` (auth: `Bearer $CRON_SECRET`) picks
   up every lead that is `new` or `contacted`, not unsubscribed, and not contacted in the last 7
   days, and sends a friendly nurture email. CAN-SPAM-compliant unsubscribe link at `/unsubscribe`.

### Lead lifecycle

```
   web form / manual entry
            ↓
         [ new ]  ─── weekly cron emails ──→ [ contacted ]
            │                                      │
            │      (admin mark converted)          │
            ↓                                      ↓
       [ converted ]   ←──────────────  (admin mark converted)
            │
            └── (lead unsubscribes via email link) → [ unsubscribed ]  (cron skips)
```

## Running locally

```bash
./scripts/secrets.sh pull         # writes .env.local from your OneDrive secrets folder
npm install
npm run db:push                   # creates the schema (requires DATABASE_URL)
npm run dev
```

## Secret management

Secrets live in plaintext files under `C:\Users\chris\OneDrive\Secrets\goflytexas\`, one file per env var (filename = key, file content = value). OneDrive syncs them across your devices.

`./scripts/secrets.sh` is the per-project wrapper. The list of expected keys is committed at [.secrets.expected](./.secrets.expected); the project name is committed at [.secrets-project](./.secrets-project).

```bash
./scripts/secrets.sh list                 # see which keys are present / missing
./scripts/secrets.sh get RESEND_API_KEY   # print one value
./scripts/secrets.sh set DATABASE_URL     # prompts hidden, writes file
./scripts/secrets.sh pull                 # writes .env.local from the folder
./scripts/secrets.sh export                # JSON to stdout (used by Claude to push to Railway via MCP)
./scripts/secrets.sh check                 # exit 1 if anything in .secrets.expected is missing
```

Override the folder via `SECRETS_ROOT=/some/other/path ./scripts/secrets.sh list`.

**Pushing to Railway**: Claude runs `./scripts/secrets.sh export` and feeds the JSON into the Railway MCP `set-variables` tool. Shell can't call MCPs directly, so this part is a Claude-driven workflow. You'd ask: *"push secrets to railway"*.

## Deployment (Railway)

This site deploys via Railway (Dockerfile build). To wire up the lead system on Railway:

1. **Attach Postgres** — add the Postgres plugin to the project. Railway sets `DATABASE_URL`
   automatically.
2. **Run migrations** — either run `npm run db:push` once locally pointed at the Railway proxy URL,
   or add a one-shot deploy step that runs `npm run db:migrate`. The migration SQL is committed in
   [`drizzle/`](./drizzle).
3. **Set env vars** in the web service:
   - `RESEND_API_KEY` — from resend.com (verify the goflytexas.com sending domain first)
   - `NEXT_PUBLIC_SITE_URL` — e.g. `https://goflytexas.com`
   - `CRON_SECRET` — generate a long random string (`openssl rand -hex 32`)
   - `ADMIN_TOKEN` — required before public launch; gates `/admin/*` (visit
     `/admin?key=<token>` once to set the cookie)
   - `EMAIL_FROM`, `ADMIN_EMAIL` (optional, see `.env.example` for defaults)
4. **Configure weekly cron** — create a new Railway service in the same project, source from this
   repo, set the start command to `bash scripts/run-weekly-cron.sh`, and set the cron schedule to
   e.g. `0 14 * * 1` (Mondays 9am CT = 14:00 UTC). The cron service needs `APP_URL` and
   `CRON_SECRET` env vars.

### Sanity-checking the cron manually

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://goflytexas.com/api/cron/weekly-followup
# → { "ok": true, "considered": 3, "sent": 3, "failed": 0, "errors": [] }
```

## Admin console

- Live at `/admin` once the app is deployed.
- Without `ADMIN_TOKEN` set, the page is OPEN — a yellow banner reminds you to set it.
- With `ADMIN_TOKEN` set, first visit must include `?key=<token>` to unlock the cookie. After that
  the bare `/admin` URL works for 30 days.

## Tech

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Drizzle ORM + Postgres
- Resend for transactional email
- Deployed via Dockerfile on Railway
