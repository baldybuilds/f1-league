import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { consumeLoginToken } from '$lib/server/auth/login';
import { createSession, sessionCookieName } from '$lib/server/auth/session';

export const actions: Actions = {
	default: async ({ params, cookies, url }) => {
		const user = await consumeLoginToken(params.token);

		if (!user) {
			redirect(303, '/login?expired=1');
		}

		const sessionToken = await createSession(user.id);
		const secure = url.protocol === 'https:';

		cookies.set(sessionCookieName(secure), sessionToken, {
			path: '/',
			httpOnly: true,
			secure,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});

		redirect(303, '/');
	}
};
