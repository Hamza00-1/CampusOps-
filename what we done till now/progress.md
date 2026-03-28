# CampusOps — What We've Done So Far

A complete breakdown of everything built in Phases 1–3 and **why each piece matters** for the final project.

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

### API Endpoints
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
Data loads instantly            →    PostgreSQL + Prisma queries
Works on every teammate's PC    →    Docker + .env + migrations
Password is safe                →    bcrypt (12 rounds) + validation
Session doesn't expire randomly →    Refresh token rotation
API is documented               →    Swagger UI at /api/docs
```

---

## 📋 What's Next

| Phase | What | Status |
|-------|------|--------|
| ~~Phase 1~~ | ~~Scaffolding & Infrastructure~~ | ✅ Done |
| ~~Phase 2~~ | ~~Database & Models~~ | ✅ Done |
| ~~Phase 3~~ | ~~Authentication & Security~~ | ✅ Done |
| **Phase 4** | **Core CRUD APIs** (Users, Planning, Absences, Payments, etc.) | ⬜ Next |
| Phase 5 | Frontend Dashboard (React + Vite) | ⬜ |
| Phase 6 | Integrations (Telegram Bot, Email, OpenClaw) | ⬜ |
| Phase 7 | API Documentation & Testing | ⬜ |
| Phase 8 | Cloud Deployment & Demo | ⬜ |

> **In short**: We built the *entire invisible engine* that powers a secure, multi-user campus platform. Phases 4–5 will add the visible parts — API endpoints for every feature and the React dashboard users will actually interact with. Everything we built is **required** for those phases to work.
