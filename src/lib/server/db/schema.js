import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============================================
// Better-Auth Required Tables
// ============================================

// User table for authentication
// Role values: 'admin' | 'parent' | 'employee'
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
	image: text('image'),
	role: text('role').notNull().default('parent'), // 'admin' | 'parent' | 'employee'
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

// Better-Auth relations (extended with role-based tables)
export const userRelations = relations(user, ({ many, one }) => ({
	sessions: many(session),
	accounts: many(account),
	eltern: one(eltern), // One-to-one: user -> parent profile
	mitarbeiter: one(mitarbeiter) // One-to-one: user -> employee profile
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
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	farbe: text('farbe').notNull(), // hex color e.g. "#FF5733"
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Children table
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

// Teachers table
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

// Teacher schedules table
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

// Meals table
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

// Announcements table
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

// ============================================
// Role-Based Tables
// ============================================

// Parents table - links to user accounts with role='parent'
export const eltern = sqliteTable('eltern', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	telefon: text('telefon'), // Phone number
	adresse: text('adresse'), // Address
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Parent-Child junction table - many-to-many relationship
// Relationship types: 'mutter' | 'vater' | 'erziehungsberechtigter'
export const elternKinder = sqliteTable('eltern_kinder', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	elternId: text('eltern_id')
		.notNull()
		.references(() => eltern.id, { onDelete: 'cascade' }),
	kindId: text('kind_id')
		.notNull()
		.references(() => kinder.id, { onDelete: 'cascade' }),
	beziehung: text('beziehung').notNull().default('erziehungsberechtigter'), // 'mutter' | 'vater' | 'erziehungsberechtigter'
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Employees table - links to user accounts with role='employee'
// Can optionally link to an erzieher record for teachers
export const mitarbeiter = sqliteTable('mitarbeiter', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	erzieherId: text('erzieher_id').references(() => erzieher.id), // Optional link to erzieher
	position: text('position'), // Job title
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Drizzle Relations
export const gruppenRelations = relations(gruppen, ({ many }) => ({
	kinder: many(kinder)
}));

export const kinderRelations = relations(kinder, ({ one, many }) => ({
	gruppe: one(gruppen, {
		fields: [kinder.gruppeId],
		references: [gruppen.id]
	}),
	elternKinder: many(elternKinder) // Many-to-many with parents via junction table
}));

export const erzieherRelations = relations(erzieher, ({ many, one }) => ({
	dienstplan: many(dienstplan),
	mitarbeiter: one(mitarbeiter) // Optional link to employee profile
}));

export const dienstplanRelations = relations(dienstplan, ({ one }) => ({
	erzieher: one(erzieher, {
		fields: [dienstplan.erzieherId],
		references: [erzieher.id]
	})
}));

// ============================================
// Role-Based Relations
// ============================================

export const elternRelations = relations(eltern, ({ one, many }) => ({
	user: one(user, {
		fields: [eltern.userId],
		references: [user.id]
	}),
	elternKinder: many(elternKinder) // Many-to-many with children via junction table
}));

export const elternKinderRelations = relations(elternKinder, ({ one }) => ({
	eltern: one(eltern, {
		fields: [elternKinder.elternId],
		references: [eltern.id]
	}),
	kind: one(kinder, {
		fields: [elternKinder.kindId],
		references: [kinder.id]
	})
}));

export const mitarbeiterRelations = relations(mitarbeiter, ({ one }) => ({
	user: one(user, {
		fields: [mitarbeiter.userId],
		references: [user.id]
	}),
	erzieher: one(erzieher, {
		fields: [mitarbeiter.erzieherId],
		references: [erzieher.id]
	})
}));
