import { db } from '$lib/server/db';
import { gruppen, kinder } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load() {
	const allGroups = await db.select().from(gruppen).orderBy(gruppen.name);
	return { gruppen: allGroups };
}

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const farbe = formData.get('farbe');

		if (!name || !farbe) {
			return { error: 'Name und Farbe sind erforderlich' };
		}

		await db.insert(gruppen).values({ name, farbe });
		return { success: true };
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const name = formData.get('name');
		const farbe = formData.get('farbe');

		if (!id || !name || !farbe) {
			return { error: 'Alle Felder sind erforderlich' };
		}

		await db
			.update(gruppen)
			.set({ name, farbe, updatedAt: new Date() })
			.where(eq(gruppen.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return { error: 'Gruppen-ID erforderlich' };
		}

		// Check for assigned children
		const assignedKinder = await db.select().from(kinder).where(eq(kinder.gruppeId, id)).limit(1);

		if (assignedKinder.length > 0) {
			return { error: 'Gruppe hat noch Kinder zugewiesen' };
		}

		await db.delete(gruppen).where(eq(gruppen.id, id));
		return { success: true };
	}
};
