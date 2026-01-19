# Spec: Schedule Management

## Overview
Weekly calendar interface for managing teacher schedules (Dienstplan).

## Route
`/admin/dienstplan`

---

## Tasks

### 7.1 Create Schedule Page

**File**: `src/routes/admin/dienstplan/+page.server.js`

```javascript
import { db } from '$lib/server/db';
import { erzieher, dienstplan } from '$lib/server/db/schema';
import { and, gte, lte, eq } from 'drizzle-orm';

export async function load({ url }) {
  // Get week from URL params or default to current week
  const weekParam = url.searchParams.get('week');
  const currentDate = weekParam ? new Date(weekParam) : new Date();

  // Calculate week start (Monday) and end (Sunday)
  const weekStart = getMonday(currentDate);
  const weekEnd = getSunday(currentDate);

  const allErzieher = await db.select().from(erzieher).orderBy(erzieher.nachname);

  const weekSchedules = await db.select()
    .from(dienstplan)
    .where(and(
      gte(dienstplan.datum, formatDate(weekStart)),
      lte(dienstplan.datum, formatDate(weekEnd))
    ));

  return {
    erzieher: allErzieher,
    schedules: weekSchedules,
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd)
  };
}
```

**File**: `src/routes/admin/dienstplan/+page.svelte`

**UI Requirements**:
- Page title: "Dienstplan"
- Week navigation (previous/next week buttons)
- Current week indicator (e.g., "KW 4, 20. - 26. Jan 2026")
- Weekly calendar grid

**Acceptance Criteria**:
- [ ] Page loads with current week
- [ ] Week navigation works
- [ ] Calendar grid renders

---

### 7.2 Create Weekly Calendar View

**Calendar Layout**:
```
|           | Mo 20. | Di 21. | Mi 22. | Do 23. | Fr 24. |
|-----------|--------|--------|--------|--------|--------|
| Maria S.  | 7-14   | 7-14   |        | 7-14   | 7-14   |
| Thomas K. | 12-18  | 12-18  | 12-18  |        | 12-18  |
| ...       |        |        |        |        |        |
```

**Features**:
- Rows = Teachers
- Columns = Weekdays (Monday - Friday, optionally Saturday)
- Cells show time slots if scheduled
- Click cell to add/edit schedule

**German Day Names**:
- Mo (Montag)
- Di (Dienstag)
- Mi (Mittwoch)
- Do (Donnerstag)
- Fr (Freitag)

**Acceptance Criteria**:
- [ ] Teachers shown as rows
- [ ] Days shown as columns
- [ ] Existing schedules displayed in cells
- [ ] Empty cells are clickable

---

### 7.3 Create Time Slot Picker Component

**File**: `src/lib/components/TimeSlotPicker.svelte`

**Props**:
- `startZeit`: Initial start time
- `endZeit`: Initial end time
- `onSave`: Callback with { startZeit, endZeit }
- `onCancel`: Callback to close picker
- `onDelete`: Callback to delete entry (optional)

**UI Requirements**:
- Start time input (HH:MM)
- End time input (HH:MM)
- Save button
- Cancel button
- Delete button (if editing existing)

**Validation**:
- Start time must be before end time
- Times must be in HH:MM format

**Common Time Presets** (optional):
- Frühdienst: 07:00 - 14:00
- Spätdienst: 12:00 - 18:00
- Ganztag: 07:00 - 18:00

**German Labels**:
- Start: "Von"
- End: "Bis"
- Save: "Speichern"
- Cancel: "Abbrechen"
- Delete: "Löschen"

**Acceptance Criteria**:
- [ ] Time inputs work
- [ ] Validation prevents invalid times
- [ ] Preset buttons fill times quickly
- [ ] All callbacks work

---

### 7.4 Implement Add/Edit/Delete Schedule Entries

**Server Actions**:

```javascript
export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();

    await db.insert(dienstplan).values({
      erzieherId: formData.get('erzieherId'),
      datum: formData.get('datum'),
      startZeit: formData.get('startZeit'),
      endZeit: formData.get('endZeit')
    });

    return { success: true };
  },

  edit: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    await db.update(dienstplan)
      .set({
        startZeit: formData.get('startZeit'),
        endZeit: formData.get('endZeit'),
        updatedAt: new Date()
      })
      .where(eq(dienstplan.id, id));

    return { success: true };
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    await db.delete(dienstplan).where(eq(dienstplan.id, id));
    return { success: true };
  }
};
```

**Workflow**:
1. Click empty cell → Opens TimeSlotPicker in add mode
2. Click existing entry → Opens TimeSlotPicker in edit mode with delete option
3. Save → Creates/updates entry
4. Delete → Removes entry

**Acceptance Criteria**:
- [ ] Can add new schedule entry
- [ ] Can edit existing entry
- [ ] Can delete entry
- [ ] Calendar updates after changes

---

## Helper Functions

```javascript
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getSunday(date) {
  const monday = getMonday(date);
  return new Date(monday.setDate(monday.getDate() + 6));
}

function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
```

---

## Files to Create/Modify
- `src/routes/admin/dienstplan/+page.server.js`
- `src/routes/admin/dienstplan/+page.svelte`
- `src/lib/components/TimeSlotPicker.svelte`
- `src/lib/utils/date.js` (helper functions)
