import { db } from '$lib/server/db';
import { mahlzeiten } from '$lib/server/db/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { getMonday, getFriday, formatDate } from '$lib/utils/date.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const weekParam = url.searchParams.get('week');
	const currentDate = weekParam ? new Date(weekParam) : new Date();

	const weekStart = getMonday(currentDate);
	const weekEnd = getFriday(currentDate);

	const meals = await db
		.select()
		.from(mahlzeiten)
		.where(
			and(
				gte(mahlzeiten.datum, formatDate(weekStart)),
				lte(mahlzeiten.datum, formatDate(weekEnd))
			)
		);

	return {
		meals,
		weekStart: formatDate(weekStart),
		weekEnd: formatDate(weekEnd)
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const datum = formData.get('datum')?.toString();
		const typ = formData.get('typ')?.toString();
		const beschreibung = formData.get('beschreibung')?.toString()?.trim();

		if (!datum || !typ || !beschreibung) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		// Check for duplicate (same type and date)
		const existing = await db
			.select()
			.from(mahlzeiten)
			.where(and(eq(mahlzeiten.datum, datum), eq(mahlzeiten.typ, typ)));

		if (existing.length > 0) {
			return fail(400, { error: 'Für diesen Tag und Mahlzeitentyp existiert bereits ein Eintrag' });
		}

		const id = crypto.randomUUID();
		const now = Date.now();

		await db.insert(mahlzeiten).values({
			id,
			datum,
			typ,
			beschreibung,
			createdAt: now,
			updatedAt: now
		});

		return { success: true };
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const beschreibung = formData.get('beschreibung')?.toString()?.trim();

		if (!id || !beschreibung) {
			return fail(400, { error: 'Alle Felder sind erforderlich' });
		}

		await db
			.update(mahlzeiten)
			.set({
				beschreibung,
				updatedAt: Date.now()
			})
			.where(eq(mahlzeiten.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID ist erforderlich' });
		}

		await db.delete(mahlzeiten).where(eq(mahlzeiten.id, id));

		return { success: true };
	}
};
