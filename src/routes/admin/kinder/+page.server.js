import { db } from '$lib/server/db';
import { kinder, gruppen } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load() {
	const allKinder = await db
		.select({
			id: kinder.id,
			vorname: kinder.vorname,
			nachname: kinder.nachname,
			geburtstag: kinder.geburtstag,
			fotoPath: kinder.fotoPath,
			gruppeId: kinder.gruppeId,
			gruppe: {
				id: gruppen.id,
				name: gruppen.name,
				farbe: gruppen.farbe
			}
		})
		.from(kinder)
		.leftJoin(gruppen, eq(kinder.gruppeId, gruppen.id))
		.orderBy(kinder.nachname, kinder.vorname);

	const allGruppen = await db.select().from(gruppen).orderBy(gruppen.name);

	return { kinder: allKinder, gruppen: allGruppen };
}

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const vorname = formData.get('vorname');
		const nachname = formData.get('nachname');
		const geburtstag = formData.get('geburtstag');
		const gruppeId = formData.get('gruppeId') || null;
		const fotoPath = formData.get('fotoPath') || null;

		if (!vorname || !nachname || !geburtstag) {
			return { error: 'Vorname, Nachname und Geburtstag sind erforderlich' };
		}

		await db.insert(kinder).values({
			vorname,
			nachname,
			geburtstag,
			gruppeId: gruppeId || null,
			fotoPath
		});

		return { success: true };
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const vorname = formData.get('vorname');
		const nachname = formData.get('nachname');
		const geburtstag = formData.get('geburtstag');
		const gruppeId = formData.get('gruppeId') || null;
		const fotoPath = formData.get('fotoPath') || null;

		if (!id || !vorname || !nachname || !geburtstag) {
			return { error: 'Alle Pflichtfelder müssen ausgefüllt sein' };
		}

		await db
			.update(kinder)
			.set({
				vorname,
				nachname,
				geburtstag,
				gruppeId: gruppeId || null,
				fotoPath,
				updatedAt: new Date()
			})
			.where(eq(kinder.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return { error: 'Kind-ID erforderlich' };
		}

		await db.delete(kinder).where(eq(kinder.id, id));
		return { success: true };
	}
};
