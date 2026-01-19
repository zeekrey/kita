import { db } from '$lib/server/db';
import { user, mitarbeiter, erzieher } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function load() {
	// Fetch all users with employee role
	const employeeUsers = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt
		})
		.from(user)
		.where(eq(user.role, 'employee'))
		.orderBy(desc(user.createdAt));

	// Fetch all mitarbeiter profiles with linked erzieher info
	const mitarbeiterProfiles = await db
		.select({
			id: mitarbeiter.id,
			userId: mitarbeiter.userId,
			erzieherId: mitarbeiter.erzieherId,
			position: mitarbeiter.position,
			erzieherVorname: erzieher.vorname,
			erzieherNachname: erzieher.nachname,
			erzieherEmail: erzieher.email,
			erzieherFotoPath: erzieher.fotoPath
		})
		.from(mitarbeiter)
		.leftJoin(erzieher, eq(mitarbeiter.erzieherId, erzieher.id));

	// Fetch all erzieher for the linking dropdown
	const alleErzieher = await db
		.select({
			id: erzieher.id,
			vorname: erzieher.vorname,
			nachname: erzieher.nachname,
			email: erzieher.email,
			fotoPath: erzieher.fotoPath
		})
		.from(erzieher)
		.orderBy(erzieher.nachname, erzieher.vorname);

	// Create lookup maps
	const mitarbeiterMap = new Map(mitarbeiterProfiles.map((m) => [m.userId, m]));

	// Find which erzieher IDs are already linked (to filter in dropdown)
	const linkedErzieherIds = new Set(
		mitarbeiterProfiles.filter((m) => m.erzieherId).map((m) => m.erzieherId)
	);

	// Combine employee users with their mitarbeiter profile
	const mitarbeiterWithProfiles = employeeUsers.map((u) => {
		const profile = mitarbeiterMap.get(u.id);
		return {
			...u,
			mitarbeiterId: profile?.id || null,
			position: profile?.position || null,
			erzieherId: profile?.erzieherId || null,
			erzieherVorname: profile?.erzieherVorname || null,
			erzieherNachname: profile?.erzieherNachname || null,
			erzieherEmail: profile?.erzieherEmail || null,
			erzieherFotoPath: profile?.erzieherFotoPath || null
		};
	});

	return {
		mitarbeiter: mitarbeiterWithProfiles,
		alleErzieher,
		linkedErzieherIds: Array.from(linkedErzieherIds)
	};
}

export const actions = {
	updateProfile: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const position = formData.get('position');

		if (!userId) {
			return { error: 'Benutzer-ID erforderlich' };
		}

		// Find or create mitarbeiter profile
		let mitarbeiterProfile = await db
			.select()
			.from(mitarbeiter)
			.where(eq(mitarbeiter.userId, userId))
			.limit(1);

		if (mitarbeiterProfile.length === 0) {
			// Create new mitarbeiter profile
			await db.insert(mitarbeiter).values({
				userId,
				position: position || null
			});
		} else {
			// Update existing profile
			await db
				.update(mitarbeiter)
				.set({
					position: position || null,
					updatedAt: new Date()
				})
				.where(eq(mitarbeiter.userId, userId));
		}

		return { success: true };
	},

	linkErzieher: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');
		const erzieherId = formData.get('erzieherId');

		if (!userId || !erzieherId) {
			return { error: 'Benutzer-ID und Erzieher-ID erforderlich' };
		}

		// Check if erzieher exists
		const erzieherRecord = await db
			.select()
			.from(erzieher)
			.where(eq(erzieher.id, erzieherId))
			.limit(1);

		if (erzieherRecord.length === 0) {
			return { error: 'Erzieher nicht gefunden' };
		}

		// Check if erzieher is already linked to another mitarbeiter
		const existingLink = await db
			.select()
			.from(mitarbeiter)
			.where(eq(mitarbeiter.erzieherId, erzieherId))
			.limit(1);

		if (existingLink.length > 0 && existingLink[0].userId !== userId) {
			return { error: 'Dieser Erzieher ist bereits mit einem anderen Mitarbeiter verknüpft' };
		}

		// Find or create mitarbeiter profile
		let mitarbeiterProfile = await db
			.select()
			.from(mitarbeiter)
			.where(eq(mitarbeiter.userId, userId))
			.limit(1);

		if (mitarbeiterProfile.length === 0) {
			// Create new mitarbeiter profile with erzieher link
			await db.insert(mitarbeiter).values({
				userId,
				erzieherId
			});
		} else {
			// Update existing profile with erzieher link
			await db
				.update(mitarbeiter)
				.set({
					erzieherId,
					updatedAt: new Date()
				})
				.where(eq(mitarbeiter.userId, userId));
		}

		return { success: true };
	},

	unlinkErzieher: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId');

		if (!userId) {
			return { error: 'Benutzer-ID erforderlich' };
		}

		// Update mitarbeiter profile to remove erzieher link
		await db
			.update(mitarbeiter)
			.set({
				erzieherId: null,
				updatedAt: new Date()
			})
			.where(eq(mitarbeiter.userId, userId));

		return { success: true };
	}
};
