import { redirect } from '@sveltejs/kit';

/**
 * @typedef {'admin' | 'parent' | 'employee'} Role
 */

/**
 * Check if a session has one of the allowed roles.
 * Throws a redirect if the user doesn't have an allowed role.
 *
 * @param {object | null} session - The session object from auth.api.getSession()
 * @param {Role[]} allowedRoles - Array of roles that are allowed access
 * @param {string} [redirectTo] - Where to redirect if check fails (default: role-based dashboard)
 * @throws {Redirect} If session is null or user doesn't have an allowed role
 */
export function requireRole(session, allowedRoles, redirectTo) {
	if (!session) {
		throw redirect(302, '/admin/login');
	}

	const userRole = session.user?.role || 'parent';

	if (!allowedRoles.includes(userRole)) {
		// Redirect to appropriate dashboard based on their actual role
		const destination = redirectTo || getDashboardForRole(userRole);
		throw redirect(302, destination);
	}
}

/**
 * Get the appropriate dashboard URL for a given role.
 *
 * @param {Role} role - The user's role
 * @returns {string} The dashboard URL for that role
 */
export function getDashboardForRole(role) {
	switch (role) {
		case 'admin':
			return '/admin';
		case 'parent':
			return '/eltern';
		case 'employee':
			return '/mitarbeiter';
		default:
			return '/';
	}
}

/**
 * Check if a user has a specific role.
 *
 * @param {object | null} session - The session object
 * @param {Role} role - The role to check for
 * @returns {boolean} True if the user has the specified role
 */
export function hasRole(session, role) {
	if (!session?.user) {
		return false;
	}
	return session.user.role === role;
}

/**
 * Check if a user has any of the specified roles.
 *
 * @param {object | null} session - The session object
 * @param {Role[]} roles - Array of roles to check
 * @returns {boolean} True if the user has any of the specified roles
 */
export function hasAnyRole(session, roles) {
	if (!session?.user) {
		return false;
	}
	return roles.includes(session.user.role);
}
