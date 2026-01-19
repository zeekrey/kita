# Kita v2.0 Implementation Plan

> **Last Updated:** 2026-01-19
> **Status:** Phase 1 complete. Role-Based Route Protection (MEDIUM #1) complete. Admin User Management (MEDIUM #2) complete. Admin Parent-Child Linking (MEDIUM #3) complete. Ready for Admin Employee-Teacher Linking (MEDIUM #4).

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

- [x] **Database Schema for Roles** (`src/lib/server/db/schema.js`)
  - Added `role` column to `user` table with type: `'admin' | 'parent' | 'employee'`, default: `'parent'`
  - Created `eltern` (parents) table with:
    - `id` (primary key)
    - `userId` (FK to user)
    - `telefon` (phone)
    - `adresse` (address)
    - `createdAt`, `updatedAt` timestamps
  - Created `eltern_kinder` junction table for parent-child relationships with:
    - `id` (primary key)
    - `elternId` (FK to eltern)
    - `kindId` (FK to kinder)
    - `beziehung` (relationship type: 'mutter' | 'vater' | 'erziehungsberechtigter')
  - Created `mitarbeiter` (employees) table with:
    - `id` (primary key)
    - `userId` (FK to user)
    - `erzieherId` (FK to erzieher, optional)
    - `position` (job title)
    - `createdAt`, `updatedAt` timestamps
  - Added all Drizzle relations for the new tables:
    - User -> eltern (one-to-one)
    - User -> mitarbeiter (one-to-one)
    - eltern <-> kinder (many-to-many via eltern_kinder junction)
    - mitarbeiter -> erzieher (one-to-one optional)
  - Ran `npm run db:push` migration successfully
  - **Migration Note**: Existing users default to 'parent' role. To set admin users, run manual SQL update:
    ```sql
    UPDATE user SET role='admin' WHERE email='admin@example.com';
    ```

---

## MEDIUM PRIORITY

These items build on completed HIGH priority work or have soft dependencies:

### 1. Role-Based Route Protection (COMPLETED)

**Depends on**: Schema for Roles (COMPLETED)

- [x] **Create auth utility for role checking** (`src/lib/server/auth-utils.js`)
  - `requireRole(session, allowedRoles)` - Check if user has required role, throw redirect if not
  - `getDashboardForRole(role)` - Get dashboard URL for a given role
  - `hasRole(session, role)` - Check if user has a specific role
  - `hasAnyRole(session, roles)` - Check if user has any of the specified roles

- [x] **Update admin layout guard** (`src/routes/admin/+layout.server.js`)
  - Check for 'admin' role using `requireRole(session, ['admin'])`
  - Redirect non-admins to appropriate dashboard using `getDashboardForRole()`
  - Authenticated non-admin users visiting `/admin/login` are redirected to their dashboard

- [x] **Add role to session data** (`src/lib/server/auth.js`)
  - Configured Better-Auth `user.additionalFields.role` to include role in session
  - Role field has `input: false` to prevent users from setting their own role on signup

- [x] **Test-only API endpoint** (`src/routes/api/test/set-role/+server.js`)
  - Development-only endpoint to set user roles for E2E testing
  - Allows tests to create admin users for testing admin functionality

- [x] **Updated E2E tests** (`e2e/auth.spec.js`, `e2e/crud.spec.js`)
  - Tests now use `createAdminUser()` helper to create admin users
  - Calls `/api/test/set-role` after signup to set role to 'admin'
  - All 29 tests passing

### 2. Admin User Management (COMPLETED)

**Depends on**: Schema for Roles (COMPLETED)

- [x] **User management page** (`src/routes/admin/benutzer/+page.svelte`)
  - List all users with role badges (color-coded: admin=red, employee=blue, parent=green)
  - Search by name or email
  - Filter by role (all/admin/employee/parent)
  - Edit user roles with inline dropdown
  - Delete users with confirmation modal
  - Protection against deleting last admin
  - Navigation link added to admin layout

- [x] **User management API routes** (`src/routes/admin/benutzer/+page.server.js`)
  - Load action: Fetch all users with roles
  - `updateRole` action: Update user role with validation
  - `delete` action: Delete user with last admin protection
  - 9 E2E tests added in `e2e/benutzer.spec.js`:
    - Page display and accessibility
    - User filtering by role
    - Search functionality
    - Role editing with inline dropdown
    - Delete confirmation modal
    - Protection against deleting last admin
    - Navigation from admin layout

### 3. Admin Parent-Child Linking (COMPLETED)

**Depends on**: Schema for Roles (COMPLETED), User Management (MEDIUM #2)

- [x] **Parent management page** (`src/routes/admin/eltern/+page.svelte`)
  - List all parents with card-based UI
  - Search by name, email, phone, or child name
  - Edit parent profile (phone, address)
  - Link parents to children with relationship type (mutter/vater/erziehungsberechtigter)
  - Unlink children from parents with confirmation modal
  - View parent's linked children with group color indicators
  - Counter showing filtered/total parents

- [x] **Parent management API routes** (`src/routes/admin/eltern/+page.server.js`)
  - Load action: Fetch all parent users with eltern profiles and linked children
  - `updateProfile` action: Update parent phone and address
  - `linkChild` action: Link a child to parent with relationship type
  - `unlinkChild` action: Remove parent-child link
  - 7 E2E tests added in `e2e/eltern.spec.js`

- [x] **Navigation link** added to admin layout sidebar

### 4. Admin Employee-Teacher Linking

**Depends on**: Schema for Roles (COMPLETED), User Management (MEDIUM #2)

- [ ] **Employee management page** (`src/routes/admin/mitarbeiter/+page.svelte`)
  - List all employees
  - Link employee user to erzieher record
  - Set position/title

- [ ] **Employee management API routes**
  - `src/routes/admin/mitarbeiter/+page.server.js`

### 5. Parent Dashboard

**Depends on**: Schema for Roles (COMPLETED), Role Protection (MEDIUM #1), Parent-Child Linking (MEDIUM #3)

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

### 6. Employee Dashboard

**Depends on**: Schema for Roles (COMPLETED), Role Protection (MEDIUM #1), Employee-Teacher Linking (MEDIUM #4)

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

### 7. Shared Dashboard Components

**Depends on**: Children Dashboard (COMPLETED), Parent Dashboard (MEDIUM #5)

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

### 8. Self-Registration Page

**Depends on**: Schema for Roles (COMPLETED)
**Note**: Can implement email/password registration without social login

- [ ] **Registration page** (`src/routes/registrieren/+page.svelte`)
  - Email/password registration form
  - Role selection (parent only for self-registration)
  - Terms acceptance

- [ ] **Registration server action** (`src/routes/registrieren/+page.server.js`)
  - Create user with 'parent' role
  - Create empty eltern record
  - Send verification email (if configured)

### 9. Google OAuth Integration

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

### 10. Apple Sign-In Integration

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

### 11. Social Login on Admin Login Page

**Depends on**: Google OAuth (LOW #9) and/or Apple Sign-In (LOW #10)

- [ ] **Update admin login page** (`src/routes/admin/login/+page.svelte`)
  - Add "Sign in with Google" button
  - Add "Sign in with Apple" button
  - Keep email/password as primary option

### 12. Attendance Tracking (Future Version)

**Status**: Explicitly deferred per implementation plan

- [ ] Employee check-in/check-out for children
- [ ] Attendance history
- [ ] Attendance reports

---

## Implementation Order Summary

| Order | Item                            | Priority  | Dependencies         | External Deps      |
| ----- | ------------------------------- | --------- | -------------------- | ------------------ |
| ~~1~~ | ~~Modular Seed System~~         | COMPLETED | None                 | None               |
| ~~2~~ | ~~Children Dashboard (Kiosk)~~  | COMPLETED | None                 | None               |
| ~~3~~ | ~~Database Schema for Roles~~   | COMPLETED | None                 | None               |
| ~~4~~ | ~~Role-Based Route Protection~~ | COMPLETED | Roles Schema         | None               |
| ~~5~~ | ~~Admin User Management~~       | COMPLETED | Roles Schema         | None               |
| ~~6~~ | ~~Admin Parent-Child Linking~~  | COMPLETED | Roles Schema, #2     | None               |
| 4     | Admin Employee-Teacher Linking  | MEDIUM    | Roles Schema, #2     | None               |
| 5     | Parent Dashboard                | MEDIUM    | Roles Schema, #1, #3 | None               |
| 6     | Employee Dashboard              | MEDIUM    | Roles Schema, #1, #4 | None               |
| 7     | Shared Dashboard Components     | MEDIUM    | Kiosk, #5            | None               |
| 8     | Self-Registration Page          | LOW       | Roles Schema         | None               |
| 9     | Google OAuth                    | LOW       | Roles Schema         | Google credentials |
| 10    | Apple Sign-In                   | LOW       | Roles Schema         | Apple credentials  |
| 11    | Social Login Buttons            | LOW       | #9, #10              | OAuth credentials  |
| 12    | Attendance Tracking             | DEFERRED  | Many                 | None               |

---

## Verification Checklist

### Database Schema for Roles (COMPLETED)

- ✓ Schema changes applied with `npm run db:push`
- ✓ Role column added to user table
- ✓ Eltern (parents) table created
- ✓ Eltern_kinder junction table created
- ✓ Mitarbeiter (employees) table created
- ✓ All Drizzle relations configured
- Note: Existing users default to 'parent' role - update admin users manually

### Children Dashboard (COMPLETED)

- Open `/kinder-ansicht` in browser
- Verify playful design, large touch targets
- Test on tablet/TV resolution
- Run E2E tests: `npm run test:e2e -- kiosk.spec.ts`

### Role-Based Route Protection (COMPLETED)

- ✓ Auth utilities created at `src/lib/server/auth-utils.js`
- ✓ Better-Auth configured to include role in session (`src/lib/server/auth.js`)
- ✓ Admin layout guard checks for 'admin' role (`src/routes/admin/+layout.server.js`)
- ✓ Test-only endpoint for setting roles (`src/routes/api/test/set-role/+server.js`)
- ✓ E2E tests updated to create admin users
- ✓ All 29 E2E tests passing
- Verification:
  - Admin users logging in -> redirected to `/admin`
  - Non-admin users accessing `/admin/*` -> redirected to their role's dashboard
  - Parent dashboard at `/eltern` (not yet implemented)
  - Employee dashboard at `/mitarbeiter` (not yet implemented)

### Admin User Management (COMPLETED)

- ✓ User management page implemented at `/admin/benutzer`
- ✓ User list displays all users with color-coded role badges
- ✓ Search functionality by name/email working
- ✓ Filter functionality by role working (all/admin/employee/parent)
- ✓ Inline role editing with dropdown implemented
- ✓ Delete functionality with confirmation modal implemented
- ✓ Protection against deleting last admin implemented
- ✓ Navigation link added to admin layout sidebar
- ✓ API routes with `updateRole` and `delete` actions implemented
- ✓ 9 E2E tests passing in `e2e/benutzer.spec.js`
- Verification:
  - Visit `/admin/benutzer` as admin user
  - Verify user list displays with role badges
  - Test search by name and email
  - Test filter dropdown (all roles, admin only, employee only, parent only)
  - Test editing a user's role
  - Test deleting a user (should show confirmation modal)
  - Verify cannot delete last admin user
  - Run E2E tests: `npm run test:e2e -- benutzer.spec.js`

### Admin Parent-Child Linking (COMPLETED)

- ✓ Parent management page implemented at `/admin/eltern`
- ✓ Card-based UI displaying all parent users
- ✓ Search functionality by name, email, phone, or child name
- ✓ Edit parent profile modal (phone, address)
- ✓ Link child modal with relationship type selection
- ✓ Unlink child with confirmation modal
- ✓ Linked children display with group color indicators and relationship badges
- ✓ Counter showing filtered/total parents
- ✓ Navigation link added to admin layout sidebar
- ✓ API routes with `updateProfile`, `linkChild`, and `unlinkChild` actions
- ✓ Test endpoint updated to create eltern records when setting role to parent
- ✓ 7 E2E tests passing in `e2e/eltern.spec.js`
- Verification:
  - Visit `/admin/eltern` as admin user
  - Verify parent list displays with contact info and linked children
  - Test search by name, email, phone, or child name
  - Test editing a parent's profile (phone, address)
  - Test linking a child to a parent with relationship type
  - Test unlinking a child (should show confirmation modal)
  - Run E2E tests: `npm run test:e2e -- eltern.spec.js`

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
- All 45 active tests are passing and cover:
  - Authentication flows (4 tests) - now with role-based auth
  - CRUD operations for groups, children, and teachers (11 tests)
  - Public dashboard functionality (10 tests)
  - Kiosk view functionality (6 tests)
  - Admin user management (9 tests) in `e2e/benutzer.spec.js`
  - Admin parent management (7 tests) in `e2e/eltern.spec.js`
- Tests use `createAdminUser()` helper to create admin users with proper role
- Test-only endpoint `/api/test/set-role` allows setting user roles (dev mode only)
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
