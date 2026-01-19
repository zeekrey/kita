import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Groups table
export const gruppen = sqliteTable('gruppen', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	farbe: text('farbe').notNull(), // hex color e.g. "#FF5733"
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Children table
export const kinder = sqliteTable('kinder', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	vorname: text('vorname').notNull(),
	nachname: text('nachname').notNull(),
	geburtstag: text('geburtstag').notNull(), // ISO date string YYYY-MM-DD
	gruppeId: text('gruppe_id').references(() => gruppen.id),
	fotoPath: text('foto_path'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Teachers table
export const erzieher = sqliteTable('erzieher', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	vorname: text('vorname').notNull(),
	nachname: text('nachname').notNull(),
	email: text('email').notNull().unique(),
	fotoPath: text('foto_path'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Teacher schedules table
export const dienstplan = sqliteTable('dienstplan', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	erzieherId: text('erzieher_id').notNull().references(() => erzieher.id),
	datum: text('datum').notNull(), // ISO date string YYYY-MM-DD
	startZeit: text('start_zeit').notNull(), // HH:MM format
	endZeit: text('end_zeit').notNull(), // HH:MM format
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Meals table
export const mahlzeiten = sqliteTable('mahlzeiten', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	datum: text('datum').notNull(), // ISO date string YYYY-MM-DD
	typ: text('typ').notNull(), // 'fruehstueck' | 'mittagessen' | 'snack'
	beschreibung: text('beschreibung').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Announcements table
export const ankuendigungen = sqliteTable('ankuendigungen', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	titel: text('titel').notNull(),
	nachricht: text('nachricht').notNull(),
	gueltigVon: text('gueltig_von').notNull(), // ISO date string YYYY-MM-DD
	gueltigBis: text('gueltig_bis').notNull(), // ISO date string YYYY-MM-DD
	prioritaet: text('prioritaet').notNull().default('normal'), // 'normal' | 'wichtig'
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Drizzle Relations
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
