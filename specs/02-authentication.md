# Spec: Authentication

## Overview
Implement authentication using better-auth with SQLite adapter.

## Reference
- Documentation: https://www.better-auth.com/docs/installation

---

## Tasks

### 2.1 Configure better-auth with SQLite

**File**: `src/lib/server/auth.js`

```javascript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),
  emailAndPassword: {
    enabled: true
  }
});
```

**Acceptance Criteria**:
- [ ] Auth instance created
- [ ] SQLite adapter configured
- [ ] Email/password auth enabled

---

### 2.2 Create Auth API Route Handler

**File**: `src/routes/api/auth/[...all]/+server.js`

```javascript
import { auth } from '$lib/server/auth';

export const GET = async ({ request }) => {
  return auth.handler(request);
};

export const POST = async ({ request }) => {
  return auth.handler(request);
};
```

**Acceptance Criteria**:
- [ ] Auth endpoints respond correctly
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works

---

### 2.3 Create Login Page

**File**: `src/routes/admin/login/+page.svelte`

**UI Requirements**:
- Email input field
- Password input field
- "Anmelden" (Login) button
- Error message display
- Redirect to `/admin` on success

**German Labels**:
- Email: "E-Mail"
- Password: "Passwort"
- Submit: "Anmelden"
- Error: "Anmeldung fehlgeschlagen"

**Acceptance Criteria**:
- [ ] Login form renders
- [ ] Form validation works
- [ ] Successful login redirects to /admin
- [ ] Failed login shows error message
- [ ] All text in German

---

### 2.4 Create Admin Layout with Auth Guard

**File**: `src/routes/admin/+layout.server.js`

```javascript
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load = async ({ request, url }) => {
  const session = await auth.api.getSession({ headers: request.headers });

  // Allow access to login page without auth
  if (url.pathname === '/admin/login') {
    if (session) {
      throw redirect(302, '/admin');
    }
    return {};
  }

  // Require auth for all other admin pages
  if (!session) {
    throw redirect(302, '/admin/login');
  }

  return {
    user: session.user
  };
};
```

**File**: `src/routes/admin/+layout.svelte`

**UI Requirements**:
- Sidebar navigation with links to all admin sections
- Header with user info and logout button
- Main content area

**Navigation Items** (German):
- Übersicht (Overview) → `/admin`
- Kinder → `/admin/kinder`
- Gruppen → `/admin/gruppen`
- Erzieher → `/admin/erzieher`
- Dienstplan → `/admin/dienstplan`
- Speiseplan → `/admin/speiseplan`
- Ankündigungen → `/admin/ankuendigungen`

**Acceptance Criteria**:
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users see admin layout
- [ ] Navigation renders all links
- [ ] Current page highlighted in nav

---

### 2.5 Add Logout Functionality

**Implementation**:
- Logout button in admin header
- Calls better-auth sign out
- Redirects to login page

**Acceptance Criteria**:
- [ ] Logout button visible in admin layout
- [ ] Clicking logout signs out user
- [ ] User redirected to login page

---

## Auth Client Setup

**File**: `src/lib/auth-client.js`

```javascript
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient();
```

---

## Files to Create/Modify
- `src/lib/server/auth.js` (auth configuration)
- `src/lib/auth-client.js` (client-side auth)
- `src/routes/api/auth/[...all]/+server.js` (API handler)
- `src/routes/admin/login/+page.svelte` (login page)
- `src/routes/admin/+layout.server.js` (auth guard)
- `src/routes/admin/+layout.svelte` (admin layout)
