# Kita v2.0 Implementation Plan

> **Last Updated:** 2026-01-19
> **Status:** Phase 1 complete. Ready for Phase 2 (HIGH priority items).

## Overview

This document tracks the implementation status and priority of all features for the Kindergarten Management System. Items are organized by completion status and priority level.

---

## COMPLETED

### Phase 1 - Core Application

- [x] **Database schema** (`src/lib/server/db/schema.js`)
  - Tables: `user`, `session`, `account`, `verification` (Better-Auth)
  - Tables: `gruppen`, `kinder`, `erzieher`, `dienstplan`, `mahlzeiten`, `ankuendigungen`
  - All relations defined with Drizzle ORM

- [x] **Authentication system** (`src/lib/server/auth.js`)
  - Better-Auth with email/password enabled
  - Session management working

- [x] **Admin dashboard** (`src/routes/admin/`)
  - Full CRUD for groups (`/admin/gruppen`)
  - Full CRUD for children (`/admin/kinder`)
  - Full CRUD for teachers (`/admin/erzieher`)
  - Full CRUD for schedules (`/admin/dienstplan`)
  - Full CRUD for meals (`/admin/speiseplan`)
  - Full CRUD for announcements (`/admin/ankuendigungen`)
  - Login page (`/admin/login`)

- [x] **Public dashboard** (`src/routes/+page.svelte`)
  - Today's birthdays display
  - Today's meals display
  - Teachers on duty display
  - Active announcements display

- [x] **File upload system** (`src/lib/components/PhotoUpload.svelte`)
  - Photo uploads for children and teachers
  - API endpoint at `/api/upload`

- [x] **Shared components** (`src/lib/components/`)
  - `Clock.svelte` - Live clock display
  - `TimeSlotPicker.svelte` - Schedule time selection
  - `PhotoUpload.svelte` - Image upload handling

- [x] **E2E test suite** (`e2e/`)
  - 19 active tests covering auth, CRUD operations, and dashboard
  - Tests for authentication flow
  - Tests for all admin CRUD operations
  - Tests for public dashboard functionality

- [x] **Basic seed script** (`scripts/seed.js`)
  - Single monolithic profile with demo data
  - Creates groups, children, teachers, schedules, meals, announcements

- [x] **Specification documents** (`specs/`)
  - 13 spec files covering all core features

- [x] **Modular seed system** (`scripts/seed.js` and `scripts/seeds/`)
  - Created modular seed system with 3 distinct profiles: testing, demo, inspection
  - CLI orchestrator with `-p`/`--profile` flag support (includes `--help` documentation)
  - **Testing profile** (`scripts/seeds/testing.js`):
    - Deterministic data for E2E tests
    - Uses `test-` prefixed IDs (e.g., `test-group-1`, `test-child-1`)
    - Minimal data: 2 groups, 3 children, 2 teachers
    - Fixed dates relative to test execution
  - **Demo profile** (`scripts/seeds/demo.js`):
    - Realistic showcase data for demonstrations
    - 5 groups with German names
    - 25 children with realistic German names
    - 8 teachers
    - 2 weeks of schedules, meals, and announcements
  - **Inspection profile** (`scripts/seeds/inspection.js`):
    - Edge case testing: long names, special characters, boundary dates
    - XSS/injection test strings
    - Empty and overcrowded groups
  - Fixed dashboard meals test to use exact match to avoid false positives
  - Enables reliable E2E testing and faster development iteration

- [x] **Children Dashboard (Kiosk View)** (`src/routes/kinder-ansicht/`)
  - Created `/kinder-ansicht` route for child-friendly kiosk display
  - Playful design with bright colors, animated clouds and sun
  - Large touch-friendly UI optimized for tablets/TVs
  - Shows birthdays with celebratory confetti animations
  - Displays today's meals, teachers on duty, and important announcements
  - Important announcements displayed as scrolling banner
  - Auto-refresh every 2 minutes for up-to-date information
  - Added 6 E2E tests for kiosk functionality covering:
    - Page rendering and accessibility
    - Birthday displays and confetti animations
    - Meal information display
    - Teacher duty information
    - Announcements display
    - Auto-refresh functionality

---

## HIGH PRIORITY (Implement Next)

These items have no external dependencies and provide immediate value:

### 1. Database Schema for Roles

**Why high priority**: Foundation for all role-based features. No external dependencies.

- [ ] **Add role column to user table** (`src/lib/server/db/schema.js`)

  ```javascript
  role: text('role').notNull().default('parent'); // 'admin' | 'parent' | 'employee'
  ```

