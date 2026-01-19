# Spec: Public Dashboard

## Overview

Public display for kindergarten entrance showing daily information.

## Route

`/` (root)

---

## Tasks

### 10.1 Create Dashboard Layout

**File**: `src/routes/+page.server.js`

```javascript
import { db } from '$lib/server/db';
import {
	kinder,
	erzieher,
	dienstplan,
	mahlzeiten,
	ankuendigungen,
	gruppen
} from '$lib/server/db/schema';
import { eq, and, lte, gte, sql } from 'drizzle-orm';

export async function load() {
	const today = new Date().toISOString().split('T')[0];
	const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM

	// Get today's month and day for birthday check
	const monthDay = today.slice(5); // MM-DD

	// Get birthday children (match month-day regardless of year)
	const birthdayKinder = await db
		.select({
			id: kinder.id,
			vorname: kinder.vorname,
			nachname: kinder.nachname,
			geburtstag: kinder.geburtstag,
			fotoPath: kinder.fotoPath,
			gruppe: gruppen
		})
		.from(kinder)
		.leftJoin(gruppen, eq(kinder.gruppeId, gruppen.id))
		.where(sql`substr(${kinder.geburtstag}, 6) = ${monthDay}`);

	// Get teachers on duty now
	const onDutyTeachers = await db
		.select({
			id: erzieher.id,
			vorname: erzieher.vorname,
			nachname: erzieher.nachname,
			fotoPath: erzieher.fotoPath,
			startZeit: dienstplan.startZeit,
			endZeit: dienstplan.endZeit
		})
		.from(dienstplan)
		.innerJoin(erzieher, eq(dienstplan.erzieherId, erzieher.id))
		.where(
			and(
				eq(dienstplan.datum, today),
				lte(dienstplan.startZeit, currentTime),
				gte(dienstplan.endZeit, currentTime)
			)
		);

	// Get today's meals
	const todayMeals = await db
		.select()
		.from(mahlzeiten)
		.where(eq(mahlzeiten.datum, today))
		.orderBy(
			sql`CASE typ WHEN 'fruehstueck' THEN 1 WHEN 'mittagessen' THEN 2 WHEN 'snack' THEN 3 END`
		);

	// Get active announcements
	const activeAnnouncements = await db
		.select()
		.from(ankuendigungen)
		.where(and(lte(ankuendigungen.gueltigVon, today), gte(ankuendigungen.gueltigBis, today)))
		.orderBy(sql`CASE prioritaet WHEN 'wichtig' THEN 0 ELSE 1 END`);

	return {
		birthdayKinder,
		onDutyTeachers,
		todayMeals,
		activeAnnouncements,
		currentDate: today
	};
}
```

**File**: `src/routes/+page.svelte`

