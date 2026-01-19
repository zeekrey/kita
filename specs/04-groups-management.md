# Spec: Groups Management

## Overview
CRUD interface for managing kindergarten groups (Gruppen).

## Route
`/admin/gruppen`

---

## Tasks

### 4.1 Create Groups List Page

**File**: `src/routes/admin/gruppen/+page.server.js`

```javascript
import { db } from '$lib/server/db';
import { gruppen } from '$lib/server/db/schema';

export async function load() {
  const allGroups = await db.select().from(gruppen).orderBy(gruppen.name);
  return { gruppen: allGroups };
}
```

**File**: `src/routes/admin/gruppen/+page.svelte`

**UI Requirements**:
- Page title: "Gruppen"
- "Neue Gruppe" button
- Table/grid showing all groups
- Each group shows: name, color swatch
- Edit/Delete actions per group

**Acceptance Criteria**:
- [ ] Page loads and displays groups
- [ ] Empty state shown when no groups
- [ ] Groups sorted alphabetically

---

### 4.2 Create Add Group Form

**Implementation Options**:
- Modal dialog (using Bits UI Dialog)
- OR inline form

**Form Fields**:
| Field | Label (DE) | Type | Required |
|-------|------------|------|----------|
| name | Name | text | Yes |
| farbe | Farbe | color picker | Yes |

**Server Action** (in `+page.server.js`):
```javascript
export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    const farbe = formData.get('farbe');

    await db.insert(gruppen).values({ name, farbe });
    return { success: true };
  }
};
```

**Acceptance Criteria**:
- [ ] Form renders with all fields
- [ ] Validation prevents empty name
- [ ] Color picker works
- [ ] Successful creation adds group to list
- [ ] Form resets after creation

---

### 4.3 Create Edit Group Form

**Route**: `/admin/gruppen/[id]/edit` or modal

**Form Fields**: Same as create

**Server Action**:
```javascript
edit: async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get('id');
  const name = formData.get('name');
  const farbe = formData.get('farbe');

  await db.update(gruppen)
    .set({ name, farbe, updatedAt: new Date() })
    .where(eq(gruppen.id, id));

  return { success: true };
}
```

**Acceptance Criteria**:
- [ ] Form pre-filled with existing data
- [ ] Changes saved correctly
- [ ] List updates after edit

---

### 4.4 Implement Delete Group

**Behavior**:
- Confirmation dialog before delete
- Check if group has children assigned
- If children assigned, show warning/prevent delete

**Server Action**:
```javascript
delete: async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get('id');

  // Check for assigned children
  const assignedKinder = await db.select()
    .from(kinder)
    .where(eq(kinder.gruppeId, id))
    .limit(1);

  if (assignedKinder.length > 0) {
    return { error: 'Gruppe hat noch Kinder zugewiesen' };
  }

  await db.delete(gruppen).where(eq(gruppen.id, id));
  return { success: true };
}
```

**German Labels**:
- Confirm title: "Gruppe löschen?"
- Confirm message: "Möchten Sie diese Gruppe wirklich löschen?"
- Error: "Gruppe hat noch Kinder zugewiesen"
- Confirm button: "Löschen"
- Cancel button: "Abbrechen"

**Acceptance Criteria**:
- [ ] Confirmation dialog shown before delete
- [ ] Cannot delete group with assigned children
- [ ] Successful delete removes group from list

---

## Color Picker Component

**Suggested Colors** (predefined palette):
```javascript
const presetColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
];
```

---

## Files to Create/Modify
- `src/routes/admin/gruppen/+page.server.js`
- `src/routes/admin/gruppen/+page.svelte`
- `src/lib/components/ColorPicker.svelte` (optional reusable component)
