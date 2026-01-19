# Implementation Plan - Kita App

> **Last Updated**: 2026-01-19
>
> **Project Goal**: Build a kindergarten management application with admin CRUD interfaces for managing groups, children, teachers, schedules, meals, and announcements, plus a public dashboard for entrance display.

## Current State Analysis

### What's Already Implemented
- SvelteKit v5.45.6 project scaffolding with Svelte 5
- SQLite + Drizzle ORM v0.45.0 infrastructure (but only placeholder `user` table with `id`, `age`)
- Tailwind CSS v4.1.17 configured via Vite
- `better-sqlite3` v12.5.0 installed
- Playwright v1.57.0 configured with placeholder test (`e2e/demo.test.js` - only checks h1 visibility)
- TypeScript support configured
- Database npm scripts: `db:push`, `db:generate`, `db:migrate`, `db:studio`
- Basic routes: `/src/routes/+layout.svelte`, `/src/routes/+page.svelte` (default SvelteKit welcome page)

### What's Missing (All Spec Items)

**Phase 0 - Dependencies**:
- `better-auth` package NOT installed
- `bits-ui` package NOT installed
- Google Fonts (Fraunces, Nunito) NOT configured in `app.html`
- Font CSS variables NOT defined

**Phase 1 - Database**:
- All 6 required tables missing: `gruppen`, `kinder`, `erzieher`, `dienstplan`, `mahlzeiten`, `ankuendigungen`
- Drizzle relations NOT defined
- Migrations NOT run

**Phase 2 - Authentication**:
- `/src/lib/server/auth.js` - NOT EXISTS
- `/src/lib/auth-client.js` - NOT EXISTS
- `/src/routes/api/auth/[...all]/+server.js` - NOT EXISTS
- `/src/routes/admin/login/+page.svelte` - NOT EXISTS
- No admin routes exist at all

**Phase 3 - File Uploads**:
- `/static/uploads/` directory - NOT EXISTS
- `/src/routes/api/upload/+server.js` - NOT EXISTS
- `/src/lib/components/` directory - NOT EXISTS

**Phases 4-9 - Admin CRUD Routes**:
- All admin routes missing: `/admin/gruppen`, `/admin/kinder`, `/admin/erzieher`, `/admin/dienstplan`, `/admin/speiseplan`, `/admin/ankuendigungen`

**Phase 10 - Dashboard**:
- Current `+page.svelte` is default SvelteKit template (needs complete replacement)
- `Clock.svelte` component - NOT EXISTS
- No dashboard sections implemented

**Phase 11 - Seed & Testing**:
- `/scripts/` directory - NOT EXISTS
- `/scripts/seed.js` - NOT EXISTS
- E2E tests for auth/CRUD/dashboard - NOT EXISTS

---

## Status Legend
- `[ ]` Pending
- `[~]` In Progress
- `[x]` Completed

---

## Phase 0: Dependencies & Setup (Priority: CRITICAL)

> Must complete first - blocks all other phases.

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 0.1 | Install better-auth | `[x]` | [specs/00-dependencies.md](specs/00-dependencies.md) | Required for auth |
| 0.2 | Install bits-ui | `[x]` | [specs/00-dependencies.md](specs/00-dependencies.md) | UI component library |
| 0.3 | Configure Google Fonts (Fraunces, Nunito) | `[x]` | [specs/00-dependencies.md](specs/00-dependencies.md) | Update app.html + layout.css |

---

## Phase 1: Database Schema (Priority: CRITICAL)

