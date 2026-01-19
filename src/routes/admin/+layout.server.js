import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { requireRole, getDashboardForRole } from '$lib/server/auth-utils';

export const load = async ({ request, url }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	// Allow access to login page without auth
	if (url.pathname === '/admin/login') {
		if (session) {
			// Redirect authenticated users to their appropriate dashboard
			const userRole = session.user?.role || 'parent';
			throw redirect(302, getDashboardForRole(userRole));
		}
		return {};
	}

	// Require auth for all other admin pages
	if (!session) {
		throw redirect(302, '/admin/login');
	}

	// Check for admin role - non-admins get redirected to their dashboard
	requireRole(session, ['admin']);

	return {
		user: session.user
	};
};
