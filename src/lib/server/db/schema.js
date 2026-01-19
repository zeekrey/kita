import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============================================
// Better-Auth Required Tables
// ============================================

// User table for authentication
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Session table for user sessions
export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	token: text('token').notNull().unique(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Account table for auth providers
export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	password: text('password'),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	idToken: text('id_token'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Verification table for email verification, password resets, etc.
export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Better-Auth relations
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

// ============================================
// Application Tables
// ============================================

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