- [ ] **Create eltern (parents) table** (`src/lib/server/db/schema.js`)
  - `id` (primary key)
  - `userId` (FK to user)
  - `telefon` (phone)
  - `adresse` (address)
  - `createdAt`, `updatedAt` timestamps

- [ ] **Create eltern_kinder junction table** (`src/lib/server/db/schema.js`)
  - `id` (primary key)
  - `elternId` (FK to eltern)
  - `kindId` (FK to kinder)
  - `beziehung` ('mutter' | 'vater' | 'erziehungsberechtigter')

- [ ] **Create mitarbeiter (employees) table** (`src/lib/server/db/schema.js`)
  - `id` (primary key)
  - `userId` (FK to user)
  - `erzieherId` (FK to erzieher, optional)
  - `position` (job title)
  - `createdAt`, `updatedAt` timestamps

- [ ] **Add Drizzle relations for new tables**
  - User -> eltern (one-to-one)
  - User -> mitarbeiter (one-to-one)
  - eltern <-> kinder (many-to-many via junction)
  - mitarbeiter -> erzieher (one-to-one optional)

- [ ] **Run migration**
  - `npm run db:push` or `npm run db:migrate`
  - Handle existing users: set role to 'admin'

---

## MEDIUM PRIORITY

These items build on HIGH priority work or have soft dependencies:

### 2. Role-Based Route Protection

