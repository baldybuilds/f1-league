import { afterEach, describe, expect, it } from 'vitest';
import { db } from '$lib/server/db';
import { loginTokens } from '$lib/server/db/schema';
import { createTestUser, deleteTestUser, testEmail } from '$lib/server/test-helpers';
import { hashToken } from './tokens';
import { consumeLoginToken } from './login';

async function insertLoginToken(opts: {
	email: string;
	expiresAt?: Date;
	consumedAt?: Date | null;
}): Promise<string> {
	const raw = `citest-token-${Math.random().toString(36).slice(2)}`;
	await db.insert(loginTokens).values({
		email: opts.email,
		tokenHash: hashToken(raw),
		expiresAt: opts.expiresAt ?? new Date(Date.now() + 60_000),
		consumedAt: opts.consumedAt ?? null
	});
	return raw;
}

describe('consumeLoginToken', () => {
	let userId = '';
	let email = '';

	afterEach(async () => {
		if (userId) await deleteTestUser(userId, email);
		userId = '';
		email = '';
	});

	it('returns the existing user for a returning sign-in', async () => {
		const user = await createTestUser();
		userId = user.id;
		email = user.email;

		const raw = await insertLoginToken({ email: user.email });
		const result = await consumeLoginToken(raw);

		expect(result?.user.id).toBe(user.id);
		expect(result?.isNewUser).toBe(false);
	});

	it('rejects an expired token', async () => {
		const raw = await insertLoginToken({
			email: testEmail(),
			expiresAt: new Date(Date.now() - 1000)
		});
		expect(await consumeLoginToken(raw)).toBeNull();
	});

	it('rejects a replayed (already consumed) token', async () => {
		const raw = await insertLoginToken({ email: testEmail(), consumedAt: new Date() });
		expect(await consumeLoginToken(raw)).toBeNull();
	});

	it('rejects a brand-new email with no invite (no open sign-up)', async () => {
		const raw = await insertLoginToken({ email: testEmail() });
		expect(await consumeLoginToken(raw)).toBeNull();
	});

	it('rejects an unknown token entirely', async () => {
		expect(await consumeLoginToken('not-a-real-token')).toBeNull();
	});
});
