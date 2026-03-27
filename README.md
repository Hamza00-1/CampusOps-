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
- **Frontend** *(coming soon)*: React, Vite, Tailwind CSS
- **Infrastructure**: Docker Compose

## 🚀 Getting Started

To run the backend locally, you need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Hamza00-1/CampusOps-.git
   cd CampusOps-
   ```

2. **Start the Database Infrastructure:**
   ```bash
   cd backend
   docker compose up -d db redis
   ```

3. **Install Dependencies & Seed Database:**
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev
   npx tsx prisma/seed.ts
   ```

4. **Launch the API:**
   ```bash
   npm run dev
   ```
   > The server will start on `localhost:3000`. You can check the health at `http://localhost:3000/health`.

---

> 🤝 **Team Note:** Please completely read the `CONTRIBUTING.md` file before you write any code! It explains our branching rules and phase assignments.
