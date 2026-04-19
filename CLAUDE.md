# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Framework**: Next.js 16.2 (App Router, Turbopack), React 19, TypeScript
- **DB**: libSQL via `@libsql/client` — local file in dev, Turso in prod. Drizzle ORM for schema + queries.
- **Auth**: `iron-session` (cookies httpOnly firmadas). Edge proxy en `src/proxy.ts` protege rutas privadas.
- **Styling**: Tailwind CSS v4 + CSS custom properties (design tokens en `globals.css`).
- **Icons**: `lucide-react`.
- **Validación**: Zod.

Este proyecto fue reescrito desde Express + vanilla JS (v1). El código v1 vive en `legacy/` (gitignored, local solo) y en la rama `legacy-express-app`.

## Commands

```bash
npm install           # instalar deps
npm run dev           # Next.js dev server (http://localhost:3000)
npm run build         # build prod
npm run start         # start tras build
npm run lint          # ESLint

npm run db:generate   # drizzle-kit: generar migraciones desde el schema
npm run db:push       # drizzle-kit: aplicar schema a la DB
npm run db:studio     # abrir Drizzle Studio
npm run db:seed       # sembrar los 11 bloques maestros base (idempotente)
npm run db:create-admin                      # crea o resetea admin — password aleatoria segura
npm run db:create-admin -- "MiPass123!"      # con password específica
npm run db:create-admin -- "MiPass" "admin@mi-org.com"  # password + email (solo al crear)

npx tsx scripts/smoke-db.ts       # verificar conexión + lectura DB
```

No hay Docker en v2 (dev directo con Next). Deploy: Vercel + Turso (free tier).

## Architecture

### Routing (App Router)

- `src/app/(app)/` — **route group** con el shell compartido (header + nav). Todas las rutas autenticadas viven aquí.
  - `page.tsx` — lista de newsletters (dashboard)
  - `master-sections/page.tsx` — admin-only
  - `newsletters/new/page.tsx`, `newsletters/[id]/page.tsx`
- `src/app/login/page.tsx`, `src/app/reset-password/page.tsx` — fuera del route group, sin shell.
- `src/app/api/auth/*` — endpoints REST (login, logout, register, forgot, validate-token, reset, me).

### Autenticación

- `src/lib/session.ts` define `getSession`, `requireSession` (redirige a /login si no hay sesión), `requireAdmin` (404 si no es admin). La sesión es un objeto `SessionData` firmado con `SESSION_SECRET`.
- `src/proxy.ts` (Next 16 renombró `middleware` → `proxy`) intercepta todo, redirige según el estado de sesión.
- **No usar JWT ni localStorage** — las sesiones son cookies httpOnly. Esto evita el problema de extensiones inyectando scripts en inputs `type="password"` que afectó al v1.

### DB + modelo

- `src/lib/db/schema.ts` es la **fuente de verdad** del schema. Los nombres de columna calzan con la DB v1 (`password_hash`, `section_order`, etc.) para que la data existente se lea sin migración.
- El content de secciones se guarda como JSON en columna `TEXT` (`mode: "json"` en Drizzle). Tipo: `{ html: string }`.
- **Modelo de copias** (preservado del v1): `newsletter_sections` son **copias** de `master_sections`. Editar una copia nunca toca el maestro. `master_section_id` queda como back-reference opcional.
- Soft-delete para master_sections (`is_active`). Sesiones de reset token tienen flag `used` + expiración.

### Convenciones

- Nombres de variables/funciones y UI copy en **español** (mantenido del v1).
- Server components por defecto, `"use client"` solo donde hay interactividad.
- API routes: `src/app/api/*/route.ts` con exports `GET`/`POST`/etc.
- Validar inputs con Zod antes de tocar DB.
- Para mutaciones desde cliente: `fetch("/api/...", { method: "POST", ... })` + `router.refresh()` tras éxito para revalidar server components.