> Must complete before any CRUD features. Current schema.js only has a placeholder `user` table.

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 1.1 | Define `gruppen` table | `[x]` | [specs/01-database-schema.md](specs/01-database-schema.md) | id, name, farbe, timestamps |
| 1.2 | Define `kinder` table | `[x]` | [specs/01-database-schema.md](specs/01-database-schema.md) | FK to gruppen |
| 1.3 | Define `erzieher` table | `[x]` | [specs/01-database-schema.md](specs/01-database-schema.md) | unique email |
| 1.4 | Define `dienstplan` table | `[x]` | [specs/01-database-schema.md](specs/01-database-schema.md) | FK to erzieher |
| 1.5 | Define `mahlzeiten` table | `[x]` | [specs/01-database-schema.md](specs/01-database-schema.md) | typ: fruehstueck/mittagessen/snack |
| 1.6 | Define `ankuendigungen` table | `[x]` | [specs/01-database-schema.md](specs/01-database-schema.md) | prioritaet: normal/wichtig |
| 1.7 | Add Drizzle relations | `[x]` | [specs/01-database-schema.md](specs/01-database-schema.md) | For proper joins |
| 1.8 | Run database migrations (`bun run db:push`) | `[x]` | [specs/01-database-schema.md](specs/01-database-schema.md) | Creates all tables |

---

## Phase 2: Authentication (Priority: HIGH)

> Blocks all admin routes. Depends on Phase 0 (better-auth) and Phase 1 (database).

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 2.1 | Create `src/lib/server/auth.js` | `[x]` | [specs/02-authentication.md](specs/02-authentication.md) | better-auth config with SQLite |
| 2.2 | Create `src/lib/auth-client.js` | `[x]` | [specs/02-authentication.md](specs/02-authentication.md) | Client-side auth |
| 2.3 | Create auth API route `/api/auth/[...all]` | `[x]` | [specs/02-authentication.md](specs/02-authentication.md) | Handles auth endpoints |
| 2.4 | Create login page `/admin/login` | `[x]` | [specs/02-authentication.md](specs/02-authentication.md) | German labels |
| 2.5 | Create admin layout with auth guard | `[x]` | [specs/02-authentication.md](specs/02-authentication.md) | +layout.server.js + +layout.svelte |
| 2.6 | Add logout functionality | `[x]` | [specs/02-authentication.md](specs/02-authentication.md) | Button in admin header |

---

## Phase 3: File Uploads (Priority: MEDIUM)

> Needed before children/teachers management for photo uploads.

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 3.1 | Create `static/uploads/` directory with `.gitkeep` | `[x]` | [specs/03-file-uploads.md](specs/03-file-uploads.md) | Storage location |
| 3.2 | Create upload API endpoint | `[x]` | [specs/03-file-uploads.md](specs/03-file-uploads.md) | Validate type/size, generate UUID filename |
| 3.3 | Create PhotoUpload.svelte component | `[x]` | [specs/03-file-uploads.md](specs/03-file-uploads.md) | Preview, loading, error states |

---

## Phase 4: Groups Management (Priority: MEDIUM)

> Simplest CRUD - good starting point. Required before children (FK dependency).

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 4.1 | Create groups list page `/admin/gruppen` | `[x]` | [specs/04-groups-management.md](specs/04-groups-management.md) | Sorted alphabetically |
| 4.2 | Create add group form | `[x]` | [specs/04-groups-management.md](specs/04-groups-management.md) | Color picker with 10 presets |
| 4.3 | Create edit group form | `[x]` | [specs/04-groups-management.md](specs/04-groups-management.md) | Pre-filled values |
| 4.4 | Implement delete group with protection | `[x]` | [specs/04-groups-management.md](specs/04-groups-management.md) | Block if has children |

---

## Phase 5: Children Management (Priority: MEDIUM)

> Depends on Phase 3 (file uploads) and Phase 4 (groups).

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 5.1 | Create children list page `/admin/kinder` | `[x]` | [specs/05-children-management.md](specs/05-children-management.md) | Photo, name, birthday, group badge |
| 5.2 | Create add child form with photo upload | `[x]` | [specs/05-children-management.md](specs/05-children-management.md) | Uses PhotoUpload component |
| 5.3 | Create edit child form | `[x]` | [specs/05-children-management.md](specs/05-children-management.md) | Pre-filled with existing photo |
| 5.4 | Implement delete child | `[x]` | [specs/05-children-management.md](specs/05-children-management.md) | Confirmation dialog |
| 5.5 | Add search/filter functionality | `[x]` | [specs/05-children-management.md](specs/05-children-management.md) | Client-side search, group dropdown filter |

