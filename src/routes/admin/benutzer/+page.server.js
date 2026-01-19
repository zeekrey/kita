import { db } from '$lib/server/db';
import { user, eltern, mitarbeiter } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function load() {
	// Fetch all users with their linked profiles
	const allUsers = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt
		})
		.from(user)
		.orderBy(desc(user.createdAt));

	// Fetch linked eltern (parent) profiles
	const elternProfiles = await db
		.select({
			userId: eltern.userId,
			id: eltern.id,
			telefon: eltern.telefon,
			adresse: eltern.adresse
		})
		.from(eltern);

	// Fetch linked mitarbeiter (employee) profiles
	const mitarbeiterProfiles = await db
		.select({
			userId: mitarbeiter.userId,
			id: mitarbeiter.id,
			position: mitarbeiter.position,
			erzieherId: mitarbeiter.erzieherId
		})
		.from(mitarbeiter);

	// Create lookup maps for profiles
	const elternMap = new Map(elternProfiles.map((e) => [e.userId, e]));
	const mitarbeiterMap = new Map(mitarbeiterProfiles.map((m) => [m.userId, m]));

	// Combine user data with profile data
	const usersWithProfiles = allUsers.map((u) => ({
		...u,
		elternProfile: elternMap.get(u.id) || null,
		mitarbeiterProfile: mitarbeiterMap.get(u.id) || null
	}));

	return { benutzer: usersWithProfiles };
}

export const actions = {
	updateRole: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const role = formData.get('role');

		if (!id || !role) {
			return { error: 'Benutzer-ID und Rolle sind erforderlich' };
		}

		// Validate role value
		const validRoles = ['admin', 'parent', 'employee'];
		if (!validRoles.includes(role)) {
			return { error: 'Ungültige Rolle' };
		}

		// Get the current user data
		const existingUser = await db.select().from(user).where(eq(user.id, id)).limit(1);

		if (existingUser.length === 0) {
			return { error: 'Benutzer nicht gefunden' };
		}

		const oldRole = existingUser[0].role;

		// Update the user's role
		await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, id));

		// Handle profile table changes based on role transition
		if (oldRole !== role) {
			// If changing FROM parent role, we might want to keep the eltern record
			// for now, but the user won't have parent access anymore

			// If changing FROM employee role, we might want to keep the mitarbeiter record
			// for now, but the user won't have employee access anymore

			// If changing TO parent role, create eltern record if it doesn't exist
			if (role === 'parent') {
				const existingEltern = await db.select().from(eltern).where(eq(eltern.userId, id)).limit(1);

				if (existingEltern.length === 0) {
					await db.insert(eltern).values({ userId: id });
				}
			}

			// If changing TO employee role, create mitarbeiter record if it doesn't exist
			if (role === 'employee') {
				const existingMitarbeiter = await db
					.select()
					.from(mitarbeiter)
					.where(eq(mitarbeiter.userId, id))
					.limit(1);

				if (existingMitarbeiter.length === 0) {
					await db.insert(mitarbeiter).values({ userId: id });
				}
			}
		}

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return { error: 'Benutzer-ID erforderlich' };
		}

		// Don't allow deleting the last admin
		const adminUsers = await db.select().from(user).where(eq(user.role, 'admin'));

		if (adminUsers.length <= 1) {
			const targetUser = await db.select().from(user).where(eq(user.id, id)).limit(1);
			if (targetUser.length > 0 && targetUser[0].role === 'admin') {
				return { error: 'Der letzte Administrator kann nicht gelöscht werden' };
			}
		}

		// Delete the user (cascade will handle related records)
		await db.delete(user).where(eq(user.id, id));

		return { success: true };
	}
};
