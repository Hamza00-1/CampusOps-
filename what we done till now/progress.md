# CampusOps — What We've Done So Far

A complete breakdown of everything built in Phases 1–4 and **why each piece matters** for the final project.

---

## 🏗️ Phase 1 — Scaffolding (The Foundation)

| What we built | Why it matters |
|---|---|
| **Express + TypeScript** server | TypeScript catches bugs *before* they reach production. Professional-grade code, not messy JavaScript. |
| **Docker Compose** (PostgreSQL + Redis) | Any teammate runs `docker compose up` and gets the *exact same* database. No more "it works on my machine" problems. This is the **core concept of our Distributed Apps course**. |
| **Zod-validated environment** (`env.ts`) | If someone forgets a config variable, the server crashes *immediately* with a clear error instead of failing randomly 2 hours later. |
| **Winston structured logging** | Every request is logged with timestamp, status code, and duration. When something breaks, you can trace exactly what happened. |
| **Centralized error handler** | Every error in the entire app returns the same JSON format. The frontend always knows what to expect. |
| **Graceful shutdown** | When the server stops, it closes DB connections cleanly — no data corruption. |

### Files
- `src/config/env.ts` — Zod-validated environment variables
- `src/config/database.ts` — Prisma singleton connection
- `src/config/redis.ts` — Redis client with retry logic
- `src/middleware/logger.ts` — Winston structured logging
- `src/middleware/errorHandler.ts` — ApiError class + centralized handler
- `src/middleware/validator.ts` — Zod validation middleware factory
- `src/utils/response.ts` — Standardized API response helpers
- `src/types/index.ts` — AuthPayload, Express augmentation
- `src/app.ts` — Express app with security middleware
- `src/index.ts` — Bootstrap + graceful shutdown
- `docker-compose.yml` — PostgreSQL 16 + Redis 7 containers
- `Dockerfile` — Multi-stage build (dev + prod)

---

## 🗄️ Phase 2 — Database & Models (The Data Layer)

| What we built | Why it matters |
|---|---|
| **10 Prisma models** | These are the *real database tables*: Branches, Users, Modules, Groups, Planning, Absences, Progress, Payments, Notifications. Every feature in CampusOps reads/writes from these. |
| **4 Enums** | Role (Admin, Scolarite, Enseignant, Etudiant), AbsenceStatus, PaymentPlanType, PaymentStatus — type-safe values enforced at the database level. |
| **Migrations** | Database changes are versioned. If you change a table, Prisma creates a migration file that your teammates can replay to get the same change. |
| **Seed data** | 4 demo accounts (admin, scolarité, prof, student) + realistic sample data across all tables. Anyone can test immediately without manually creating data. |

### Files
- `prisma/schema.prisma` — Full database schema (10 models, 4 enums)
- `prisma/seed.ts` — Demo data seeding script
- `prisma/migrations/` — Auto-generated migration files

### Demo Accounts
| Email | Role | Password |
|-------|------|----------|
| `admin@campusops.ma` | Admin | `Admin123!` |
| `scolarite@campusops.ma` | Scolarite | `Scolar123!` |
| `prof@campusops.ma` | Enseignant | `Prof123!` |
| `student@campusops.ma` | Etudiant | `Student123!` |

---

## 🔐 Phase 3 — Authentication & Security (The Guard)

| What we built | Why it matters |
|---|---|
| **JWT Access Token** (15 min) | This is how the frontend knows *who* is making a request. Every API call includes this token. Expires fast = more secure. |
| **JWT Refresh Token** (7 days) | When the access token expires, the frontend silently gets a new one without forcing the user to log in again. |
| **Token rotation** | If a hacker steals a refresh token, the system detects it and invalidates *all* tokens. Real-world security pattern used by Google, GitHub, etc. |
| **bcrypt password hashing** (12 rounds) | Passwords are never stored as plain text. Even if the database is hacked, passwords can't be read. |
| **RBAC middleware** (`requireRole`) | Admin can manage everything. Scolarité handles planning/payments. Prof marks absences. Students can only see their own data. One line of code: `requireRole('Admin', 'Scolarite')`. |
| **Zod validation schemas** | Rejects weak passwords (must have uppercase, lowercase, number, special char), invalid emails, etc. *before* they even reach the database. |
| **Rate limiting** | Blocks brute-force attacks: max 15 login attempts per 15 minutes. Global limit: 100 requests per 15 minutes. |
| **Swagger UI** (`/api/docs`) | Interactive API playground — test every endpoint visually in the browser without writing code. |

