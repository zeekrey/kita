import { db } from '$lib/server/db';
import { user, eltern, elternKinder, kinder, gruppen } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function load() {
	// Fetch all users with parent role
	const parentUsers = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt
		})
		.from(user)
		.where(eq(user.role, 'parent'))
		.orderBy(desc(user.createdAt));

	// Fetch all eltern profiles
	const elternProfiles = await db
		.select({
			id: eltern.id,
			userId: eltern.userId,
			telefon: eltern.telefon,
			adresse: eltern.adresse
		})
		.from(eltern);

	// Fetch all parent-child links with child and group info
	const elternKinderLinks = await db
		.select({
			id: elternKinder.id,
			elternId: elternKinder.elternId,
			kindId: elternKinder.kindId,
			beziehung: elternKinder.beziehung,
			kindVorname: kinder.vorname,
			kindNachname: kinder.nachname,
			gruppeId: kinder.gruppeId,
			gruppeName: gruppen.name,
			gruppeFarbe: gruppen.farbe
		})
		.from(elternKinder)
		.leftJoin(kinder, eq(elternKinder.kindId, kinder.id))
		.leftJoin(gruppen, eq(kinder.gruppeId, gruppen.id));

	// Fetch all children for the linking dropdown
	const alleKinder = await db
		.select({
			id: kinder.id,
			vorname: kinder.vorname,
			nachname: kinder.nachname,
			gruppeId: kinder.gruppeId,
			gruppeName: gruppen.name,
			gruppeFarbe: gruppen.farbe
		})
		.from(kinder)
		.leftJoin(gruppen, eq(kinder.gruppeId, gruppen.id))
		.orderBy(kinder.nachname, kinder.vorname);

	// Create lookup maps
	const elternMap = new Map(elternProfiles.map((e) => [e.userId, e]));

	// Group children by elternId
	const kinderByElternId = new Map();
	for (const link of elternKinderLinks) {
		if (!kinderByElternId.has(link.elternId)) {
			kinderByElternId.set(link.elternId, []);
		}
		kinderByElternId.get(link.elternId).push({
			id: link.kindId,
			linkId: link.id,
			vorname: link.kindVorname,
			nachname: link.kindNachname,
			beziehung: link.beziehung,
			gruppeId: link.gruppeId,
			gruppeName: link.gruppeName,
			gruppeFarbe: link.gruppeFarbe
		});
	}

	// Combine parent users with their eltern profile and linked children
	const elternWithProfiles = parentUsers.map((u) => {
		const profile = elternMap.get(u.id);
		return {
			...u,
			elternId: profile?.id || null,
			telefon: profile?.telefon || null,
			adresse: profile?.adresse || null,
			kinder: profile ? kinderByElternId.get(profile.id) || [] : []
		};
	});

	return {
		eltern: elternWithProfiles,
		alleKinder
	};
}

export const actions = {
	updateProfile: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const telefon = formData.get('telefon');
		const adresse = formData.get('adresse');

		if (!userId) {
			return { error: 'Benutzer-ID erforderlich' };
		}

		// Find or create eltern profile
		let elternProfile = await db.select().from(eltern).where(eq(eltern.userId, userId)).limit(1);

		if (elternProfile.length === 0) {
			// Create new eltern profile
			await db.insert(eltern).values({
				userId,
				telefon: telefon || null,
				adresse: adresse || null
			});
		} else {
			// Update existing profile
			await db
				.update(eltern)
				.set({
					telefon: telefon || null,
					adresse: adresse || null,
					updatedAt: new Date()
				})
				.where(eq(eltern.userId, userId));
		}

		return { success: true };
	},

	linkChild: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const kindId = formData.get('kindId');
		const beziehung = formData.get('beziehung') || 'erziehungsberechtigter';

		if (!userId || !kindId) {
			return { error: 'Benutzer-ID und Kind-ID erforderlich' };
		}

		// Validate beziehung
		const validBeziehungen = ['mutter', 'vater', 'erziehungsberechtigter'];
		if (!validBeziehungen.includes(beziehung)) {
			return { error: 'Ungültige Beziehungsart' };
		}

		// Find or create eltern profile
		let elternProfile = await db.select().from(eltern).where(eq(eltern.userId, userId)).limit(1);

		if (elternProfile.length === 0) {
			// Create new eltern profile first
			const result = await db.insert(eltern).values({ userId }).returning({ id: eltern.id });
			elternProfile = result;
		}

		const elternId = elternProfile[0].id;

		// Check if link already exists
		const existingLink = await db
			.select()
			.from(elternKinder)
			.where(and(eq(elternKinder.elternId, elternId), eq(elternKinder.kindId, kindId)))
			.limit(1);

		if (existingLink.length > 0) {
			return { error: 'Dieses Kind ist bereits mit diesem Elternteil verknüpft' };
		}

		// Create the link
		await db.insert(elternKinder).values({
			elternId,
			kindId,
			beziehung
		});

		return { success: true };
	},

	unlinkChild: async ({ request }) => {
		const formData = await request.formData();
		const linkId = formData.get('linkId');

		if (!linkId) {
			return { error: 'Link-ID erforderlich' };
		}

		await db.delete(elternKinder).where(eq(elternKinder.id, linkId));

		return { success: true };
	},

	updateLink: async ({ request }) => {
		const formData = await request.formData();
		const linkId = formData.get('linkId');
		const beziehung = formData.get('beziehung');

		if (!linkId || !beziehung) {
			return { error: 'Link-ID und Beziehungsart erforderlich' };
		}

		// Validate beziehung
		const validBeziehungen = ['mutter', 'vater', 'erziehungsberechtigter'];
		if (!validBeziehungen.includes(beziehung)) {
			return { error: 'Ungültige Beziehungsart' };
		}

		await db
			.update(elternKinder)
			.set({ beziehung, updatedAt: new Date() })
			.where(eq(elternKinder.id, linkId));

		return { success: true };
	}
};
