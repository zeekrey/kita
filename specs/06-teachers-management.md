# Spec: Teachers Management

## Overview

CRUD interface for managing teachers (Erzieher).

## Route

`/admin/erzieher`

---

## Tasks

### 6.1 Create Teachers List Page

**File**: `src/routes/admin/erzieher/+page.server.js`

```javascript
import { db } from '$lib/server/db';
import { erzieher } from '$lib/server/db/schema';

export async function load() {
	const allErzieher = await db.select().from(erzieher).orderBy(erzieher.nachname, erzieher.vorname);

	return { erzieher: allErzieher };
}
```

**File**: `src/routes/admin/erzieher/+page.svelte`

**UI Requirements**:

- Page title: "Erzieher"
- "Neue/r Erzieher/in" button
- Grid/table showing: photo, name, email
- Edit/Delete actions per entry

**Table Columns**:
| Column | Label (DE) |
|--------|------------|
| Photo | Foto |
| Name | Name |
| Email | E-Mail |
| Actions | Aktionen |

**Acceptance Criteria**:

- [ ] Page loads and displays teachers
- [ ] Teachers sorted by last name, first name
- [ ] Empty state when no teachers

---

### 6.2 Create Add Teacher Form

**Form Fields**:
| Field | Label (DE) | Type | Required |
|-------|------------|------|----------|
| vorname | Vorname | text | Yes |
| nachname | Nachname | text | Yes |
| email | E-Mail | email | Yes |
| foto | Foto | file upload | No |

**Validation**:

- Email must be valid format
- Email must be unique

**Server Action**:

```javascript
create: async ({ request }) => {
	const formData = await request.formData();
	const email = formData.get('email');

	// Check for duplicate email
	const existing = await db.select().from(erzieher).where(eq(erzieher.email, email)).get();

	if (existing) {
		return { error: 'E-Mail bereits vorhanden' };
	}

	await db.insert(erzieher).values({
		vorname: formData.get('vorname'),
		nachname: formData.get('nachname'),
		email: email,
		fotoPath: formData.get('fotoPath') || null
	});

	return { success: true };
};
```

**Acceptance Criteria**:

- [ ] Form renders with all fields
- [ ] Photo upload works
- [ ] Email validation works
- [ ] Duplicate email shows error

---

### 6.3 Create Edit Teacher Form

**Route**: Modal or `/admin/erzieher/[id]/edit`

**Server Action**:

```javascript
edit: async ({ request }) => {
	const formData = await request.formData();
	const id = formData.get('id');
	const email = formData.get('email');

	// Check for duplicate email (excluding self)
	const existing = await db
		.select()
		.from(erzieher)
		.where(and(eq(erzieher.email, email), not(eq(erzieher.id, id))))
		.get();

	if (existing) {
		return { error: 'E-Mail bereits vorhanden' };
	}

	await db
		.update(erzieher)
		.set({
			vorname: formData.get('vorname'),
			nachname: formData.get('nachname'),
			email: email,
			fotoPath: formData.get('fotoPath') || null,
			updatedAt: new Date()
		})
		.where(eq(erzieher.id, id));

	return { success: true };
};
```

**Acceptance Criteria**:

- [ ] Form pre-filled with existing data
- [ ] Can change/remove photo
- [ ] Email uniqueness validated

---

### 6.4 Implement Delete Teacher

**Behavior**:

- Confirmation dialog before delete
- Check if teacher has schedule entries
- If schedule entries exist, show warning

**Server Action**:

```javascript
delete: async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get('id');

  // Check for schedule entries
  const schedules = await db.select()
    .from(dienstplan)
    .where(eq(dienstplan.erzieherId, id))
    .limit(1);

  if (schedules.length > 0) {
    return { error: 'Erzieher/in hat noch Dienstplan-Einträge' };
  }

  // Optionally delete photo file
  const teacher = await db.select().from(erzieher).where(eq(erzieher.id, id)).get();
  if (teacher?.fotoPath) {
    // Delete file from static/uploads
  }

  await db.delete(erzieher).where(eq(erzieher.id, id));
  return { success: true };
}
```

**German Labels**:

- Confirm title: "Erzieher/in löschen?"
- Confirm message: "Möchten Sie {name} wirklich löschen?"
- Error: "Erzieher/in hat noch Dienstplan-Einträge"

**Acceptance Criteria**:

- [ ] Cannot delete teacher with schedule entries
- [ ] Confirmation shows teacher's name
- [ ] Successful delete removes teacher

---

## Files to Create/Modify

- `src/routes/admin/erzieher/+page.server.js`
- `src/routes/admin/erzieher/+page.svelte`
