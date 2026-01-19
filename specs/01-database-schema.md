# Spec: Database Schema

## Overview

Define all database tables using Drizzle ORM with SQLite.

## Schema Location

`src/lib/server/db/schema.js`

---

## Tables

### 1.1 gruppen (Groups)

```javascript
export const gruppen = sqliteTable('gruppen', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	farbe: text('farbe').notNull(), // hex color e.g. "#FF5733"
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});
```

**Acceptance Criteria**:

- [ ] Table created in database
- [ ] Can insert/query groups

---

### 1.2 kinder (Children)

```javascript
export const kinder = sqliteTable('kinder', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	vorname: text('vorname').notNull(),
	nachname: text('nachname').notNull(),
	geburtstag: text('geburtstag').notNull(), // ISO date string YYYY-MM-DD
	gruppeId: text('gruppe_id').references(() => gruppen.id),
	fotoPath: text('foto_path'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});
```

**Relations**:

- `gruppeId` → `gruppen.id` (many-to-one)

**Acceptance Criteria**:

- [ ] Table created with foreign key constraint
- [ ] Can query children with their group

---

### 1.3 erzieher (Teachers)

```javascript
export const erzieher = sqliteTable('erzieher', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	vorname: text('vorname').notNull(),
	nachname: text('nachname').notNull(),
	email: text('email').notNull().unique(),
	fotoPath: text('foto_path'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});
```

**Acceptance Criteria**:

- [ ] Table created with unique email constraint
- [ ] Can insert/query teachers

---

### 1.4 dienstplan (Teacher Schedules)

```javascript
export const dienstplan = sqliteTable('dienstplan', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	erzieherId: text('erzieher_id')
		.notNull()
		.references(() => erzieher.id),
	datum: text('datum').notNull(), // ISO date string YYYY-MM-DD
	startZeit: text('start_zeit').notNull(), // HH:MM format
	endZeit: text('end_zeit').notNull(), // HH:MM format
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});
```

**Relations**:

- `erzieherId` → `erzieher.id` (many-to-one)

**Acceptance Criteria**:

- [ ] Table created with foreign key constraint
- [ ] Can query schedules for a specific date
- [ ] Can query schedules for a specific teacher

---

### 1.5 mahlzeiten (Meals)

```javascript
export const mahlzeiten = sqliteTable('mahlzeiten', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	datum: text('datum').notNull(), // ISO date string YYYY-MM-DD
	typ: text('typ').notNull(), // 'fruehstueck' | 'mittagessen' | 'snack'
	beschreibung: text('beschreibung').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});
```

**Meal Types**:

- `fruehstueck` - Breakfast
- `mittagessen` - Lunch
- `snack` - Afternoon snack

**Acceptance Criteria**:

- [ ] Table created
- [ ] Can query meals for a specific date
- [ ] Can query meals filtered by type

---

### 1.6 ankuendigungen (Announcements)

```javascript
export const ankuendigungen = sqliteTable('ankuendigungen', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	titel: text('titel').notNull(),
	nachricht: text('nachricht').notNull(),
	gueltigVon: text('gueltig_von').notNull(), // ISO date string YYYY-MM-DD
	gueltigBis: text('gueltig_bis').notNull(), // ISO date string YYYY-MM-DD
	prioritaet: text('prioritaet').notNull().default('normal'), // 'normal' | 'wichtig'
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});
```

**Priority Levels**:

- `normal` - Standard announcement
- `wichtig` - Important announcement (highlighted on dashboard)

**Acceptance Criteria**:

- [ ] Table created
- [ ] Can query active announcements for current date
- [ ] Priority filtering works

---

### 1.7 Run Database Migrations

**Command**:

```bash
bun run db:push
```

**Acceptance Criteria**:

- [ ] All tables created in SQLite database
- [ ] No migration errors
- [ ] Database file exists at configured location

---

## Drizzle Relations (Optional Enhancement)

```javascript
import { relations } from 'drizzle-orm';

export const gruppenRelations = relations(gruppen, ({ many }) => ({
	kinder: many(kinder)
}));

export const kinderRelations = relations(kinder, ({ one }) => ({
	gruppe: one(gruppen, {
		fields: [kinder.gruppeId],
		references: [gruppen.id]
	})
}));

export const erzieherRelations = relations(erzieher, ({ many }) => ({
	dienstplan: many(dienstplan)
}));

export const dienstplanRelations = relations(dienstplan, ({ one }) => ({
	erzieher: one(erzieher, {
		fields: [dienstplan.erzieherId],
		references: [erzieher.id]
	})
}));
```

---

## Files to Create/Modify

- `src/lib/server/db/schema.js` (main schema file)