---

## Phase 6: Teachers Management (Priority: MEDIUM)

> Depends on Phase 3 (file uploads). Required before schedule management.

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 6.1 | Create teachers list page `/admin/erzieher` | `[x]` | [specs/06-teachers-management.md](specs/06-teachers-management.md) | Photo, name, email |
| 6.2 | Create add teacher form with photo upload | `[x]` | [specs/06-teachers-management.md](specs/06-teachers-management.md) | Email uniqueness validation |
| 6.3 | Create edit teacher form | `[x]` | [specs/06-teachers-management.md](specs/06-teachers-management.md) | Pre-filled values |
| 6.4 | Implement delete teacher with protection | `[x]` | [specs/06-teachers-management.md](specs/06-teachers-management.md) | Block if has schedule entries |

---

## Phase 7: Schedule Management (Priority: MEDIUM)

> Depends on Phase 6 (teachers).

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 7.1 | Create schedule page `/admin/dienstplan` | `[x]` | [specs/07-schedule-management.md](specs/07-schedule-management.md) | Week navigation |
| 7.2 | Create weekly calendar grid view | `[x]` | [specs/07-schedule-management.md](specs/07-schedule-management.md) | Rows=teachers, Cols=Mon-Fri |
| 7.3 | Create TimeSlotPicker component | `[x]` | [specs/07-schedule-management.md](specs/07-schedule-management.md) | Presets: Frühdienst, Spätdienst, Ganztag |
| 7.4 | Implement add/edit/delete schedule entries | `[x]` | [specs/07-schedule-management.md](specs/07-schedule-management.md) | Date helpers |

---

## Phase 8: Meal Planning (Priority: MEDIUM)

> Independent of other CRUD phases. Only needs database.

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 8.1 | Create meal planning page `/admin/speiseplan` | `[x]` | [specs/08-meal-planning.md](specs/08-meal-planning.md) | Week view |
| 8.2 | Create weekly meal planner grid | `[x]` | [specs/08-meal-planning.md](specs/08-meal-planning.md) | Rows=meal types, Cols=Mon-Fri |
| 8.3 | Implement add/edit/delete meals | `[x]` | [specs/08-meal-planning.md](specs/08-meal-planning.md) | Prevent duplicates per type/date |

---

## Phase 9: Announcements (Priority: MEDIUM)

> Independent of other CRUD phases. Only needs database.

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 9.1 | Create announcements page `/admin/ankuendigungen` | `[x]` | [specs/09-announcements.md](specs/09-announcements.md) | List with status badges |
| 9.2 | Create add/edit announcement form | `[x]` | [specs/09-announcements.md](specs/09-announcements.md) | Date pickers |
| 9.3 | Implement validity period logic | `[x]` | [specs/09-announcements.md](specs/09-announcements.md) | gueltigVon <= gueltigBis |
| 9.4 | Implement priority levels | `[x]` | [specs/09-announcements.md](specs/09-announcements.md) | normal/wichtig with visual indicators |

---

## Phase 10: Public Dashboard (Priority: HIGH)

