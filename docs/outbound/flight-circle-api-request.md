# Flight Circle API access — request for Jim to send

Flight Circle's public API docs are gone (`/apidocs` 404s; `api.flightcircle.com` is a
login page). "API Access" is an **admin add-on** granted by Flight Circle after a
conversation: support@flightcircle.com / 888-394-9909. What we know from the old docs:
OAuth 2.0 authorization-code flow, apps registered by their support team (Client ID +
Client Secret), authorization codes single-use and 30 s. Everything else has to come back
in their reply, so the request below asks for it explicitly.

Jim sends this from his account email (the one on the Flight Circle admin login).
Copy/paste; the only edits are the two bracketed spots.

---

**To:** support@flightcircle.com
**Subject:** API access request — GoFlyTexas (Aero Valley 52F)

Hi Flight Circle team,

I'm Jim Malone, owner/administrator of the GoFlyTexas account (flight school at Aero Valley,
52F, Roanoke TX). We'd like to turn on the API Access add-on and register an application.

**What we're building**

- Our website and phone assistant capture discovery-flight leads. We want to (1) read the
  schedule so we can offer real open slots, and (2) create discovery-flight reservations
  under a designated user so my chief pilot sees agent bookings at a glance.
- Read the active instructor list so bookings rotate across available CFIs.
- Match incoming leads to existing customers by email/phone to avoid duplicates.
- Everything else stays manual in Flight Circle. Low volume: tens of calls per day, not
  thousands.

**Application to register**

- App name: GoFlyTexas Website & Phone Agent
- Redirect URIs:
  - https://www.goflytexas.com/api/integrations/flightcircle/callback
  - http://localhost:3000/api/integrations/flightcircle/callback (development)
- Technical contact: Chris Gibson, [Chris's email]
- Account: GoFlyTexas, administrator Jim Malone, [Jim's Flight Circle login email]

**Questions so we can scope the build**

1. Add-on pricing and how it bills (monthly? per call?).
2. Current API documentation URL — the old /apidocs pages return 404.
3. Which resources are available and with what operations: reservations (create / update /
   cancel), schedule or availability lookups, users/customers (read, create), instructors,
   aircraft.
4. Can a reservation created through the API carry a label, color, or note so it is
   distinguishable from staff bookings?
5. Is there a sandbox or test account, or do we test against our live account?
6. Webhooks or callbacks for reservation changes, or is polling the only option? If polling,
   what rate limits apply?
7. OAuth details: scopes, access-token lifetime, refresh-token behavior.
8. Can the app act as a dedicated "agent" user we create, rather than my own login?
9. Typical turnaround to get the app registered.

Happy to jump on a call if that's easier — 214-412-9040.

Thanks,
Jim Malone
GoFlyTexas · Aero Valley (52F)

---

## What comes back and where it goes

| From Flight Circle | Store at |
|---|---|
| Client ID / Client Secret | `~/.config/goflytexas/flightcircle.env` (mode 600) → Railway `FLIGHTCIRCLE_CLIENT_ID` / `_SECRET` |
| Docs URL, rate limits, scopes | `docs/plans/flight-circle-integration.md` §API |
| Sandbox account (if any) | same secrets file, `FLIGHTCIRCLE_SANDBOX_*` |

If the answer is "no API" or the price is silly, the front-end agent path in
`docs/plans/flight-circle-integration.md` is the fallback — same interface, different adapter.
