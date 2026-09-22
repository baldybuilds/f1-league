import './lib/server/env';
import type { Handle } from '@sveltejs/kit';
import { sessionCookieName, validateSession } from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
	const secure = event.url.protocol === 'https:';
	const cookieName = sessionCookieName(secure);
	const rawToken = event.cookies.get(cookieName);

	event.locals.user = rawToken ? await validateSession(rawToken) : null;

	const response = await resolve(event);

	// CSP (with nonces) comes from SvelteKit's own kit.csp config (vite.config.ts).
	// netlify.toml's [[headers]] doesn't reliably apply to SSR function responses
	// (only static assets), so the rest are set here instead.
	response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	return response;
};
