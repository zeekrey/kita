# Spec: Meal Planning

## Overview

Weekly meal planner interface for managing meals (Speiseplan).

## Route

`/admin/speiseplan`

---

## Tasks

### 8.1 Create Meal Planning Page

**File**: `src/routes/admin/speiseplan/+page.server.js`

```javascript
import { db } from '$lib/server/db';
import { mahlzeiten } from '$lib/server/db/schema';
import { and, gte, lte } from 'drizzle-orm';

export async function load({ url }) {
	// Get week from URL params or default to current week
	const weekParam = url.searchParams.get('week');
	const currentDate = weekParam ? new Date(weekParam) : new Date();

	const weekStart = getMonday(currentDate);
	const weekEnd = getFriday(currentDate); // Meals only Mon-Fri typically

	const weekMeals = await db
		.select()
		.from(mahlzeiten)
		.where(
			and(gte(mahlzeiten.datum, formatDate(weekStart)), lte(mahlzeiten.datum, formatDate(weekEnd)))
		)
		.orderBy(mahlzeiten.datum, mahlzeiten.typ);

	return {
		meals: weekMeals,
		weekStart: formatDate(weekStart),
		weekEnd: formatDate(weekEnd)
	};
}
```

**File**: `src/routes/admin/speiseplan/+page.svelte`

**UI Requirements**:

- Page title: "Speiseplan"
- Week navigation (previous/next week)
- Current week indicator
- Weekly grid showing meals per day

**Acceptance Criteria**:

- [ ] Page loads with current week
- [ ] Week navigation works
- [ ] Meals grid renders

---

### 8.2 Create Weekly Meal Planner View

**Planner Layout**:

```
|              | Mo 20. | Di 21. | Mi 22. | Do 23. | Fr 24. |
|--------------|--------|--------|--------|--------|--------|
| Frühstück    | Müsli  | Brot   | ...    | ...    | ...    |
| Mittagessen  | Nudeln | Reis   | ...    | ...    | ...    |
| Snack        | Obst   | Joghurt| ...    | ...    | ...    |
```

**Features**:

- Rows = Meal types (3 rows)
- Columns = Weekdays (Monday - Friday)
- Each cell shows meal description or "+" to add
- Click cell to add/edit

**Meal Type Labels** (German):
| Type | Label | Icon suggestion |
|------|-------|-----------------|
| fruehstueck | Frühstück | 🌅 or sunrise icon |
| mittagessen | Mittagessen | 🍽️ or plate icon |
| snack | Nachmittagssnack | 🍎 or apple icon |

**Acceptance Criteria**:

- [ ] Three rows for meal types
- [ ] Five columns for weekdays
- [ ] Existing meals shown in cells
- [ ] Empty cells show add button

---

### 8.3 Implement Add/Edit/Delete Meals

**Add/Edit Modal**:

- Meal type (pre-selected based on row)
- Date (pre-selected based on column)
- Description textarea

**Form Fields**:
| Field | Label (DE) | Type | Required |
|-------|------------|------|----------|
| typ | Mahlzeit | hidden/display | Yes |
| datum | Datum | hidden/display | Yes |
| beschreibung | Beschreibung | textarea | Yes |

**Server Actions**:

```javascript
export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();

		// Check if meal already exists for this type/date
		const existing = await db
			.select()
			.from(mahlzeiten)
			.where(
				and(eq(mahlzeiten.datum, formData.get('datum')), eq(mahlzeiten.typ, formData.get('typ')))
			)
			.get();

		if (existing) {
			return { error: 'Mahlzeit bereits vorhanden' };
		}

		await db.insert(mahlzeiten).values({
			datum: formData.get('datum'),
			typ: formData.get('typ'),
			beschreibung: formData.get('beschreibung')
		});

		return { success: true };
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		await db
			.update(mahlzeiten)
			.set({
				beschreibung: formData.get('beschreibung'),
				updatedAt: new Date()
			})
			.where(eq(mahlzeiten.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		await db.delete(mahlzeiten).where(eq(mahlzeiten.id, id));
		return { success: true };
	}
};
```

**German Labels**:

- Add title: "Mahlzeit hinzufügen"
- Edit title: "Mahlzeit bearbeiten"
- Description: "Beschreibung"
- Placeholder: "z.B. Vollkornbrot mit Käse und Gurke"
- Save: "Speichern"
- Delete: "Löschen"
- Cancel: "Abbrechen"

**Acceptance Criteria**:

- [ ] Can add new meal entry
- [ ] Cannot add duplicate (same type/date)
- [ ] Can edit existing meal
- [ ] Can delete meal
- [ ] Grid updates after changes

---

## Meal Type Helper

```javascript
const mealTypes = [
	{ value: 'fruehstueck', label: 'Frühstück', icon: '🌅' },
	{ value: 'mittagessen', label: 'Mittagessen', icon: '🍽️' },
	{ value: 'snack', label: 'Nachmittagssnack', icon: '🍎' }
];

function getMealLabel(typ) {
	return mealTypes.find((m) => m.value === typ)?.label ?? typ;
}
```

---

## Files to Create/Modify

- `src/routes/admin/speiseplan/+page.server.js`
- `src/routes/admin/speiseplan/+page.svelte`
- `src/lib/components/MealEditor.svelte` (optional reusable component)