### Auth Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | Public | Create new account |
| `POST` | `/api/auth/login` | Public | Login → get JWT tokens |
| `POST` | `/api/auth/refresh` | Public | Rotate tokens |
| `POST` | `/api/auth/logout` | 🔒 JWT | Invalidate refresh token |
| `PUT` | `/api/auth/change-password` | 🔒 JWT | Change password (forces re-login) |
| `GET` | `/api/auth/profile` | 🔒 JWT | Get current user profile + branch |

### Files
- `src/utils/jwt.ts` — Sign/verify access & refresh tokens
- `src/utils/hash.ts` — bcrypt hash & compare
- `src/middleware/auth.ts` — JWT Bearer authentication middleware
- `src/middleware/rbac.ts` — `requireRole()` + `requireOwnerOrAdmin()`
- `src/modules/auth/auth.schemas.ts` — Zod validation schemas
- `src/modules/auth/auth.service.ts` — Business logic (register, login, refresh, logout, change-password, profile)
- `src/modules/auth/auth.controller.ts` — Route handlers
- `src/modules/auth/auth.routes.ts` — Express routes with Swagger annotations
- `src/config/swagger.ts` — Swagger/OpenAPI configuration

---

## 📡 Phase 4 — Core CRUD APIs (The Business Logic)

This is the biggest phase — **9 modules, 36 new files, 1,823 lines of code**. Every module follows the same professional pattern: `schemas.ts → service.ts → controller.ts → routes.ts`.

### 4A: Entity Management

