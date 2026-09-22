import './lib/server/env';
import type { Handle } from '@sveltejs/kit';
import { sessionCookieName, validateSession } from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
	const secure = event.url.protocol === 'https:';
	const cookieName = sessionCookieName(secure);
	const rawToken = event.cookies.get(cookieName);

	event.locals.user = rawToken ? await validateSession(rawToken) : null;

	return resolve(event);
};
