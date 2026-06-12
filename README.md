<div align="center">

# 🎓 CampusOps

**Plateforme Cloud-Native de Gestion Universitaire**

*Projet de fin de semestre — Cloud & Applications Réparties*
*EIDIA — Université Euro-Méditerranéenne de Fès (UEMF)*

---

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📋 Présentation

**CampusOps** est une plateforme de gestion universitaire unifiée, développée pour **EIDIA – UEMF**. Elle centralise en un seul système la planification des cours, la gestion des absences, le suivi pédagogique, les paiements et les notifications omnicanales (Email + Telegram).

Le projet respecte une architecture **Cloud-Native** : API REST sécurisée (Node.js + TypeScript), base de données relationnelle (PostgreSQL via Prisma ORM), cache distribué (Redis), et documentation interactive (Swagger).

---

## ✅ Fonctionnalités Implémentées

| Domaine | Détail |
|---------|--------|
| 🔐 **Authentification** | JWT (Access + Refresh tokens), RBAC, Forgot Password (token Redis + email), bcrypt |
| 👥 **Gestion des Utilisateurs** | CRUD complet, filtrage par rôle/branche, invitation par email |
| 📅 **Planning** | Emplois du temps **dynamiques** (semaine/jour/mois réels), vue adaptée au rôle |
| ✅ **Absences** | Marquage individuel & en masse par l'enseignant, justifications ; chaque étudiant voit son propre relevé + son taux de présence |
| 📝 **Notes** | Carnet de notes par module (Exam / TD / TP / Projet), **persistées en base** ; relevé (transcript) avec moyennes côté étudiant |
| 📊 **Avancement Pédagogique** | Suivi % par module/groupe, historique |
| 💳 **Paiements** | Suivi scolarité + mensualités, reçus envoyés par email automatiquement |
| 🔔 **Notifications** | Centre de notifications in-app (non-lues, marquer comme lu) |
| 📧 **Email (SMTP + IMAP)** | Envoi via Gmail SMTP, lecture boîte de réception via IMAP |
| 🤖 **Bot Telegram** | Liaison compte via OTP, `/today`, `/week`, `/absence`, `/progress`, `/help` |
| 🔗 **Webhooks OpenClaw** | Triggers automatisés : planning quotidien, scan des paiements en retard, notifications d'absences |
| 📖 **Swagger API Docs** | Plus de 50 endpoints documentés et testables interactivement |

---

## 👤 Vues par Rôle

L'interface s'adapte automatiquement au rôle de l'utilisateur connecté (RBAC côté API + filtrage côté UI) :

| Rôle | Ce qu'il voit / peut faire |
|------|----------------------------|
| **Administrateur** | Accès complet : utilisateurs, branches, groupes, modules, planning, paiements, automatisation OpenClaw |
| **Scolarité** | Gestion des étudiants, groupes, paiements et notifications ; relances automatiques |
| **Enseignant** | Son propre planning, marquage des présences de ses groupes, saisie & sauvegarde des **notes** par module |
| **Étudiant** | Son emploi du temps, son **relevé d'absences** et son **relevé de notes** (lecture seule), ses paiements |

---

## 🛠️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| **API Backend** | Node.js 20, Express 4, TypeScript 5 |
| **Validation** | Zod (schéma sur chaque route) |
| **ORM / Base de données** | Prisma 6 + PostgreSQL 16 |
| **Cache & Sessions** | Redis 7 (ioredis) |
| **Sécurité** | JWT, bcrypt, Helmet, Rate-Limiting, RBAC |
| **Email** | Nodemailer (SMTP sortant + IMAP lecture) |
| **Bot** | Telegram Bot API (polling) |
| **Frontend** | React 18 (Babel standalone), CSS variables, Outfit font |
| **Documentation** | Swagger UI + JSDoc OpenAPI annotations |
| **Infra** | Docker Compose (local), Render/Railway (cloud) |

---

## 🚀 Guide de Lancement Rapide

