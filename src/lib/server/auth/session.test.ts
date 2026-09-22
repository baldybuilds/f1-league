import { afterEach, describe, expect, it } from 'vitest';
import { createSession, revokeSession, sessionCookieName, validateSession } from './session';
import { createTestUser, deleteTestUser } from '$lib/server/test-helpers';

describe('sessionCookieName', () => {
	it('uses the __Host- prefix only when secure', () => {
		expect(sessionCookieName(true)).toBe('__Host-session');
		expect(sessionCookieName(false)).toBe('session');
	});
});

describe('createSession / validateSession / revokeSession', () => {
	let userId = '';
	let email = '';

	afterEach(async () => {
		if (userId) await deleteTestUser(userId, email);
		userId = '';
		email = '';
	});

	it('validates a freshly created session and returns the user', async () => {
		const user = await createTestUser();
		userId = user.id;
		email = user.email;

		const token = await createSession(user.id);
		const result = await validateSession(token);

		expect(result?.id).toBe(user.id);
	});

	it('rejects an unknown token', async () => {
		expect(await validateSession('not-a-real-token')).toBeNull();
	});

	it('rejects a revoked session', async () => {
		const user = await createTestUser();
		userId = user.id;
		email = user.email;

		const token = await createSession(user.id);
		await revokeSession(token);

		expect(await validateSession(token)).toBeNull();
	});

	it('rejects a session belonging to an anonymised user', async () => {
		const user = await createTestUser({ anonymisedAt: new Date() });
		userId = user.id;
		email = user.email;

		const token = await createSession(user.id);

		expect(await validateSession(token)).toBeNull();
	});
});
