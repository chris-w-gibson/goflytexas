# Next steps to make GoFlyTexas lead system live

Everything below is the path from "code merged" to "Jim sees a working demo."

## 1. Attach Postgres to Railway (manual — 30 seconds)

I couldn't do this autonomously because the existing Railway MCP token isn't scoped to the `goflytexas` project.

Go to https://railway.com/project/0c30b493-bb06-46a9-abec-ba4a440b74ce →
**+ Create** → **Database** → **PostgreSQL**.

Railway will create a new service and auto-populate `DATABASE_URL` on the goflytexas web service. **Tell Claude when this is done** and I'll do steps 2–5 below.

## 2. Sync DATABASE_URL into the secrets folder

```bash
# I'll do this — copies DATABASE_URL from Railway into the OneDrive secrets folder
# so it's tracked alongside the other secrets.
./scripts/secrets.sh set DATABASE_URL
```

## 3. Run the Drizzle migration against the Railway DB

```bash
# Use the PUBLIC DATABASE_URL (port 5432 won't work from your laptop — Railway
# exposes a public TCP proxy port for external connections).
DATABASE_URL="<public url from Railway>" npm run db:migrate
```

This creates the `leads` and `email_events` tables.

## 4. Verify Resend domain (manual — only blocker for outbound email)

Resend has **zero verified domains** right now. The `EMAIL_FROM = info@goflytexas.com`
setting will fail with a 403 from Resend until you:

1. Go to https://resend.com/domains → **Add Domain** → `goflytexas.com`
2. Copy the DKIM + SPF TXT records Resend gives you
3. Paste them into Squarespace DNS at https://account.squarespace.com/domains (the apex still lives there per project memory)
4. Click **Verify** at Resend (~5 minutes after DNS propagation)

*Workaround if you want to demo before the domain is verified*: switch
`EMAIL_FROM` to `onboarding@resend.dev`. Emails will only deliver to the
email address registered on your Resend account in that mode.

## 5. Open PR + deploy

```bash
gh pr create --base main --head feat/lead-capture-followup \
  --title "Lead capture + weekly follow-up CRM lite" \
  --body "<details in commit message>"
```

Once merged to `main`, Railway auto-deploys. Wait 90–120s.

## 6. Validate end-to-end

```bash
curl -fsS -X POST https://goflytexas-production.up.railway.app/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Pilot","email":"<your-email>","phone":"555-0100","flightInterest":"private","preferredContact":"email","message":"smoke test"}'
# Expect: {"ok":true,"id":"..."}
```

Then visit `https://goflytexas-production.up.railway.app/admin?key=<ADMIN_TOKEN>` to see the lead and test the status controls.

## 7. Wire the weekly cron (manual — 2 minutes)

In Railway, **+ Create** → **Empty Service** in the goflytexas project. Set:

- **Source**: connect to `chris-w-gibson/goflytexas` repo
- **Start Command**: `bash scripts/run-weekly-cron.sh`
- **Cron Schedule**: `0 14 * * 1` (Mondays 9am CT = 14:00 UTC)
- **Env vars**:
  - `APP_URL = https://goflytexas-production.up.railway.app` (or your custom domain)
  - `CRON_SECRET` = same value as on the web service

Sanity-check the cron manually before relying on the schedule:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://goflytexas-production.up.railway.app/api/cron/weekly-followup
```
