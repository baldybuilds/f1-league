import { afterEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { rateLimits } from './db/schema';
import { checkRateLimit } from './rate-limit';

function testKey(): string {
	return `citest:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

describe('checkRateLimit', () => {
	let key = '';

	afterEach(async () => {
		if (key) await db.delete(rateLimits).where(eq(rateLimits.key, key));
		key = '';
	});

	it('allows requests under the limit', async () => {
		key = testKey();
		expect(await checkRateLimit(key, { limit: 3, windowSeconds: 60 })).toBe(true);
		expect(await checkRateLimit(key, { limit: 3, windowSeconds: 60 })).toBe(true);
		expect(await checkRateLimit(key, { limit: 3, windowSeconds: 60 })).toBe(true);
	});

	it('blocks requests once the limit is exceeded', async () => {
		key = testKey();
		await checkRateLimit(key, { limit: 2, windowSeconds: 60 });
		await checkRateLimit(key, { limit: 2, windowSeconds: 60 });
		expect(await checkRateLimit(key, { limit: 2, windowSeconds: 60 })).toBe(false);
	});

	it('resets the count once the window has expired', async () => {
		key = testKey();
		await db.insert(rateLimits).values({ key, count: 5, expiresAt: new Date(Date.now() - 1000) });
		expect(await checkRateLimit(key, { limit: 2, windowSeconds: 60 })).toBe(true);
	});
});
