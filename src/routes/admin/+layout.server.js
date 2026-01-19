import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load = async ({ request, url }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	// Allow access to login page without auth
	if (url.pathname === '/admin/login') {
		if (session) {
			throw redirect(302, '/admin');
		}
		return {};
	}

	// Require auth for all other admin pages
	if (!session) {
		throw redirect(302, '/admin/login');
	}

	return {
		user: session.user
	};
};
