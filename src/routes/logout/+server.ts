import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { revokeSession, sessionCookieName } from '$lib/server/auth/session';

export const POST: RequestHandler = async ({ cookies, url }) => {
	const secure = url.protocol === 'https:';
	const cookieName = sessionCookieName(secure);
	const rawToken = cookies.get(cookieName);

	if (rawToken) {
		await revokeSession(rawToken);
		cookies.delete(cookieName, { path: '/' });
	}

	redirect(303, '/');
};
