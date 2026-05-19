# CampusOps — Phase 6, 7 & 8 — What We Built

A complete breakdown of everything added in the final three phases.

---

## 🤖 Phase 6A — Telegram Bot

### How it works

```
User opens Telegram → /link 482910 → Bot looks up OTP in DB
→ Stores telegramChatId on the user → Account linked ✅

Later: /today
→ Bot fetches today's schedule from DB (role-aware)
→ Sends formatted message back to the user
```

### What we built

| What | File | Details |
|---|---|---|
| Telegram type definitions | `src/integrations/telegram/types.ts` | TelegramUpdate, TelegramMessage, TelegramContext interfaces |
| Command dispatcher | `src/integrations/telegram/router.ts` | Maps `/command` strings to handlers, strips bot username suffix |
| Webhook handler | `src/integrations/telegram/webhook.ts` | POST `/api/telegram/webhook` — verifies secret token, acks immediately |
| `/start` handler | `commands/start.ts` | Welcome message; detects if already linked |
| `/help` handler | `commands/help.ts` | Lists all available commands |
| `/link` + `/unlink` | `commands/link.ts` | OTP lookup → stores `telegramChatId`, clears OTP; reverse to unlink |
| `/today` handler | `commands/today.ts` | Role-aware: teacher sees their sessions, student sees group sessions |
| `/week` handler | `commands/week.ts` | Full week grouped by day (Mon–Sun) |
| `/absence` handler | `commands/absence.ts` | Attendance rate with visual bar (█░░░) + present/absent/late counts |
| `/progress` handler | `commands/progress.ts` | Course completion % per module with visual bar |
| REST routes | `src/modules/telegram/telegram.routes.ts` | `POST /generate-otp`, `GET /status`, `DELETE /unlink` |

### OTP Linking Flow

```
1. User clicks "Link Telegram" in the web app
2. App calls POST /api/telegram/generate-otp → gets { otp: "482910" }
3. User opens Telegram, sends: /link 482910
4. Bot: finds user by otpCode="482910" in DB
5. Bot: sets user.telegramChatId = this chat ID, clears otpCode
6. Bot: "✅ Account linked! Welcome, Ibrahim (Admin)"
```

---

## 📬 Phase 6B — IMAP Email Inbox Reader + Mail API

### What we built

| What | File | Details |
|---|---|---|
| IMAP reader | `src/integrations/email/imap.ts` | Connects via imap-simple, fetches latest N emails, parses with mailparser |
| Mail routes | `src/modules/mail/mail.routes.ts` | `GET /api/mail/latest`, `POST /api/mail/send` |

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/mail/latest?limit=10` | Admin/Scolarite | Fetch inbox emails (subject, from, date, body preview) |
| `POST` | `/api/mail/send` | Admin/Scolarite | Send a branded HTML email via SMTP |

### Graceful degradation
If `IMAP_HOST` is not set in `.env` → endpoint returns an empty array with a warning log. Server never crashes.

---

## ⏰ Phase 6C — Cron Jobs

### What we built

| Job | Schedule | What it does |
|---|---|---|
| Daily planning digest | Every day at **07:00** (Africa/Casablanca) | Sends today's schedule to every teacher and student who has Telegram linked or an email on file |
| Overdue payment alert | **09:00 Mon–Fri** | Sends Telegram alert to all Scolarite staff showing the count of unpaid overdue payments |

### File: `src/integrations/cron.ts`

```
startCron()  → called in index.ts at server boot
stopCron()   → called in graceful shutdown handler
```

### How the daily digest works
```
For each teacher/student in DB:
  1. Check if they have sessions today (role-aware query)
  2. If yes: build session summary text
  3. Send via Telegram (if telegramChatId linked)
  4. Send via Email (if SMTP configured)
  5. 100ms delay between users to respect rate limits
