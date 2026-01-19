# Implementation Plan - Kita App

## Status Legend
- `[ ]` Pending
- `[~]` In Progress
- `[x]` Completed

---

## Phase 0: Dependencies & Setup

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 0.1 | Install better-auth | `[ ]` | [specs/00-dependencies.md](specs/00-dependencies.md) |
| 0.2 | Install bits-ui | `[ ]` | [specs/00-dependencies.md](specs/00-dependencies.md) |
| 0.3 | Configure project fonts | `[ ]` | [specs/00-dependencies.md](specs/00-dependencies.md) |

---

## Phase 1: Database Schema

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 1.1 | Define `gruppen` table | `[ ]` | [specs/01-database-schema.md](specs/01-database-schema.md) |
| 1.2 | Define `kinder` table | `[ ]` | [specs/01-database-schema.md](specs/01-database-schema.md) |
| 1.3 | Define `erzieher` table | `[ ]` | [specs/01-database-schema.md](specs/01-database-schema.md) |
| 1.4 | Define `dienstplan` table | `[ ]` | [specs/01-database-schema.md](specs/01-database-schema.md) |
| 1.5 | Define `mahlzeiten` table | `[ ]` | [specs/01-database-schema.md](specs/01-database-schema.md) |
| 1.6 | Define `ankuendigungen` table | `[ ]` | [specs/01-database-schema.md](specs/01-database-schema.md) |
| 1.7 | Run database migrations | `[ ]` | [specs/01-database-schema.md](specs/01-database-schema.md) |

---

## Phase 2: Authentication

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 2.1 | Configure better-auth with SQLite | `[ ]` | [specs/02-authentication.md](specs/02-authentication.md) |
| 2.2 | Create auth API route handler | `[ ]` | [specs/02-authentication.md](specs/02-authentication.md) |
| 2.3 | Create login page `/admin/login` | `[ ]` | [specs/02-authentication.md](specs/02-authentication.md) |
| 2.4 | Create admin layout with auth guard | `[ ]` | [specs/02-authentication.md](specs/02-authentication.md) |
| 2.5 | Add logout functionality | `[ ]` | [specs/02-authentication.md](specs/02-authentication.md) |

---

## Phase 3: File Uploads

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 3.1 | Create upload API endpoint | `[ ]` | [specs/03-file-uploads.md](specs/03-file-uploads.md) |
| 3.2 | Create uploads directory | `[ ]` | [specs/03-file-uploads.md](specs/03-file-uploads.md) |
| 3.3 | Create reusable photo upload component | `[ ]` | [specs/03-file-uploads.md](specs/03-file-uploads.md) |

---

## Phase 4: Groups Management

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 4.1 | Create groups list page `/admin/gruppen` | `[ ]` | [specs/04-groups-management.md](specs/04-groups-management.md) |
| 4.2 | Create add group form | `[ ]` | [specs/04-groups-management.md](specs/04-groups-management.md) |
| 4.3 | Create edit group form | `[ ]` | [specs/04-groups-management.md](specs/04-groups-management.md) |
| 4.4 | Implement delete group | `[ ]` | [specs/04-groups-management.md](specs/04-groups-management.md) |

---

## Phase 5: Children Management

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 5.1 | Create children list page `/admin/kinder` | `[ ]` | [specs/05-children-management.md](specs/05-children-management.md) |
| 5.2 | Create add child form with photo upload | `[ ]` | [specs/05-children-management.md](specs/05-children-management.md) |
| 5.3 | Create edit child form | `[ ]` | [specs/05-children-management.md](specs/05-children-management.md) |
| 5.4 | Implement delete child | `[ ]` | [specs/05-children-management.md](specs/05-children-management.md) |
| 5.5 | Add search/filter functionality | `[ ]` | [specs/05-children-management.md](specs/05-children-management.md) |

---

## Phase 6: Teachers Management

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 6.1 | Create teachers list page `/admin/erzieher` | `[ ]` | [specs/06-teachers-management.md](specs/06-teachers-management.md) |
| 6.2 | Create add teacher form with photo upload | `[ ]` | [specs/06-teachers-management.md](specs/06-teachers-management.md) |
| 6.3 | Create edit teacher form | `[ ]` | [specs/06-teachers-management.md](specs/06-teachers-management.md) |
| 6.4 | Implement delete teacher | `[ ]` | [specs/06-teachers-management.md](specs/06-teachers-management.md) |

