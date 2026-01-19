import { db } from '$lib/server/db';
import { erzieher, dienstplan } from '$lib/server/db/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { getMonday, getSunday, formatDate } from '$lib/utils/date.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const weekParam = url.searchParams.get('week');
	const currentDate = weekParam ? new Date(weekParam) : new Date();

	const weekStart = getMonday(currentDate);
	const weekEnd = getSunday(currentDate);

	const teachers = await db.select().from(erzieher).orderBy(erzieher.nachname, erzieher.vorname);

	const schedules = await db
		.select()
		.from(dienstplan)
		.where(
			and(
				gte(dienstplan.datum, formatDate(weekStart)),
				lte(dienstplan.datum, formatDate(weekEnd))
			)
		);

	return {
		teachers,
		schedules,
		weekStart: formatDate(weekStart),
		weekEnd: formatDate(weekEnd)
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const erzieherId = formData.get('erzieherId')?.toString();
		const datum = formData.get('datum')?.toString();
		const startZeit = formData.get('startZeit')?.toString();
		const endZeit = formData.get('endZeit')?.toString();

		if (!erzieherId || !datum || !startZeit || !endZeit) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		if (startZeit >= endZeit) {
			return fail(400, { error: 'Startzeit muss vor Endzeit liegen' });
		}

		const id = crypto.randomUUID();
		const now = Date.now();

		await db.insert(dienstplan).values({
			id,
			erzieherId,
			datum,
			startZeit,
			endZeit,
			createdAt: now,
			updatedAt: now
		});

		return { success: true };
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const startZeit = formData.get('startZeit')?.toString();
		const endZeit = formData.get('endZeit')?.toString();

		if (!id || !startZeit || !endZeit) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		if (startZeit >= endZeit) {
			return fail(400, { error: 'Startzeit muss vor Endzeit liegen' });
		}

		await db
			.update(dienstplan)
			.set({
				startZeit,
				endZeit,
				updatedAt: Date.now()
			})
			.where(eq(dienstplan.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID ist erforderlich' });
		}

		await db.delete(dienstplan).where(eq(dienstplan.id, id));

		return { success: true };
	}
};
