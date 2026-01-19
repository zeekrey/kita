/**
 * Test-only API endpoint for setting user roles.
 * This endpoint is only available in development mode.
 *
 * Usage: POST /api/test/set-role
 * Body: { email: string, role: 'admin' | 'parent' | 'employee' }
 */

import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { user, eltern, mitarbeiter } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const VALID_ROLES = ['admin', 'parent', 'employee'];

export async function POST({ request }) {
	// Only allow in development mode
	if (!dev) {
		return json({ error: 'This endpoint is only available in development mode' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { email, role } = body;

		if (!email || !role) {
			return json({ error: 'Missing email or role' }, { status: 400 });
		}

		if (!VALID_ROLES.includes(role)) {
			return json(
				{ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
				{ status: 400 }
			);
		}

		// Update the user's role
		const result = await db
			.update(user)
			.set({ role, updatedAt: new Date() })
			.where(eq(user.email, email))
			.returning({ id: user.id, email: user.email, role: user.role });

		if (result.length === 0) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		const userId = result[0].id;

		// Create associated profile record based on role
		if (role === 'parent') {
			// Check if eltern record already exists
			const existingEltern = await db
				.select()
				.from(eltern)
				.where(eq(eltern.userId, userId))
				.limit(1);
			if (existingEltern.length === 0) {
				await db.insert(eltern).values({ userId });
			}
		} else if (role === 'employee') {
			// Check if mitarbeiter record already exists
			const existingMitarbeiter = await db
				.select()
				.from(mitarbeiter)
				.where(eq(mitarbeiter.userId, userId))
				.limit(1);
			if (existingMitarbeiter.length === 0) {
				await db.insert(mitarbeiter).values({ userId });
			}
		}

		return json({ success: true, user: result[0] });
	} catch (error) {
		console.error('Error setting user role:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
