# CampusOps

**CampusOps** is a modern, distributed campus management platform for UEMF. It handles planning, attendance, payments, and academic progress tracking in one unified system.

## 🌟 Features
- **Role-Based Access**: Specialized interfaces for Admin, Scolarité, Enseignants, and Etudiants.
- **Academic Management**: Branch, Module, and Group hierarchy.
- **Planning & Attendance**: Scheduling and tracking daily absences and lateness.
- **Progress Tracking**: Real-time course completion tracking (%).
- **Financial Module**: Inscriptions and monthly payment alerts.
- **Integrations**: Telegram Bot for quick queries, Email notifications, and OpenClaw workflows.

## 🛠 Tech Stack
- **Backend**: Node.js, Express, TypeScript, Zod
- **Database**: PostgreSQL 16 via Prisma ORM
- **Cache / Queues**: Redis 7
- **Frontend** *(coming soon)*: React, Vite, TypeScript
- **Infrastructure**: Docker Compose

---

## 🚀 Teammate Setup Guide (5 minutes)

### Prerequisites
You need these installed on your machine:
1. **[Node.js 24+](https://nodejs.org/)** — JavaScript runtime
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — Runs PostgreSQL and Redis in containers

### Step 1: Clone the repository
```bash
git clone https://github.com/Hamza00-1/CampusOps-.git
cd CampusOps-
```

### Step 2: Create your `.env` file
```bash
cd backend
```
Create a file called `.env` in the `backend/` folder with this content:
```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api

DATABASE_URL=postgresql://campusops:campusops_secret@localhost:5432/campusops_db?schema=public

REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=dev-access-secret-campusops-2026
JWT_REFRESH_SECRET=dev-refresh-secret-campusops-2026
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

BCRYPT_SALT_ROUNDS=12

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

CORS_ORIGIN=http://localhost:5173

LOG_LEVEL=debug
```

### Step 3: Start the database (Docker)
```bash
docker compose up -d db redis
```
This starts PostgreSQL and Redis in Docker containers. Wait 10 seconds for them to become healthy.

### Step 4: Install dependencies & set up database
```bash
npm install
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### Step 5: Start the API server
```bash
npm run dev
```

### Step 6: Open the API playground
Open your browser and go to: **http://localhost:3000/api/docs**

This is the Swagger UI where you can test every endpoint interactively!

### Step 7: Test it!
1. Click **POST /api/auth/login** → Try it out
2. Use these demo credentials:
   | Email | Password | Role |
   |-------|----------|------|
   | `admin@campusops.ma` | `Admin123!` | Admin |
   | `scolarite@campusops.ma` | `Scolar123!` | Scolarité |
   | `prof@campusops.ma` | `Prof123!` | Enseignant |
   | `student@campusops.ma` | `Student123!` | Étudiant |
3. Copy the `accessToken` from the response
4. Click the **🔒 Authorize** button at the top → paste the token
5. Now test any protected endpoint (Profile, Logout, etc.)

---

## 📁 Project Structure

```
CampusOps-/
├── README.md              ← You are here
├── CONTRIBUTING.md        ← Team workflow & branching rules
├── CampusOps_Roadmap.md   ← Full Phase 1-8 implementation plan
├── backend/
│   ├── docker-compose.yml ← PostgreSQL + Redis containers
│   ├── Dockerfile         ← Multi-stage build
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma  ← 10 database models
│   │   └── seed.ts        ← Demo data
│   └── src/
│       ├── config/        ← Environment, DB, Redis, Swagger
│       ├── middleware/     ← Auth, RBAC, validation, logging, errors
│       ├── modules/       ← Feature modules (auth, etc.)
│       ├── utils/         ← JWT, hashing, response helpers
│       ├── app.ts         ← Express app
│       └── index.ts       ← Server bootstrap
├── mockups/               ← HTML/CSS prototypes
└── doc/                   ← Project specification
```

---

> 🤝 **Before writing any code, read `CONTRIBUTING.md`!** It explains our Git branching workflow and phase assignments.