```

---

## 🧪 Phase 7 — Tests (28 unit + integration)

### Test setup

| File | Purpose |
|---|---|
| `jest.config.ts` | Unit test config — no DB, `@prisma/client` mocked |
| `jest.integration.config.ts` | Integration test config — real DB, sequential, 30s timeout |
| `src/__mocks__/@prisma/client.ts` | Mock that provides the `Role` enum for unit tests |

### Unit Tests (28 tests, ~4 seconds, no DB needed)

**JWT utilities** (`src/utils/__tests__/jwt.test.ts`) — 12 tests
```
hashToken       → deterministic, 64-char hex, collision-resistant
signAccessToken → valid JWT format, all payload fields preserved
verifyAccessToken → rejects invalid, tampered, and wrong-secret tokens
signRefreshToken  → encodes user ID correctly
verifyRefreshToken → rejects invalid tokens and access tokens
```

**bcrypt hashing** (`src/utils/__tests__/hash.test.ts`) — 8 tests
```
hashPassword  → bcrypt format ($2b$), salted (different hashes each time)
comparePassword → correct password matches, wrong password fails, empty string fails
```

**RBAC middleware** (`src/middleware/__tests__/rbac.test.ts`) — 8 tests
```
requireRole         → allows correct role, blocks wrong role, rejects missing user
requireOwnerOrAdmin → Admin can access any resource, user can access own, blocks others
```

### Integration Tests (`tests/integration/auth.test.ts`) — 8 tests

Requires a running PostgreSQL DB. Run with `npm run test:integration`.

```
POST /api/auth/register   → creates user, returns tokens; 409 on duplicate; 400 on weak password
POST /api/auth/login      → returns tokens; 401 on wrong password; 401 on unknown email
GET  /api/auth/profile    → returns profile; 401 without token; 401 with bad token
POST /api/auth/refresh    → issues new tokens; 401 on replay attack (rotated token)
POST /api/auth/logout     → invalidates refresh token
RBAC                      → student blocked from admin-only endpoints with 403
```

### Run tests

```bash
# Unit tests (no database)
npm test

# Integration tests (requires Docker DB)
docker compose up -d db redis
npm run test:integration
```

---

## 🚀 Phase 8 — CI/CD Pipeline & Deployment

### GitHub Actions (`.github/workflows/ci.yml`)

Runs automatically on every push to `main` and every pull request.

```
┌──────────────────────────────────────────────┐
│  Job 1: Typecheck + Unit Tests               │
│    • Node.js 20, npm ci                      │
│    • npx prisma generate                     │
│    • npm run typecheck  → 0 TypeScript errors│
│    • npm test           → 28 tests pass      │
└──────────────────┬───────────────────────────┘
                   │  (only runs if Job 1 passes)
┌──────────────────▼───────────────────────────┐
│  Job 2: Integration Tests                    │
│    • PostgreSQL 16 + Redis 7 service         │
│    • prisma migrate deploy                   │
│    • npm run db:seed                         │
│    • npm run test:integration                │
└──────────────────────────────────────────────┘
```

### Production deployment (`.env.production.example`)

Step-by-step guide for:

| Layer | Recommended Service | Free? |
|---|---|---|
| Database (PostgreSQL) | Supabase or Neon | ✅ Free tier |
| API server | Railway | ✅ Free tier |
| Redis | Railway Redis plugin | ✅ Free tier |
| Frontend | Vercel | ✅ Free tier |

### Telegram webhook registration (one-time, after deploy)

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-api.railway.app/api/telegram/webhook&secret_token=<WEBHOOK_SECRET>"
```

---

## 📊 Final Project Stats

| Metric | Count |
|---|---|
| API modules | 13 (auth, branches, users, modules, groups, planning, absences, progress, payments, notifications, grades, telegram, mail) |
| REST endpoints | 60+ |
| Telegram bot commands | 8 (/start, /help, /link, /unlink, /today, /week, /absence, /progress) |
| Cron jobs | 2 (07:00 digest, 09:00 overdue alert) |
| Unit tests | 28 (passing, ~4s) |
| Integration tests | 8 (full auth flow) |
| TypeScript errors | 0 |
| Total commits | 30+ |

---

## 📋 All Phases — Final Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Scaffolding & Infrastructure (Express, Docker, Redis) | ✅ Done |
| Phase 2 | Database & Models (10 Prisma models, seed data) | ✅ Done |
| Phase 3 | Auth & Security (JWT, RBAC, bcrypt, rate-limiting) | ✅ Done |
| Phase 4 | Core CRUD APIs (50+ endpoints, 9 modules) | ✅ Done |
| Phase 5 | Frontend Dashboard (React, role-based views) | ✅ Done |
| Phase 6A | Telegram Bot (8 commands, OTP linking, webhook) | ✅ Done |
| Phase 6B | IMAP inbox reader + Mail API endpoints | ✅ Done |
| Phase 6C | Cron jobs (daily digest + overdue alerts) | ✅ Done |
| Phase 7 | Tests (28 unit + integration, Jest config) | ✅ Done |
| Phase 8 | GitHub Actions CI/CD + production deployment config | ✅ Done |

> **All 8 phases complete.** CampusOps is production-ready: full-stack, tested, type-safe, and deployable to the cloud in minutes.