---

## Phase 7: Schedule Management

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 7.1 | Create schedule page `/admin/dienstplan` | `[ ]` | [specs/07-schedule-management.md](specs/07-schedule-management.md) |
| 7.2 | Create weekly calendar view | `[ ]` | [specs/07-schedule-management.md](specs/07-schedule-management.md) |
| 7.3 | Create time slot picker component | `[ ]` | [specs/07-schedule-management.md](specs/07-schedule-management.md) |
| 7.4 | Implement add/edit/delete schedule entries | `[ ]` | [specs/07-schedule-management.md](specs/07-schedule-management.md) |

---

## Phase 8: Meal Planning

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 8.1 | Create meal planning page `/admin/speiseplan` | `[ ]` | [specs/08-meal-planning.md](specs/08-meal-planning.md) |
| 8.2 | Create weekly meal planner view | `[ ]` | [specs/08-meal-planning.md](specs/08-meal-planning.md) |
| 8.3 | Implement add/edit/delete meals | `[ ]` | [specs/08-meal-planning.md](specs/08-meal-planning.md) |

---

## Phase 9: Announcements

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 9.1 | Create announcements page `/admin/ankuendigungen` | `[ ]` | [specs/09-announcements.md](specs/09-announcements.md) |
| 9.2 | Create add/edit announcement form | `[ ]` | [specs/09-announcements.md](specs/09-announcements.md) |
| 9.3 | Implement validity period (from/until dates) | `[ ]` | [specs/09-announcements.md](specs/09-announcements.md) |
| 9.4 | Implement priority levels | `[ ]` | [specs/09-announcements.md](specs/09-announcements.md) |

---

## Phase 10: Public Dashboard

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 10.1 | Create dashboard layout (widescreen optimized) | `[ ]` | [specs/10-dashboard.md](specs/10-dashboard.md) |
| 10.2 | Implement announcements section | `[ ]` | [specs/10-dashboard.md](specs/10-dashboard.md) |
| 10.3 | Implement birthday section | `[ ]` | [specs/10-dashboard.md](specs/10-dashboard.md) |
| 10.4 | Implement meals section | `[ ]` | [specs/10-dashboard.md](specs/10-dashboard.md) |
| 10.5 | Implement teachers on duty section | `[ ]` | [specs/10-dashboard.md](specs/10-dashboard.md) |
| 10.6 | Implement auto-refresh (30s polling) | `[ ]` | [specs/10-dashboard.md](specs/10-dashboard.md) |
| 10.7 | Add entrance animations | `[ ]` | [specs/10-dashboard.md](specs/10-dashboard.md) |

---

## Phase 11: Seed Data & Testing

| # | Task | Status | Spec File |
|---|------|--------|-----------|
| 11.1 | Create seed script with demo data | `[ ]` | [specs/11-seed-data.md](specs/11-seed-data.md) |
| 11.2 | Write E2E tests for login flow | `[ ]` | [specs/12-testing.md](specs/12-testing.md) |
| 11.3 | Write E2E tests for CRUD operations | `[ ]` | [specs/12-testing.md](specs/12-testing.md) |
| 11.4 | Write E2E tests for dashboard display | `[ ]` | [specs/12-testing.md](specs/12-testing.md) |

---

## Summary

| Phase | Tasks | Completed |
|-------|-------|-----------|
| 0. Dependencies & Setup | 3 | 0 |
| 1. Database Schema | 7 | 0 |
| 2. Authentication | 5 | 0 |
| 3. File Uploads | 3 | 0 |
| 4. Groups Management | 4 | 0 |
| 5. Children Management | 5 | 0 |
| 6. Teachers Management | 4 | 0 |
| 7. Schedule Management | 4 | 0 |
| 8. Meal Planning | 3 | 0 |
| 9. Announcements | 4 | 0 |
| 10. Public Dashboard | 7 | 0 |
| 11. Seed Data & Testing | 4 | 0 |
| **Total** | **53** | **0** |
