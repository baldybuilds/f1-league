import { fail } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import type { Actions } from './$types';
import { createLoginToken } from '$lib/server/auth/login';
import { checkRateLimit } from '$lib/server/rate-limit';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashKey(value: string): string {
	return createHash('sha256').update(value).digest('hex');
}

export const actions: Actions = {
	default: async ({ request, getClientAddress, url }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();

		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { error: 'Enter a valid email address.' });
		}

		const allowedByIp = await checkRateLimit(`login:ip:${hashKey(getClientAddress())}`, {
			limit: 10,
			windowSeconds: 60 * 15
		});
		const allowedByEmail = await checkRateLimit(`login:email:${hashKey(email)}`, {
			limit: 5,
			windowSeconds: 60 * 15
		});

		// Identical response whether or not the address is known, and even when
		// rate-limited - avoids leaking which path was taken.
		if (allowedByIp && allowedByEmail) {
			await createLoginToken(email, (token) => `${url.origin}/login/confirm/${token}`);
		}

		return { sent: true };
	}
};
