# Spare Mec — Automotive Spare Parts Platform

Monorepo for the Spare Mec e-commerce storefront, CRM/Admin panel, and backend API.

> **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · **Delivery plan:** [docs/ROADMAP.md](docs/ROADMAP.md)

## Stack

| Layer       | Tech                                                        |
| ----------- | ----------------------------------------------------------- |
| Storefront  | React 18 (CRA), React Router, TailwindCSS, framer-motion    |
| Admin / CRM | React + Vite + TypeScript, TailwindCSS, TanStack Query      |
| API         | Node.js + Express + TypeScript                              |
| Database    | MongoDB + Mongoose (single-node replica set for txns)       |
| Images      | Cloudinary (signed direct uploads)                          |
| Auth        | JWT (in-memory access + httpOnly refresh cookie) + Google   |

## Layout

```
apps/
  api/         Express + TypeScript REST API
  admin/       React + Vite admin / CRM panel
  storefront/  Existing customer storefront (CRA)
packages/
  shared/      Canonical enums, RBAC permission map, types, helpers (@sm/shared)
docs/          Architecture + roadmap
```

## Quickstart

```bash
# 1. Install all workspaces
npm install

# 2. Build the shared contracts package (api + admin depend on it)
npm run build:shared

# 3. Start MongoDB (Docker) — single-node replica set
npm run db:up

# 4. Configure env (copy examples, fill secrets)
cp apps/api/.env.example apps/api/.env
cp apps/admin/.env.example apps/admin/.env

# 5. Seed a Super Admin account
npm run seed:admin

# 6. Run everything (api :4000, admin :5173, storefront :3000)
npm run dev
```

## Workspace scripts

- `npm run dev` — run api, admin, and storefront together
- `npm run build` — build shared, api, admin
- `npm run typecheck` — type-check all TypeScript workspaces
- `npm run format` — Prettier write