**Layout Structure** (Widescreen 16:9 optimized):

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Kindergarten Name + Date + Time                    │
├─────────────────┬─────────────────┬─────────────────────────┤
│                 │                 │                         │
│  ANNOUNCEMENTS  │   BIRTHDAYS     │      MEALS              │
│                 │                 │                         │
│                 │                 ├─────────────────────────┤
│                 │                 │                         │
│                 │                 │   TEACHERS ON DUTY      │
│                 │                 │                         │
├─────────────────┴─────────────────┴─────────────────────────┤
│  FOOTER (optional): Current time, auto-refresh indicator    │
└─────────────────────────────────────────────────────────────┘
```

**Design Specs**:

- Full viewport height (100vh)
- Dark background with light cards
- Large, readable typography
- Generous spacing

**CSS Variables**:

```css
:root {
	--dashboard-bg: #1a1a2e;
	--card-bg: #16213e;
	--accent-warm: #e94560;
	--accent-teal: #0f3460;
	--text-primary: #ffffff;
	--text-secondary: #a0a0a0;
}
```

**Acceptance Criteria**:

- [ ] Layout fills viewport
- [ ] Responsive to widescreen aspect ratio
- [ ] All sections visible without scrolling
- [ ] Clock shows current time

---

### 10.2 Implement Announcements Section

**Display Requirements**:

- Show all active announcements
- Important (wichtig) announcements highlighted
- Auto-scroll if many announcements (optional)

**Card Structure**:

```
┌─────────────────────────────┐
│ ⚠️ WICHTIG                  │  ← badge for important
│ Schließtag                  │  ← title
│ Am Freitag bleibt die       │
│ Kita geschlossen...         │  ← message
└─────────────────────────────┘
```

**German Labels**:

- Section title: "Ankündigungen"
- Important badge: "Wichtig"
- Empty state: "Keine Ankündigungen"

**Acceptance Criteria**:

- [ ] Active announcements displayed
- [ ] Important announcements visually distinct
- [ ] Empty state handled

---

### 10.3 Implement Birthday Section

**Display Requirements**:

- Show children with birthday today
- Display photo (or placeholder), name, age
- Celebratory styling (confetti, balloons, etc.)

**Card Structure**:

```
┌─────────────────────────────┐
│      🎂 Geburtstag! 🎂      │
│                             │
│    [PHOTO]                  │
│    Emma                     │
│    wird heute 5 Jahre alt!  │
│                             │
└─────────────────────────────┘
```

**Age Calculation**:

```javascript
function calculateAge(birthday) {
	const today = new Date();
	const birthDate = new Date(birthday);
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age + 1; // Age they're turning today
}
```

**German Labels**:

- Section title: "Geburtstagskinder"
- Turning age: "wird heute {age} Jahre alt!"
- Empty state: "Heute hat niemand Geburtstag"

**Acceptance Criteria**:

- [ ] Birthday children displayed with photos
- [ ] Age calculation correct
- [ ] Celebratory visual treatment
- [ ] Empty state handled

---

### 10.4 Implement Meals Section

**Display Requirements**:

- Show all three meals for today
- Icon + meal type + description
- Clear visual hierarchy

**Layout**:

```
┌─────────────────────────────┐
│   🍽️ Speiseplan             │
│                             │
│   🌅 Frühstück              │
│      Müsli mit frischem     │
│      Obst                   │
│                             │
│   🍝 Mittagessen            │
│      Spaghetti Bolognese    │
│                             │
│   🍎 Snack                  │
│      Joghurt mit Beeren     │
└─────────────────────────────┘
```

**German Labels**:

- Section title: "Speiseplan"
- Breakfast: "Frühstück"
- Lunch: "Mittagessen"
- Snack: "Nachmittagssnack"
- Empty state: "Kein Speiseplan eingetragen"

**Acceptance Criteria**:

- [ ] All meal types shown
- [ ] Clear meal type labels
- [ ] Empty state for missing meals

---

### 10.5 Implement Teachers On Duty Section

**Display Requirements**:

- Show teachers currently on shift
- Display photo and name
- Update throughout the day as shifts change

**Layout**:

```
┌─────────────────────────────┐
│   👩‍🏫 Heute anwesend        │
│                             │
│   [PHOTO] Maria Schmidt     │
│   [PHOTO] Thomas Krause     │
│   [PHOTO] Lisa Weber        │
└─────────────────────────────┘
```

**German Labels**:

- Section title: "Heute anwesend"
- Empty state: "Aktuell niemand im Dienst"

**Acceptance Criteria**:

- [ ] Current teachers displayed
- [ ] Photos shown (or placeholder)
- [ ] Updates when data refreshes
- [ ] Empty state handled

---

### 10.6 Implement Auto-Refresh

**Strategy**: Client-side polling every 30 seconds

**Implementation**:

```svelte
<script>
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 30000); // 30 seconds

		return () => clearInterval(interval);
	});
</script>
```

**Optional: Visual Refresh Indicator**:

- Small pulsing dot in corner
- Or subtle fade transition on refresh

**Acceptance Criteria**:

- [ ] Data refreshes every 30 seconds
- [ ] No full page reload (smooth update)
- [ ] Clock updates in real-time

---

### 10.7 Add Entrance Animations

**Animation Strategy**:

- Staggered entrance on page load
- Subtle scale/fade for each section
- CSS-only where possible

**Implementation**:

```css
.dashboard-section {
	animation: fadeSlideIn 0.6s ease-out forwards;
	opacity: 0;
}

.dashboard-section:nth-child(1) {
	animation-delay: 0.1s;
}
.dashboard-section:nth-child(2) {
	animation-delay: 0.2s;
}
.dashboard-section:nth-child(3) {
	animation-delay: 0.3s;
}
.dashboard-section:nth-child(4) {
	animation-delay: 0.4s;
}

@keyframes fadeSlideIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
```

**Acceptance Criteria**:

- [ ] Sections animate in on load
- [ ] Staggered timing creates visual interest
- [ ] Animations don't trigger on refresh

---

## Real-Time Clock Component

**File**: `src/lib/components/Clock.svelte`

```svelte
<script>
	import { onMount } from 'svelte';

	let time = $state(new Date());

	onMount(() => {
		const interval = setInterval(() => {
			time = new Date();
		}, 1000);

		return () => clearInterval(interval);
	});

	let formattedTime = $derived(
		time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
	);

	let formattedDate = $derived(
		time.toLocaleDateString('de-DE', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);
</script>

<div class="clock">
	<div class="time">{formattedTime}</div>
	<div class="date">{formattedDate}</div>
</div>
```

---

## Files to Create/Modify

- `src/routes/+page.server.js` (data loading)
- `src/routes/+page.svelte` (dashboard layout)
- `src/lib/components/Clock.svelte` (real-time clock)
- `src/lib/components/AnnouncementCard.svelte` (optional)
- `src/lib/components/BirthdayCard.svelte` (optional)
- `src/lib/components/MealCard.svelte` (optional)
- `src/lib/components/TeacherCard.svelte` (optional)
