# Spec: Announcements

## Overview
CRUD interface for managing announcements (Ankündigungen).

## Route
`/admin/ankuendigungen`

---

## Tasks

### 9.1 Create Announcements Page

**File**: `src/routes/admin/ankuendigungen/+page.server.js`

```javascript
import { db } from '$lib/server/db';
import { ankuendigungen } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function load() {
  const allAnnouncements = await db.select()
    .from(ankuendigungen)
    .orderBy(desc(ankuendigungen.gueltigVon));

  return { ankuendigungen: allAnnouncements };
}
```

**File**: `src/routes/admin/ankuendigungen/+page.svelte`

**UI Requirements**:
- Page title: "Ankündigungen"
- "Neue Ankündigung" button
- List/cards showing all announcements
- Show active/expired status
- Edit/Delete actions

**List Item Display**:
- Title (bold)
- Message preview (truncated)
- Validity period: "20.01. - 25.01.2026"
- Priority badge (if wichtig)
- Status: Aktiv / Abgelaufen / Geplant

**Status Logic**:
```javascript
function getStatus(gueltigVon, gueltigBis) {
  const today = new Date().toISOString().split('T')[0];
  if (today < gueltigVon) return 'geplant';
  if (today > gueltigBis) return 'abgelaufen';
  return 'aktiv';
}
```

**German Status Labels**:
- aktiv: "Aktiv" (green badge)
- abgelaufen: "Abgelaufen" (gray badge)
- geplant: "Geplant" (blue badge)

**Acceptance Criteria**:
- [ ] Page loads and displays announcements
- [ ] Status shown correctly for each
- [ ] Sorted by validity start date (newest first)

---

### 9.2 Create Add/Edit Announcement Form

**Form Fields**:
| Field | Label (DE) | Type | Required |
|-------|------------|------|----------|
| titel | Titel | text | Yes |
| nachricht | Nachricht | textarea | Yes |
| gueltigVon | Gültig von | date | Yes |
| gueltigBis | Gültig bis | date | Yes |
| prioritaet | Priorität | select | Yes |

**Priority Options**:
- `normal`: "Normal"
- `wichtig`: "Wichtig"

**Validation**:
- gueltigBis must be >= gueltigVon
- nachricht max length: 500 characters (optional)

**Server Actions**:

```javascript
export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();

    const gueltigVon = formData.get('gueltigVon');
    const gueltigBis = formData.get('gueltigBis');

    if (gueltigBis < gueltigVon) {
      return { error: 'Enddatum muss nach Startdatum liegen' };
    }

    await db.insert(ankuendigungen).values({
      titel: formData.get('titel'),
      nachricht: formData.get('nachricht'),
      gueltigVon,
      gueltigBis,
      prioritaet: formData.get('prioritaet') || 'normal'
    });

    return { success: true };
  },

  edit: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    const gueltigVon = formData.get('gueltigVon');
    const gueltigBis = formData.get('gueltigBis');

    if (gueltigBis < gueltigVon) {
      return { error: 'Enddatum muss nach Startdatum liegen' };
    }

    await db.update(ankuendigungen)
      .set({
        titel: formData.get('titel'),
        nachricht: formData.get('nachricht'),
        gueltigVon,
        gueltigBis,
        prioritaet: formData.get('prioritaet'),
        updatedAt: new Date()
      })
      .where(eq(ankuendigungen.id, id));

    return { success: true };
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    await db.delete(ankuendigungen).where(eq(ankuendigungen.id, id));
    return { success: true };
  }
};
```

**German Labels**:
- Title: "Titel"
- Message: "Nachricht"
- Valid from: "Gültig von"
- Valid until: "Gültig bis"
- Priority: "Priorität"
- Normal: "Normal"
- Important: "Wichtig"
- Save: "Speichern"
- Delete: "Löschen"

**Acceptance Criteria**:
- [ ] Form renders with all fields
- [ ] Date validation works
- [ ] Priority dropdown works
- [ ] Can create announcement
- [ ] Can edit announcement

---

### 9.3 Implement Validity Period

**Date Picker Behavior**:
- Use native date inputs or Bits UI date picker
- Default gueltigVon: today
- Default gueltigBis: today + 7 days

**Quick Presets** (optional UX enhancement):
- Heute nur (today only)
- Diese Woche (this week)
- Diesen Monat (this month)

**Acceptance Criteria**:
- [ ] Date inputs work correctly
- [ ] Cannot set end before start
- [ ] Status updates based on dates

---

### 9.4 Implement Priority Levels

**Visual Treatment**:
- Normal: Standard styling
- Wichtig: Red/orange accent, "Wichtig" badge

**Dashboard Impact**:
- Important announcements shown first
- Important announcements have distinct styling

**Acceptance Criteria**:
- [ ] Priority selection works
- [ ] Important announcements visually distinct
- [ ] Sorting respects priority

---

## Example Announcements

```javascript
const examples = [
  {
    titel: "Sommerfest",
    nachricht: "Am 15. Juli findet unser jährliches Sommerfest statt. Alle Familien sind herzlich eingeladen!",
    prioritaet: "wichtig"
  },
  {
    titel: "Schließtag",
    nachricht: "Am Freitag, 24.01. bleibt die Kita wegen einer Fortbildung geschlossen.",
    prioritaet: "wichtig"
  },
  {
    titel: "Neue Öffnungszeiten",
    nachricht: "Ab Februar öffnen wir bereits um 7:00 Uhr statt 7:30 Uhr.",
    prioritaet: "normal"
  }
];
```

---

## Files to Create/Modify
- `src/routes/admin/ankuendigungen/+page.server.js`
- `src/routes/admin/ankuendigungen/+page.svelte`