**Depends on**: Schema for Roles (HIGH #1)

- [ ] **Create auth utility for role checking** (`src/lib/server/auth-utils.js`)

  ```javascript
  export function requireRole(session, allowedRoles) { ... }
  export function getDashboardForRole(role) { ... }
  ```

- [ ] **Update admin layout guard** (`src/routes/admin/+layout.server.js`)
  - Check for 'admin' role
  - Redirect non-admins to appropriate dashboard

- [ ] **Add role to session data** (`src/lib/server/auth.js`)
  - Include role in session user object

### 3. Admin User Management

**Depends on**: Schema for Roles (HIGH #1)

- [ ] **User management page** (`src/routes/admin/benutzer/+page.svelte`)
  - List all users with roles
  - Edit user roles (dropdown: admin/parent/employee)
  - View user details

- [ ] **User management API routes**
  - `src/routes/admin/benutzer/+page.server.js` - CRUD operations

### 4. Admin Parent-Child Linking

**Depends on**: Schema for Roles (HIGH #1), User Management (MEDIUM #3)

- [ ] **Parent management page** (`src/routes/admin/eltern/+page.svelte`)
  - List all parents
  - Link parents to children (multi-select)
  - Set relationship type (mother/father/guardian)
  - View parent's linked children

- [ ] **Parent management API routes**
  - `src/routes/admin/eltern/+page.server.js`

### 5. Admin Employee-Teacher Linking

**Depends on**: Schema for Roles (HIGH #1), User Management (MEDIUM #3)

- [ ] **Employee management page** (`src/routes/admin/mitarbeiter/+page.svelte`)
  - List all employees
  - Link employee user to erzieher record
  - Set position/title

- [ ] **Employee management API routes**
  - `src/routes/admin/mitarbeiter/+page.server.js`

### 6. Parent Dashboard

**Depends on**: Schema for Roles (HIGH #1), Role Protection (MEDIUM #2), Parent-Child Linking (MEDIUM #4)

- [ ] **Parent layout with auth guard** (`src/routes/eltern/+layout.server.js`)
  - Require role: 'parent'
  - Redirect if not parent

- [ ] **Parent home page** (`src/routes/eltern/+page.svelte`)
  - Overview of their children
  - Today's summary

- [ ] **Parent children view** (`src/routes/eltern/kinder/+page.svelte`)
  - View only their linked children
  - Child details, group info

- [ ] **Parent meal plan view** (`src/routes/eltern/speiseplan/+page.svelte`)
  - Weekly meal plan display
  - Read-only

- [ ] **Parent announcements view** (`src/routes/eltern/nachrichten/+page.svelte`)
  - View active announcements
  - Read-only

### 7. Employee Dashboard

**Depends on**: Schema for Roles (HIGH #1), Role Protection (MEDIUM #2), Employee-Teacher Linking (MEDIUM #5)

- [ ] **Employee layout with auth guard** (`src/routes/mitarbeiter/+layout.server.js`)
  - Require role: 'employee'
  - Redirect if not employee

- [ ] **Employee home page** (`src/routes/mitarbeiter/+page.svelte`)
  - Personal schedule prominently displayed
  - Quick access to their groups
  - Today's summary

- [ ] **Employee schedule view** (`src/routes/mitarbeiter/dienstplan/+page.svelte`)
  - Personal schedule (filtered to their erzieher record)
  - Weekly view

- [ ] **Employee groups view** (`src/routes/mitarbeiter/gruppen/+page.svelte`)
  - Children in their assigned groups
  - Group details

### 8. Shared Dashboard Components

**Depends on**: Children Dashboard (COMPLETED), Parent Dashboard (MEDIUM #6)

- [ ] **Create dashboard components directory** (`src/lib/components/dashboard/`)

- [ ] **AnnouncementCard.svelte**
  - Reusable announcement display
  - Priority indicator (normal/wichtig)

- [ ] **MealCard.svelte**
  - Meal display with type icon
  - Used in all dashboards

- [ ] **TeacherCard.svelte**
  - Teacher photo and name
  - Schedule time display

- [ ] **BirthdayCard.svelte**
  - Birthday celebration display
  - Child photo and age

- [ ] **ChildCard.svelte**
  - Child info display
  - Used in parent/employee dashboards

---

## LOW PRIORITY / DEFERRED

These items require external dependencies (API credentials) or are nice-to-have:

### 9. Self-Registration Page

**Depends on**: Schema for Roles (HIGH #1)
**Note**: Can implement email/password registration without social login

- [ ] **Registration page** (`src/routes/registrieren/+page.svelte`)
  - Email/password registration form
  - Role selection (parent only for self-registration)
  - Terms acceptance

- [ ] **Registration server action** (`src/routes/registrieren/+page.server.js`)
  - Create user with 'parent' role
  - Create empty eltern record
  - Send verification email (if configured)

### 10. Google OAuth Integration

**Requires**: Google Cloud Console credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

- [ ] **Configure Google provider** (`src/lib/server/auth.js`)

  ```javascript
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET
    }
  }
  ```

- [ ] **Add environment variables** (`.env`)

  ```
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  ```

- [ ] **Add Google sign-in button** to login and registration pages

### 11. Apple Sign-In Integration

**Requires**: Apple Developer credentials (APPLE_CLIENT_ID, APPLE_CLIENT_SECRET, APPLE_TEAM_ID, APPLE_KEY_ID)
**Note**: Requires HTTPS for callback (use ngrok for local dev)

- [ ] **Configure Apple provider** (`src/lib/server/auth.js`)

  ```javascript
  socialProviders: {
    apple: {
      clientId: APPLE_CLIENT_ID,
      clientSecret: APPLE_CLIENT_SECRET,
      teamId: APPLE_TEAM_ID,
      keyId: APPLE_KEY_ID
    }
  }
  ```

- [ ] **Add environment variables** (`.env`)

  ```
  APPLE_CLIENT_ID=
  APPLE_CLIENT_SECRET=
  APPLE_TEAM_ID=
  APPLE_KEY_ID=
  ```

- [ ] **Add Apple sign-in button** to login and registration pages

### 12. Social Login on Admin Login Page

**Depends on**: Google OAuth (LOW #10) and/or Apple Sign-In (LOW #11)

- [ ] **Update admin login page** (`src/routes/admin/login/+page.svelte`)
  - Add "Sign in with Google" button
  - Add "Sign in with Apple" button
  - Keep email/password as primary option

### 13. Attendance Tracking (Future Version)

**Status**: Explicitly deferred per implementation plan

- [ ] Employee check-in/check-out for children
- [ ] Attendance history
- [ ] Attendance reports

---

## Implementation Order Summary

| Order | Item                           | Priority  | Dependencies | External Deps      |
| ----- | ------------------------------ | --------- | ------------ | ------------------ |
| ~~1~~ | ~~Modular Seed System~~        | COMPLETED | None         | None               |
| ~~2~~ | ~~Children Dashboard (Kiosk)~~ | COMPLETED | None         | None               |
| 1     | Database Schema for Roles      | HIGH      | None         | None               |
| 2     | Role-Based Route Protection    | MEDIUM    | #1           | None               |
| 3     | Admin User Management          | MEDIUM    | #1           | None               |
| 4     | Admin Parent-Child Linking     | MEDIUM    | #1, #3       | None               |
| 5     | Admin Employee-Teacher Linking | MEDIUM    | #1, #3       | None               |
| 6     | Parent Dashboard               | MEDIUM    | #1, #2, #4   | None               |
| 7     | Employee Dashboard             | MEDIUM    | #1, #2, #5   | None               |
| 8     | Shared Dashboard Components    | MEDIUM    | (Kiosk), #6  | None               |
| 9     | Self-Registration Page         | LOW       | #1           | None               |
| 10    | Google OAuth                   | LOW       | #1           | Google credentials |
| 11    | Apple Sign-In                  | LOW       | #1           | Apple credentials  |
| 12    | Social Login Buttons           | LOW       | #10, #11     | OAuth credentials  |
| 13    | Attendance Tracking            | DEFERRED  | Many         | None               |

---

## Verification Checklist

### After Role Schema

```bash
npm run db:push                                     # Apply schema changes
# Verify existing users have role='admin'
```

### Children Dashboard (COMPLETED)

- Open `/kinder-ansicht` in browser
- Verify playful design, large touch targets
- Test on tablet/TV resolution
- Run E2E tests: `npm run test:e2e -- kiosk.spec.ts`

### After Role-Based Dashboards

1. Login as admin -> stays at `/admin`
2. Login as parent -> redirects to `/eltern`
3. Login as employee -> redirects to `/mitarbeiter`
4. Verify data isolation (parents only see their children)

---

## Key Files Reference

| Category             | File Path                                |
| -------------------- | ---------------------------------------- |
| Database Schema      | `src/lib/server/db/schema.js`            |
| Auth Config          | `src/lib/server/auth.js`                 |
| Seed Orchestrator    | `scripts/seed.js`                        |
| Seed Profiles        | `scripts/seeds/*.js`                     |
| Public Dashboard     | `src/routes/+page.svelte`                |
| Admin Routes         | `src/routes/admin/**`                    |
| Parent Routes        | `src/routes/eltern/**`                   |
| Employee Routes      | `src/routes/mitarbeiter/**`              |
| Kiosk Route          | `src/routes/kinder-ansicht/+page.svelte` |
| Shared Components    | `src/lib/components/`                    |
| Dashboard Components | `src/lib/components/dashboard/`          |
| E2E Tests            | `e2e/`                                   |
| Specifications       | `specs/`                                 |

---

## TEST COVERAGE GAPS

The following E2E test coverage gaps have been identified and should be addressed:

### Missing CRUD Tests

| Entity                  | Create     | Read       | Update     | Delete     |
| ----------------------- | ---------- | ---------- | ---------- | ---------- |
| Gruppen                 | ✅         | ✅         | ✅         | ✅         |
| Kinder                  | ✅         | ✅         | ✅         | ❌ Missing |
| Erzieher                | ✅         | ✅         | ✅         | ❌ Missing |
| Dienstplan              | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Missing |
| Mahlzeiten (Speiseplan) | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Missing |
| Ankuendigungen          | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Missing |

### Missing Feature Tests

- [ ] Photo upload functionality (`/api/upload` endpoint)
- [ ] Delete operations for Kinder (children)
- [ ] Delete operations for Erzieher (teachers)

### Recommended Test Files to Create

```
e2e/
├── dienstplan.spec.ts      # Schedule CRUD tests
├── speiseplan.spec.ts      # Meals CRUD tests
├── ankuendigungen.spec.ts  # Announcements CRUD tests
└── photo-upload.spec.ts    # Photo upload tests
```

### Priority

These test gaps should be addressed **before** implementing new features to ensure regression coverage. The deterministic test data from the modular seed system (testing profile) is now available to make these tests more reliable.

---

## NOTES

### E2E Test Suite

- One test is currently disabled: the auto-refresh test in the dashboard suite takes 30+ seconds to complete
- All 25 active tests are passing and cover:
  - Authentication flows
  - CRUD operations for groups, children, and teachers
  - Public dashboard functionality
  - Kiosk view functionality (6 tests)
- No TODO/FIXME comments exist in the source code (codebase is well organized)
- **See TEST COVERAGE GAPS section above for missing tests**

### Code Quality Observations

- The public dashboard (`src/routes/+page.svelte`) contains inline card components for birthdays, meals, teachers, and announcements
- **Recommendation**: When implementing the Children Dashboard (Kiosk View), extract these inline components into reusable components in `src/lib/components/dashboard/`
- This extraction will benefit both the kiosk view and the role-based dashboards (parent/employee)

### German Localization

- All user-facing text is properly localized in German
- Table names and field names use German conventions (gruppen, kinder, erzieher, etc.)
- Maintain this convention when adding new features

### Dependency Chain Summary

- Database Schema for Roles (HIGH #1) has no dependencies and is the foundation for all role-based features
- Items 2-8 all depend on Database Schema for Roles (HIGH #1)
- Items 4-5 additionally depend on item 3 (User Management)
- Items 6-7 depend on their respective linking features (4 and 5)
- Shared Dashboard Components (MEDIUM #8) can leverage the completed Children Dashboard (Kiosk View)