| Module | What it does | Who can write | Key features |
|--------|-------------|--------------|-------------|
| **Branches** | Manage campus locations | Admin only | CRUD + deletion safety (can't delete if users exist) |
| **Users** | Manage all accounts | Admin only | Paginated list, search by name/email, filter by role/branch |
| **Modules** | Academic subjects | Scolarité/Admin | Branch-scoped, planning + progress counts |
| **Groups** | Student groups | Scolarité/Admin | CRUD + **enroll/unenroll** students (validates role = Etudiant) |

### 4B: Business Logic

| Module | What it does | Who can write | Key features |
|--------|-------------|--------------|-------------|
| **Planning** | Class scheduling | Scolarité/Admin | CRUD + **`/today`** + **`/week`** (role-aware: teachers see their sessions, students see their groups') |
| **Absences** | Attendance tracking | Enseignant+ | Single + **bulk marking** (whole class at once), justify with doc URL, **attendance stats** (% rate) |
| **Progress** | Course completion % | Enseignant/Admin | Upsert per module/group, **group summary** with average across all modules |
| **Payments** | Financial tracking | Scolarité/Admin | CRUD + **overdue filter** + **student summary** (total due, paid, balance, overdue count) |
| **Notifications** | In-app alerts | All users (own only) | List, **unread count**, mark-as-read, **mark-all-as-read**, ownership checks |

### All API Endpoints (50+ total)

| Module | Endpoints |
|--------|-----------|
| **Branches** | `GET /api/branches`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Users** | `GET /api/users?role=&search=&page=`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Modules** | `GET /api/modules?branchId=`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Groups** | `GET /api/groups`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`, `POST /:id/students`, `DELETE /:id/students` |
| **Planning** | `GET /api/planning`, `GET /today`, `GET /week`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Absences** | `GET /api/absences`, `GET /:id`, `GET /stats/:studentId`, `POST`, `POST /bulk`, `PUT /:id/justify`, `DELETE /:id` |
| **Progress** | `GET /api/progress`, `GET /group/:groupId`, `POST` |
| **Payments** | `GET /api/payments?overdue=true`, `GET /summary/:studentId`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Notifications** | `GET /api/notifications`, `GET /unread`, `POST`, `PUT /read-all`, `PUT /:id/read`, `DELETE /:id` |

### Files (36 new)
Each module has 4 files in `src/modules/<name>/`:
- `branch.schemas.ts` / `branch.service.ts` / `branch.controller.ts` / `branch.routes.ts`
- `user.schemas.ts` / `user.service.ts` / `user.controller.ts` / `user.routes.ts`
- `module.schemas.ts` / `module.service.ts` / `module.controller.ts` / `module.routes.ts`
- `group.schemas.ts` / `group.service.ts` / `group.controller.ts` / `group.routes.ts`
- `planning.schemas.ts` / `planning.service.ts` / `planning.controller.ts` / `planning.routes.ts`
- `absence.schemas.ts` / `absence.service.ts` / `absence.controller.ts` / `absence.routes.ts`
- `progress.schemas.ts` / `progress.service.ts` / `progress.controller.ts` / `progress.routes.ts`
- `payment.schemas.ts` / `payment.service.ts` / `payment.controller.ts` / `payment.routes.ts`
- `notification.schemas.ts` / `notification.service.ts` / `notification.controller.ts` / `notification.routes.ts`

### Test Results
```
✅ LOGIN: Login successful (role: Admin)
✅ BRANCHES: 2 found
✅ USERS: 4 found (total: 4)
✅ MODULES: 2 found
✅ GROUPS: 1 found
✅ PLANNING: 2 sessions
✅ PLANNING/TODAY: 2 sessions
✅ PLANNING/WEEK: 2 sessions
✅ ABSENCES: 1 records
✅ PROGRESS: 1 records
✅ PAYMENTS: 2 records
✅ NOTIFICATIONS: 0 notifications
✅ UNREAD COUNT: 0
✅ RBAC: Student blocked from admin routes → 403 Forbidden
✅ 404: Branch not found (proper error handling)
=== ALL 10 MODULES PASSED ===
```

---

## 🤝 Team Collaboration Setup

| What we built | Why it matters |
|---|---|
| **GitHub repo** with clean structure | Central source of truth for the whole team. |
| **README.md** | Step-by-step setup guide — any teammate goes from zero to running in 5 minutes. |
| **CONTRIBUTING.md** | Branching rules + phase assignments — prevents merge conflicts. |
| **CampusOps_Roadmap.md** | Full plan (Phases 1–8) so everyone knows the big picture. |
| **.gitignore** | Prevents `node_modules` (500MB) and `.env` (secrets) from being pushed. |

---

## 🔗 How It All Connects

```
What a user will see:                What we built behind it:
─────────────────────                ───────────────────────
Click "Login"                   →    JWT + bcrypt + rate limiting
See their dashboard             →    RBAC (only their role's data)  
View today's schedule           →    GET /api/planning/today
Mark attendance for a class     →    POST /api/absences/bulk
Check a student's payment       →    GET /api/payments/summary/:id
See course progress             →    GET /api/progress/group/:id
Get notified of overdue fees    →    GET /api/notifications + /unread
Data loads instantly            →    PostgreSQL + Prisma queries
Works on every teammate's PC    →    Docker + .env + migrations
Password is safe                →    bcrypt (12 rounds) + validation
Session doesn't expire randomly →    Refresh token rotation
API is documented               →    Swagger UI at /api/docs
```

---

## 🤖 Phase 6 — Integrations (Telegram Bot, IMAP, Cron)

### 6A — Telegram Bot

| What we built | Why it matters |
|---|---|
| **Webhook receiver** `POST /api/telegram/webhook` | Telegram pushes every user message here. Secret token header prevents fake requests. |
| **Command router** | Dispatches `/start`, `/help`, `/link`, `/unlink`, `/today`, `/week`, `/absence`, `/progress` to dedicated handlers. |
| **OTP account linking** | User clicks "Link Telegram" in app → gets a 6-digit code → sends `/link 123456` to the bot → `telegramChatId` is stored, OTP cleared. Secure and user-friendly. |
| **`/today` command** | Sends the user's sessions for today (role-aware: teacher sees their classes, student sees their group's). |
| **`/week` command** | Sends the full week schedule grouped by day. |
| **`/absence` command** | Shows the student's attendance rate with a visual progress bar (█░░ style). |
| **`/progress` command** | Shows course completion % per module for the student's groups. |
| **REST endpoints** | `POST /api/telegram/generate-otp`, `GET /api/telegram/status`, `DELETE /api/telegram/unlink` — used by the frontend Settings page. |

### 6B — IMAP Email Inbox Reader

| What we built | Why it matters |
|---|---|
| **IMAP reader** `src/integrations/email/imap.ts` | Connects to any IMAP server (Gmail, Outlook…) and fetches the N latest emails. Skips gracefully if not configured. |
| **`GET /api/mail/latest`** | Returns the most recent emails with subject, sender, date, and a 500-char body preview. Admin/Scolarite only. |
| **`POST /api/mail/send`** | Sends a branded HTML email via SMTP. Admin/Scolarite only. |

### 6C — Cron Jobs (Scheduled Tasks)

| What we built | Why it matters |
|---|---|
| **Daily 07:00** schedule digest | Every morning, CampusOps automatically sends each student and teacher their day's sessions via Telegram and email. No one forgets class. |
| **Daily 09:00 Mon–Fri** overdue alert | Scolarite staff get a Telegram ping every weekday morning showing how many payments are overdue. |
| **Graceful start/stop** | Cron jobs start with the server and stop cleanly on SIGTERM — no orphaned tasks. |

### New files (Phase 6)
```
src/integrations/
  telegram/
    types.ts                  ← Telegram API type definitions
    router.ts                 ← Command dispatcher
    webhook.ts                ← HTTP webhook handler (POST /api/telegram/webhook)
    commands/
      start.ts                ← /start
      help.ts                 ← /help
      link.ts                 ← /link <otp> + /unlink
      today.ts                ← /today (role-aware schedule)
      week.ts                 ← /week (grouped by day)
      absence.ts              ← /absence (attendance rate)
      progress.ts             ← /progress (course % per module)
  email/
    imap.ts                   ← IMAP inbox reader
  cron.ts                     ← Scheduled jobs (07:00 digest, 09:00 overdue alert)
src/modules/
  telegram/telegram.routes.ts ← OTP + status + unlink REST endpoints
  mail/mail.routes.ts         ← GET /api/mail/latest + POST /api/mail/send
```

---

## 🧪 Phase 7 — Tests

| What we built | Why it matters |
|---|---|
| **`jest.config.ts`** | Configures Jest for TypeScript unit tests with `@prisma/client` mocked — no database needed. |
| **`jest.integration.config.ts`** | Separate config for integration tests that hit a real database. Sequential execution prevents conflicts. |
| **JWT unit tests** (12 tests) | Verifies signing, verification, token rotation, tamper detection, and wrong-secret rejection. |
| **bcrypt unit tests** (8 tests) | Verifies hashing, comparison, salt uniqueness, format, and edge cases (empty string, 72-byte truncation). |
| **RBAC unit tests** (8 tests) | Verifies `requireRole()` and `requireOwnerOrAdmin()` allow/block logic without mocking Express. |
| **Auth integration tests** (8 tests) | Full HTTP flow: register → login → get profile → refresh tokens → replay attack detection → logout → RBAC block. |

```
npm test              → 28 unit tests, ~4 seconds, no database required
npm run test:integration → Full auth flow against a real PostgreSQL DB
```

### Test results
```
PASS src/utils/__tests__/jwt.test.ts
PASS src/utils/__tests__/hash.test.ts
PASS src/middleware/__tests__/rbac.test.ts

Test Suites: 3 passed, 3 total
Tests:       28 passed, 28 total
Time:        4.437 s
```

---

## 🚀 Phase 8 — CI/CD & Cloud Deployment

| What we built | Why it matters |
|---|---|
| **GitHub Actions** `.github/workflows/ci.yml` | Every push/PR automatically runs: TypeScript typecheck → unit tests → integration tests on a real PostgreSQL container. Broken code can't reach main. |
| **`.env.production.example`** | Complete production config template with step-by-step instructions for Railway, Supabase, Neon, Render, and Vercel. |
| **README deployment guide** | Covers Railway (recommended), Render + Supabase, Vercel for frontend, and the one-line Telegram webhook registration command. |

### CI Pipeline
```
On every push to main / every PR:
  ┌─────────────────────────────────────────────┐
  │  Job 1: Typecheck + Unit Tests              │
  │    → npm run typecheck (0 errors)           │
  │    → npm test (28 tests pass)               │
  └──────────────────┬──────────────────────────┘
                     │ (only if Job 1 passes)
  ┌──────────────────▼──────────────────────────┐
  │  Job 2: Integration Tests                   │
  │    → PostgreSQL 16 + Redis 7 service        │
  │    → prisma migrate deploy                  │
  │    → npm run db:seed                        │
  │    → npm run test:integration               │
  └─────────────────────────────────────────────┘
```

### Deployment stack (recommended)
| Layer | Service | Cost |
|---|---|---|
| Database | Supabase or Neon | Free tier |
| API | Railway | Free tier |
| Frontend | Vercel | Free tier |
| Redis | Railway Redis plugin | Free tier |

---

## 📋 Final Phase Status

| Phase | Description | Status |
|---|---|---|
| ~~Phase 1~~ | ~~Scaffolding & Infrastructure~~ | ✅ Done |
| ~~Phase 2~~ | ~~Database & Models~~ | ✅ Done |
| ~~Phase 3~~ | ~~Authentication & Security~~ | ✅ Done |
| ~~Phase 4~~ | ~~Core CRUD APIs (50+ endpoints)~~ | ✅ Done |
| ~~Phase 5~~ | ~~Frontend Dashboard Integration~~ | ✅ Done |
| ~~Phase 6~~ | ~~Integrations (Telegram Bot, IMAP, Cron)~~ | ✅ Done |
| ~~Phase 7~~ | ~~Tests (28 unit + integration)~~ | ✅ Done |
| ~~Phase 8~~ | ~~CI/CD + Deployment Config~~ | ✅ Done |

> **Project complete.** CampusOps is a full-stack distributed campus management system: 12 API modules, 55+ REST endpoints, JWT authentication with token rotation, role-based access control, a Telegram bot with 8 commands, scheduled cron notifications, IMAP inbox reading, 28 automated tests, and a GitHub Actions CI/CD pipeline that gates every merge on typecheck + tests. Ready for cloud deployment on Railway + Supabase + Vercel.
