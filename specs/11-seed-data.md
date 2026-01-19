# Spec: Seed Data

## Overview
Create seed script with demo data for development and testing.

---

## Tasks

### 11.1 Create Seed Script

**File**: `scripts/seed.js`

```javascript
import { db } from '../src/lib/server/db/index.js';
import { gruppen, kinder, erzieher, dienstplan, mahlzeiten, ankuendigungen } from '../src/lib/server/db/schema.js';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data (in reverse order of dependencies)
  await db.delete(dienstplan);
  await db.delete(mahlzeiten);
  await db.delete(ankuendigungen);
  await db.delete(kinder);
  await db.delete(erzieher);
  await db.delete(gruppen);

  // Insert groups
  const [sonnenkaefer, schmetterlinge, loewenzahn] = await db.insert(gruppen).values([
    { name: 'Sonnenkäfer', farbe: '#FF6B6B' },
    { name: 'Schmetterlinge', farbe: '#4ECDC4' },
    { name: 'Löwenzahn', farbe: '#45B7D1' }
  ]).returning();

  console.log('✅ Groups created');

  // Insert children
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // One child with birthday today for testing
  const birthdayChild = {
    vorname: 'Emma',
    nachname: 'Müller',
    geburtstag: `2021-${todayStr.slice(5)}`, // Same month-day as today, year 2021 (will turn 5)
    gruppeId: sonnenkaefer.id
  };

  await db.insert(kinder).values([
    birthdayChild,
    { vorname: 'Leon', nachname: 'Schmidt', geburtstag: '2020-03-15', gruppeId: sonnenkaefer.id },
    { vorname: 'Mia', nachname: 'Weber', geburtstag: '2021-07-22', gruppeId: sonnenkaefer.id },
    { vorname: 'Ben', nachname: 'Fischer', geburtstag: '2020-11-08', gruppeId: schmetterlinge.id },
    { vorname: 'Hannah', nachname: 'Meyer', geburtstag: '2021-02-14', gruppeId: schmetterlinge.id },
    { vorname: 'Paul', nachname: 'Wagner', geburtstag: '2020-09-30', gruppeId: schmetterlinge.id },
    { vorname: 'Lina', nachname: 'Becker', geburtstag: '2021-05-18', gruppeId: loewenzahn.id },
    { vorname: 'Felix', nachname: 'Hoffmann', geburtstag: '2020-12-03', gruppeId: loewenzahn.id },
    { vorname: 'Sophie', nachname: 'Koch', geburtstag: '2021-08-27', gruppeId: loewenzahn.id },
    { vorname: 'Max', nachname: 'Richter', geburtstag: '2020-04-11', gruppeId: loewenzahn.id }
  ]);

  console.log('✅ Children created');

  // Insert teachers
  const [maria, thomas, lisa, anna] = await db.insert(erzieher).values([
    { vorname: 'Maria', nachname: 'Schmidt', email: 'maria.schmidt@kita.de' },
    { vorname: 'Thomas', nachname: 'Krause', email: 'thomas.krause@kita.de' },
    { vorname: 'Lisa', nachname: 'Weber', email: 'lisa.weber@kita.de' },
    { vorname: 'Anna', nachname: 'Braun', email: 'anna.braun@kita.de' }
  ]).returning();

  console.log('✅ Teachers created');

  // Insert schedules for this week
  const weekDays = getWeekDays(today);

  const scheduleEntries = [];
  weekDays.forEach(day => {
    // Maria: early shift Mon-Thu
    if (day.getDay() >= 1 && day.getDay() <= 4) {
      scheduleEntries.push({
        erzieherId: maria.id,
        datum: formatDate(day),
        startZeit: '07:00',
        endZeit: '14:00'
      });
    }
    // Thomas: late shift Mon-Fri
    if (day.getDay() >= 1 && day.getDay() <= 5) {
      scheduleEntries.push({
        erzieherId: thomas.id,
        datum: formatDate(day),
        startZeit: '11:00',
        endZeit: '18:00'
      });
    }
    // Lisa: early shift Mon, Wed, Fri
    if ([1, 3, 5].includes(day.getDay())) {
      scheduleEntries.push({
        erzieherId: lisa.id,
        datum: formatDate(day),
        startZeit: '07:00',
        endZeit: '14:00'
      });
    }
    // Anna: late shift Tue, Thu
    if ([2, 4].includes(day.getDay())) {
      scheduleEntries.push({
        erzieherId: anna.id,
        datum: formatDate(day),
        startZeit: '12:00',
        endZeit: '18:00'
      });
    }
  });

  if (scheduleEntries.length > 0) {
    await db.insert(dienstplan).values(scheduleEntries);
  }

  console.log('✅ Schedules created');

  // Insert meals for this week
  const mealEntries = [];
  weekDays.filter(d => d.getDay() >= 1 && d.getDay() <= 5).forEach(day => {
    const dayStr = formatDate(day);
    mealEntries.push(
      { datum: dayStr, typ: 'fruehstueck', beschreibung: getMealForDay(day.getDay(), 'fruehstueck') },
      { datum: dayStr, typ: 'mittagessen', beschreibung: getMealForDay(day.getDay(), 'mittagessen') },
      { datum: dayStr, typ: 'snack', beschreibung: getMealForDay(day.getDay(), 'snack') }
    );
  });

  if (mealEntries.length > 0) {
    await db.insert(mahlzeiten).values(mealEntries);
  }

  console.log('✅ Meals created');

  // Insert announcements
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  await db.insert(ankuendigungen).values([
    {
      titel: 'Sommerfest',
      nachricht: 'Am 15. Juli findet unser jährliches Sommerfest statt. Alle Familien sind herzlich eingeladen! Bitte bringt gute Laune und einen Salat oder Kuchen mit.',
      gueltigVon: todayStr,
      gueltigBis: formatDate(nextWeek),
      prioritaet: 'wichtig'
    },
    {
      titel: 'Neue Öffnungszeiten ab Februar',
      nachricht: 'Ab dem 1. Februar öffnen wir bereits um 7:00 Uhr statt 7:30 Uhr. Die Schließzeit bleibt bei 18:00 Uhr.',
      gueltigVon: todayStr,
      gueltigBis: formatDate(nextWeek),
      prioritaet: 'normal'
    },
    {
      titel: 'Bitte Wechselkleidung mitbringen',
      nachricht: 'Das Wetter wird wechselhaft. Bitte stellen Sie sicher, dass Ihr Kind Wechselkleidung in der Kita hat.',
      gueltigVon: todayStr,
      gueltigBis: formatDate(nextWeek),
      prioritaet: 'normal'
    }
  ]);

  console.log('✅ Announcements created');

  console.log('🎉 Seeding complete!');
}

// Helper functions
function getWeekDays(date) {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - monday.getDay() + 1);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }
  return days;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getMealForDay(dayOfWeek, type) {
  const meals = {
    fruehstueck: [
      '', // Sunday
      'Vollkornbrot mit Käse und Gurke',
      'Müsli mit frischem Obst',
      'Joghurt mit Haferflocken und Beeren',
      'Brötchen mit Frischkäse',
      'Obstsalat mit Quark'
    ],
    mittagessen: [
      '',
      'Spaghetti Bolognese mit Salat',
      'Gemüsesuppe mit Vollkornbrot',
      'Kartoffelpüree mit Fischstäbchen',
      'Reis mit Gemüsepfanne',
      'Pizza mit Salat'
    ],
    snack: [
      '',
      'Apfelschnitze mit Nussbutter',
      'Gemüsesticks mit Hummus',
      'Käsewürfel mit Weintrauben',
      'Vollkornkekse mit Milch',
      'Banane und Kiwi'
    ]
  };

  return meals[type][dayOfWeek] || 'Noch nicht geplant';
}

seed().catch(console.error);
```

**package.json script**:
```json
{
  "scripts": {
    "db:seed": "node scripts/seed.js"
  }
}
```

**Acceptance Criteria**:
- [ ] Script runs without errors
- [ ] All tables populated with test data
- [ ] At least one birthday child for today
- [ ] Schedules cover current week
- [ ] Meals cover current week
- [ ] Active announcements exist

---

## Sample Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Groups | 3 | Sonnenkäfer, Schmetterlinge, Löwenzahn |
| Children | 10 | 1 with birthday today |
| Teachers | 4 | Various shift patterns |
| Schedules | ~20 | Current week coverage |
| Meals | ~15 | Mon-Fri, 3 per day |
| Announcements | 3 | Mix of priorities |

---

## Files to Create/Modify
- `scripts/seed.js` (seed script)
- `package.json` (add db:seed script)
