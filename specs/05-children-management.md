# Spec: Children Management

## Overview

CRUD interface for managing children (Kinder).

## Route

`/admin/kinder`

---

## Tasks

### 5.1 Create Children List Page

**File**: `src/routes/admin/kinder/+page.server.js`

```javascript
import { db } from '$lib/server/db';
import { kinder, gruppen } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load() {
	const allKinder = await db
		.select({
			id: kinder.id,
			vorname: kinder.vorname,
			nachname: kinder.nachname,
			geburtstag: kinder.geburtstag,
			fotoPath: kinder.fotoPath,
			gruppe: {
				id: gruppen.id,
				name: gruppen.name,
				farbe: gruppen.farbe
			}
		})
		.from(kinder)
		.leftJoin(gruppen, eq(kinder.gruppeId, gruppen.id))
		.orderBy(kinder.nachname, kinder.vorname);

	const allGruppen = await db.select().from(gruppen).orderBy(gruppen.name);

	return { kinder: allKinder, gruppen: allGruppen };
}
```

**File**: `src/routes/admin/kinder/+page.svelte`

**UI Requirements**:

- Page title: "Kinder"
- "Neues Kind" button
- Search/filter input
- Table showing: photo thumbnail, name, birthday, group (with color badge)
- Edit/Delete actions per row

**Table Columns**:
| Column | Label (DE) |
|--------|------------|
| Photo | Foto |
| Name | Name |
| Birthday | Geburtstag |
| Group | Gruppe |
| Actions | Aktionen |

**Acceptance Criteria**:

- [ ] Page loads and displays children
- [ ] Children sorted by last name, first name
- [ ] Group shown with color badge
- [ ] Empty state when no children

---

### 5.2 Create Add Child Form

**Form Fields**:
| Field | Label (DE) | Type | Required |
|-------|------------|------|----------|
| vorname | Vorname | text | Yes |
| nachname | Nachname | text | Yes |
| geburtstag | Geburtstag | date | Yes |
| gruppeId | Gruppe | select | No |
| foto | Foto | file upload | No |

**Server Action**:

```javascript
create: async ({ request }) => {
	const formData = await request.formData();

	await db.insert(kinder).values({
		vorname: formData.get('vorname'),
		nachname: formData.get('nachname'),
		geburtstag: formData.get('geburtstag'),
		gruppeId: formData.get('gruppeId') || null,
		fotoPath: formData.get('fotoPath') || null
	});

	return { success: true };
};
```

**Acceptance Criteria**:

- [ ] Form renders with all fields
- [ ] Photo upload works (uses PhotoUpload component)
- [ ] Group dropdown shows all groups
- [ ] Validation prevents empty required fields
- [ ] Date picker for birthday

---

### 5.3 Create Edit Child Form

**Route**: Modal or `/admin/kinder/[id]/edit`

**Pre-fill**: Load existing child data

**Server Action**:

```javascript
edit: async ({ request }) => {
	const formData = await request.formData();
	const id = formData.get('id');

	await db
		.update(kinder)
		.set({
			vorname: formData.get('vorname'),
			nachname: formData.get('nachname'),
			geburtstag: formData.get('geburtstag'),
			gruppeId: formData.get('gruppeId') || null,
			fotoPath: formData.get('fotoPath') || null,
			updatedAt: new Date()
		})
		.where(eq(kinder.id, id));

	return { success: true };
};
```

**Acceptance Criteria**:

- [ ] Form pre-filled with existing data
- [ ] Can change/remove photo
- [ ] Changes saved correctly

---

### 5.4 Implement Delete Child

**Behavior**:

- Confirmation dialog before delete
- Delete associated photo file (optional cleanup)

**Server Action**:

```javascript
delete: async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get('id');

  // Optionally delete photo file
  const child = await db.select().from(kinder).where(eq(kinder.id, id)).get();
  if (child?.fotoPath) {
    // Delete file from static/uploads
  }

  await db.delete(kinder).where(eq(kinder.id, id));
  return { success: true };
}
```

**German Labels**:

- Confirm title: "Kind löschen?"
- Confirm message: "Möchten Sie {name} wirklich löschen?"
- Confirm button: "Löschen"
- Cancel button: "Abbrechen"

**Acceptance Criteria**:

- [ ] Confirmation shows child's name
- [ ] Successful delete removes child from list

---

### 5.5 Add Search/Filter Functionality

**Search Behavior**:

- Search by first name or last name
- Real-time filtering (client-side)

**Filter Options**:

- Filter by group (dropdown)

**Implementation**:

```svelte
<script>
	let { data } = $props();
	let searchQuery = $state('');
	let selectedGruppe = $state('');

	let filteredKinder = $derived(
		data.kinder.filter((kind) => {
			const matchesSearch =
				!searchQuery ||
				kind.vorname.toLowerCase().includes(searchQuery.toLowerCase()) ||
				kind.nachname.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesGruppe = !selectedGruppe || kind.gruppe?.id === selectedGruppe;

			return matchesSearch && matchesGruppe;
		})
	);
</script>
```

**German Labels**:

- Search placeholder: "Name suchen..."
- Group filter: "Alle Gruppen" (default option)

**Acceptance Criteria**:

- [ ] Search filters by name in real-time
- [ ] Group dropdown filters by group
- [ ] Can combine search and filter
- [ ] Shows count of filtered results

---

## Files to Create/Modify

- `src/routes/admin/kinder/+page.server.js`
- `src/routes/admin/kinder/+page.svelte`