> The main deliverable. Depends on all data being in database.

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 10.1 | Create dashboard layout (16:9 widescreen) | `[x]` | [specs/10-dashboard.md](specs/10-dashboard.md) | Replace current +page.svelte |
| 10.2 | Create Clock component | `[x]` | [specs/10-dashboard.md](specs/10-dashboard.md) | Updates every second, German locale |
| 10.3 | Implement announcements section | `[x]` | [specs/10-dashboard.md](specs/10-dashboard.md) | Active only, wichtig highlighted |
| 10.4 | Implement birthday section | `[x]` | [specs/10-dashboard.md](specs/10-dashboard.md) | Today's birthdays with photos |
| 10.5 | Implement meals section | `[x]` | [specs/10-dashboard.md](specs/10-dashboard.md) | Today's 3 meals with icons |
| 10.6 | Implement teachers on duty section | `[x]` | [specs/10-dashboard.md](specs/10-dashboard.md) | Currently scheduled with photos |
| 10.7 | Implement auto-refresh (30s polling) | `[x]` | [specs/10-dashboard.md](specs/10-dashboard.md) | Client-side invalidation |
| 10.8 | Add entrance animations | `[x]` | [specs/10-dashboard.md](specs/10-dashboard.md) | Staggered fade-slide |

---

## Phase 11: Seed Data & Testing (Priority: LOW)

> Final polish. Seed data helps demo; tests ensure quality.

| # | Task | Status | Spec File | Notes |
|---|------|--------|-----------|-------|
| 11.1 | Create seed script `scripts/seed.js` | `[x]` | [specs/11-seed-data.md](specs/11-seed-data.md) | Demo data for all tables |
| 11.2 | Write E2E tests for login flow | `[x]` | [specs/12-testing.md](specs/12-testing.md) | 4 auth tests in e2e/auth.spec.js |
| 11.3 | Write E2E tests for CRUD operations | `[x]` | [specs/12-testing.md](specs/12-testing.md) | 9 tests for Groups, Children, Teachers in e2e/crud.spec.js |
| 11.4 | Write E2E tests for dashboard | `[x]` | [specs/12-testing.md](specs/12-testing.md) | 10 dashboard tests in e2e/dashboard.spec.js |

---

## Dependency Graph

```
Phase 0 (Dependencies)
    ├─→ Phase 1 (Database) ─→ Phase 2 (Auth) ─→ All Admin Routes
    │                      └─→ Phase 8 (Meals)
    │                      └─→ Phase 9 (Announcements)
    │
    └─→ Phase 3 (File Uploads) ─→ Phase 5 (Children)
                               └─→ Phase 6 (Teachers) ─→ Phase 7 (Schedule)

Phase 4 (Groups) ─→ Phase 5 (Children)

Phases 4-9 (All CRUD) ─→ Phase 10 (Dashboard)

Phase 10 (Dashboard) ─→ Phase 11 (Seed & Tests)
```

---

## Recommended Implementation Order

1. **Phase 0** - Install better-auth, bits-ui, configure fonts
2. **Phase 1** - Define all database tables and relations
3. **Phase 2** - Set up authentication system
4. **Phase 3** - File upload infrastructure
5. **Phase 4** - Groups CRUD (simplest, validates patterns)
6. **Phase 6** - Teachers CRUD (before children, needed for schedule)
7. **Phase 5** - Children CRUD (uses groups, photo upload)
8. **Phase 7** - Schedule management
9. **Phase 8** - Meal planning
10. **Phase 9** - Announcements
11. **Phase 10** - Public dashboard
12. **Phase 11** - Seed data and E2E tests

---

## Summary

| Phase | Tasks | Completed |
|-------|-------|-----------|
| 0. Dependencies & Setup | 3 | 3 |
| 1. Database Schema | 8 | 8 |
| 2. Authentication | 6 | 6 |
| 3. File Uploads | 3 | 3 |
| 4. Groups Management | 4 | 4 |
| 5. Children Management | 5 | 5 |
| 6. Teachers Management | 4 | 4 |
| 7. Schedule Management | 4 | 4 |
| 8. Meal Planning | 3 | 3 |
| 9. Announcements | 4 | 4 |
| 10. Public Dashboard | 8 | 8 |
| 11. Seed Data & Testing | 4 | 4 |
| **Total** | **56** | **56** |
