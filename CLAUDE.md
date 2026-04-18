# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Local (Node):
```bash
npm install           # install dependencies
npm run init-db       # create database/newsletters.db, seed admin user + default master sections
npm start             # run server (node server.js) on PORT (default 3001)
npm run dev           # run with nodemon auto-reload
```

Docker / Make (preferred for reproducible runs — `make help` lists everything):
```bash
make build            # build image
make up               # start container in background, port 3001
make init-db-docker   # run init-database.js inside the container (first time only)
make logs             # tail logs
make shell            # open shell inside the container
make down             # stop & remove container
make reset-db         # delete local DB file and reseed (destructive)
```

There is no test runner, linter, or build step configured. Frontend assets (`index.html`, `app.js`, `styles.css`) are served statically by Express — edits take effect on browser reload, no bundling required.

Reseeding the database: delete `database/newsletters.db`, then `npm run init-db` (or `make reset-db`). Seeded admin is `admin` / `admin123`.

## Architecture

Single-process Express app serving both the REST API and the static SPA from the project root.

The `Dockerfile` uses `node:20-alpine` and installs `python3`/`make`/`g++` only as a temporary build stage to compile native modules (`bcrypt`, `sqlite3`). `docker-compose.yml` mounts `./database` as a volume so `newsletters.db` persists across rebuilds — **do not** bake the DB into the image.

**Backend** (`server.js` → `routes/*.js` → `database/database.js`):
- `routes/auth.js` owns JWT auth and **exports the `authenticateToken` middleware used by the other route modules**. It also exports `JWT_SECRET` — currently hardcoded as `'innk-secret-key-2024'`. Move to env var before any non-local deployment.
- `routes/master-sections.js` — admin-only CRUD on reusable section templates (soft-deleted via `is_active`).
- `routes/newsletters.js` — user-scoped CRUD; every query filters by `req.user.id`, so a user can never see another user's newsletters.
- All DB access is raw `sqlite3` callbacks (not promises). Use parameterized queries; follow the existing nested-callback style when extending.

**Frontend** (`index.html` + `app.js` + `styles.css`):
- The entire SPA is one `MailingApp` class in `app.js` (~1700 lines). It manages auth state, view switching (`switchView`), modals, and all API calls against `/api`.
- There is no framework, no module system, no build — just one global class instantiated on load. When adding features, extend `MailingApp` rather than introducing new files/frameworks.
- JWT is stored in `localStorage` and attached as `Authorization: Bearer` on every fetch.

## The section-copy model (most important domain concept)

Master sections and newsletter sections are **decoupled by design**:

- `master_sections` — the admin-managed library of reusable content blocks.
- `newsletter_sections` — **independent copies**. When a user adds a master section to a newsletter, the row's `title`/`content` are copied in and `master_section_id` is kept only as a back-reference. Editing a newsletter section sets `is_customized = 1` and never mutates the master. Editing or deleting a master section must never cascade into existing newsletter sections.

Preserve this invariant when touching either route file or the schema. Reordering is done via `section_order` on `newsletter_sections`.

## Schema

Defined only in `init-database.js` (no migrations framework). If you change a table, update `init-database.js` AND document that existing DBs must be recreated — there is no upgrade path.

Tables: `users`, `master_sections`, `newsletters`, `newsletter_sections`, `templates`. Foreign keys are enabled (`PRAGMA foreign_keys = ON` in `database/database.js`) but not declared in the `CREATE TABLE` statements — relationships are enforced in application code.

## Conventions

- UI copy, code comments, commit messages, and error strings in this repo are in Spanish. Match the existing language when editing.
- Roles are `'admin'` | `'user'`; admin-gating is done by combining `authenticateToken` + `requireAdmin` from `routes/auth.js`.
