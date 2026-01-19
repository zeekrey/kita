import { db } from '$lib/server/db';
import { ankuendigungen } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const announcements = await db
		.select()
		.from(ankuendigungen)
		.orderBy(desc(ankuendigungen.gueltigVon));

	return { announcements };
}

/** @type {import('./$types').Actions} */
export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const titel = formData.get('titel')?.toString()?.trim();
		const nachricht = formData.get('nachricht')?.toString()?.trim();
		const gueltigVon = formData.get('gueltigVon')?.toString();
		const gueltigBis = formData.get('gueltigBis')?.toString();
		const prioritaet = formData.get('prioritaet')?.toString() || 'normal';

		if (!titel || !nachricht || !gueltigVon || !gueltigBis) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		if (gueltigBis < gueltigVon) {
			return fail(400, { error: 'Enddatum muss nach Startdatum liegen' });
		}

		const id = crypto.randomUUID();
		const now = Date.now();

		await db.insert(ankuendigungen).values({
			id,
			titel,
			nachricht,
			gueltigVon,
			gueltigBis,
			prioritaet,
			createdAt: now,
			updatedAt: now
		});

		return { success: true };
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const titel = formData.get('titel')?.toString()?.trim();
		const nachricht = formData.get('nachricht')?.toString()?.trim();
		const gueltigVon = formData.get('gueltigVon')?.toString();
		const gueltigBis = formData.get('gueltigBis')?.toString();
		const prioritaet = formData.get('prioritaet')?.toString() || 'normal';

		if (!id || !titel || !nachricht || !gueltigVon || !gueltigBis) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		if (gueltigBis < gueltigVon) {
			return fail(400, { error: 'Enddatum muss nach Startdatum liegen' });
		}

		await db
			.update(ankuendigungen)
			.set({
				titel,
				nachricht,
				gueltigVon,
				gueltigBis,
				prioritaet,
				updatedAt: Date.now()
			})
			.where(eq(ankuendigungen.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID ist erforderlich' });
		}

		await db.delete(ankuendigungen).where(eq(ankuendigungen.id, id));

		return { success: true };
	}
};
