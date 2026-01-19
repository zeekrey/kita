import { db } from '$lib/server/db';
import { erzieher, dienstplan } from '$lib/server/db/schema';
import { eq, and, not } from 'drizzle-orm';

export async function load() {
	const allErzieher = await db.select().from(erzieher).orderBy(erzieher.nachname, erzieher.vorname);

	return { erzieher: allErzieher };
}

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const vorname = formData.get('vorname');
		const nachname = formData.get('nachname');
		const email = formData.get('email');
		const fotoPath = formData.get('fotoPath') || null;

		if (!vorname || !nachname || !email) {
			return { error: 'Alle Felder sind erforderlich' };
		}

		// Check for duplicate email
		const existing = await db.select().from(erzieher).where(eq(erzieher.email, email)).limit(1);

		if (existing.length > 0) {
			return { error: 'E-Mail bereits vorhanden' };
		}

		await db.insert(erzieher).values({
			vorname,
			nachname,
			email,
			fotoPath
		});

		return { success: true };
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const vorname = formData.get('vorname');
		const nachname = formData.get('nachname');
		const email = formData.get('email');
		const fotoPath = formData.get('fotoPath') || null;

		if (!id || !vorname || !nachname || !email) {
			return { error: 'Alle Felder sind erforderlich' };
		}

		// Check for duplicate email (excluding self)
		const existing = await db
			.select()
			.from(erzieher)
			.where(and(eq(erzieher.email, email), not(eq(erzieher.id, id))))
			.limit(1);

		if (existing.length > 0) {
			return { error: 'E-Mail bereits vorhanden' };
		}

		await db
			.update(erzieher)
			.set({
				vorname,
				nachname,
				email,
				fotoPath,
				updatedAt: new Date()
			})
			.where(eq(erzieher.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return { error: 'Erzieher-ID erforderlich' };
		}

		// Check for schedule entries
		const schedules = await db
			.select()
			.from(dienstplan)
			.where(eq(dienstplan.erzieherId, id))
			.limit(1);

		if (schedules.length > 0) {
			return { error: 'Erzieher/in hat noch Dienstplan-Einträge' };
		}

		await db.delete(erzieher).where(eq(erzieher.id, id));
		return { success: true };
	}
};