> **Prérequis :** [Node.js 20+](https://nodejs.org/) et [Docker Desktop](https://www.docker.com/products/docker-desktop/) doivent être installés et en cours d'exécution.

### Étape 1 — Cloner le dépôt

```bash
git clone https://github.com/Hamza00-1/CampusOps-.git
cd CampusOps-
```

### Étape 2 — Créer le fichier de configuration

Créez le fichier `backend/.env` avec le contenu suivant (copier-coller tel quel) :

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
RATE_LIMIT_MAX_REQUESTS=10000
CORS_ORIGIN=*
LOG_LEVEL=debug
```

### Étape 3 — Démarrer les bases de données (Docker)

```bash
cd backend
docker compose up -d db redis
```

> ✅ Attendez ~10 secondes que PostgreSQL et Redis soient complètement démarrés.

### Étape 4 — Installer les dépendances et initialiser la base de données

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

> ✅ La commande `db:seed` injecte automatiquement **5 comptes EIDIA réels**, des modules, des groupes, un planning et des données de test.

### Étape 5 — Démarrer le serveur API

```bash
npm run dev
```

> ✅ Le serveur démarre sur **http://localhost:3000**. Vous devriez voir dans le terminal :
> ```
> 🐘 PostgreSQL connected
> 🔴 Redis connected
> 📧 SMTP transport ready
> 🚀 CampusOps API running on port 3000
> ```

### Étape 6 — Ouvrir le Frontend (dans un second terminal)

```bash
cd ..
cd CompusOS_Frontend
npx --yes serve -l 5173
```

Puis ouvrir dans le navigateur :

> **👉 http://localhost:5173/CampusOps.html**

---

## 🔑 Comptes de Test (pré-chargés)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Administrateur** | `hamza.khchichine@eidia.ueuromed.org` | `CampusOps@2026` |
| **Scolarité** | `karima.eddahhak@eidia.ueuromed.org` | `CampusOps@2026` |
| **Enseignant** | `imad.adnane@eidia.ueuromed.org` | `CampusOps@2026` |
| **Étudiant** | `siham.lyzoul@eidia.ueuromed.org` | `CampusOps@2026` |
| **Étudiant** | `brahim.nakkar@eidia.ueuromed.org` | `CampusOps@2026` |

> 💡 Les identifiants sont **pré-remplis automatiquement** sur la page de connexion. Cliquez simplement sur un rôle, puis sur "Se connecter".

---

## 📖 Documentation API (Swagger)

Une interface interactive est disponible pour tester les 50+ endpoints sans outil tiers :

> **👉 http://localhost:3000/api/docs**

Elle permet d'exécuter directement des requêtes GET/POST/PUT/DELETE avec authentification Bearer JWT.

---

## ⚠️ Note sur la Livraison des Emails

> Le système d'envoi d'emails fonctionne via un serveur SMTP Gmail standard. Les emails arrivent parfaitement sur des adresses personnelles (ex: `@gmail.com`, `@yahoo.com`). Cependant, **les pare-feu des adresses institutionnelles** comme `@eidia.ueuromed.org` bloquent ou filtrent souvent les emails automatisés provenant d'expéditeurs sans signature SPF/DKIM officielle. Ce comportement est standard en sécurité réseau.
>
> **Pour tester la fonctionnalité :** Utilisez une adresse Gmail personnelle comme email de compte dans la base de données. Les logs du terminal confirment également l'envoi avec succès côté serveur.

---

## 📁 Structure du Projet

```
CampusOps-/
│
├── 📄 README.md                          ← Ce fichier
├── 📄 DEPLOYMENT.md                      ← Guide de déploiement cloud
├── 📄 CONTRIBUTING.md                    ← Conventions de développement
├── 📄 CampusOps_Roadmap.md               ← Feuille de route du projet
├── 📄 render.yaml / railway.json         ← Configurations de déploiement cloud
│
├── 📁 doc/
│   ├── Cahier_des_Charges.md             ← Spécifications fonctionnelles & ERD
│   ├── OpenClaw_Integration_Report.md    ← Rapport d'intégration webhooks
│   ├── progress.md                       ← Journal d'avancement
│   ├── spec_text.txt                     ← Extrait texte du sujet
│   └── Projet de fin de semestre.docx    ← Énoncé original du professeur
│
├── 📁 CompusOS_Frontend/
│   ├── CampusOps.html                    ← Point d'entrée de l'application (React via Babel)
│   └── co2/
│       ├── api.js                        ← Client API (JWT auto-refresh)
│       ├── data.js                       ← Constantes EIDIA & helpers i18n
│       ├── login.jsx                     ← Connexion + Forgot/Reset Password
│       ├── app.jsx                       ← Racine React, hydratation de session & sync des données live
│       ├── shell.jsx                     ← Sidebar + Topbar
│       ├── pages1.jsx                    ← Dashboard · Planning · Présences · Modules · Notes
│       ├── pages2.jsx                    ← Paiements · Utilisateurs · Groupes · Notifications · Progression · Paramètres · Automation
│       └── styles.css                    ← Système de design (thèmes clair/sombre)
│
├── 📁 team-setup-guide/                  ← Guide d'installation pour l'équipe
│
└── 📁 backend/
    ├── docker-compose.yml                ← PostgreSQL 16 + Redis 7
    ├── Dockerfile                        ← Build multi-étapes (production)
    ├── prisma/
    │   ├── schema.prisma                 ← 11 modèles, 6 enums
    │   └── seed.ts                       ← Données EIDIA réelles (planning ancré sur la semaine courante)
    └── src/
        ├── config/                       ← env, database, redis, swagger
        ├── middleware/                   ← auth JWT, RBAC, validation Zod, logs Winston
        ├── modules/                      ← 13 modules métier (voir ci-dessous)
        ├── services/                     ← email.service.ts, telegram.service.ts
        ├── integrations/                 ← openclaw (webhooks), email (IMAP/SMTP)
        └── utils/                        ← jwt.ts, hash.ts, response.ts
```

> **13 modules backend** : `auth` · `users` · `branches` · `modules` · `groups` · `planning` · `absences` · `grades` · `progress` · `payments` · `notifications` · `telegram` · `mail`

---

## 📡 Résumé des Endpoints API

| Module | Endpoints clés |
|--------|---------------|
| **Auth** | `POST /login` · `/register` · `/refresh` · `/logout` · `POST /forgot-password` · `POST /reset-password` |
| **Branches** | CRUD complet |
| **Users** | CRUD + recherche + filtre par rôle/branche |
| **Modules** | CRUD (par branche) |
| **Groups** | CRUD + inscription/désinscription étudiants |
| **Planning** | CRUD + `GET /today` + `GET /week` (adapté au rôle) |
| **Absences** | Marquage individuel/masse, justification, statistiques par étudiant |
| **Grades** | `GET /grades` (filtres) · `POST /grades/bulk` (upsert) · `GET /grades/transcript/:studentId` |
| **Progress** | Upsert par module/groupe, résumé de groupe |
| **Payments** | CRUD + filtre retards + résumé étudiant + **reçu email automatique** |
| **Notifications** | Liste + compteur non-lus + marquer lu/tous lus |
| **Telegram** | Liaison/déliaison compte, message de test |
| **OpenClaw** | `POST /trigger/daily-planning` · `POST /webhook` |

---

## 👥 Équipe du Projet

| Nom | Rôle |
|-----|------|
| **Hamza Khchichine** | Lead Developer — Architecture, Backend, Frontend |
| **Brahim Nakkar** | Développeur — Intégration & Tests |
| **Karima Ed Dahhak** | Développeur — Gestion Scolarité & Paiements |
| **Imad Adnane** | Développeur — Module Enseignant & Planning |
| **Siham Lyzoul** | Développeur — Interface Étudiant & Notifications |

*EIDIA — Université Euro-Méditerranéenne de Fès (UEMF)*

---

*Projet réalisé dans le cadre du module Cloud Computing & Applications Réparties — 2025/2026*
