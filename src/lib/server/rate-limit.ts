import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { rateLimits } from '$lib/server/db/schema';

interface RateLimitOptions {
	limit: number;
	windowSeconds: number;
}

/** Returns true if the request should be allowed, false if the limit is exceeded. */
export async function checkRateLimit(
	key: string,
	{ limit, windowSeconds }: RateLimitOptions
): Promise<boolean> {
	const now = new Date();
	const windowEnd = new Date(now.getTime() + windowSeconds * 1000);

	const [row] = await db
		.insert(rateLimits)
		.values({ key, count: 1, expiresAt: windowEnd })
		.onConflictDoUpdate({
			target: rateLimits.key,
			set: {
				count: sql`case when ${rateLimits.expiresAt} < ${now} then 1 else ${rateLimits.count} + 1 end`,
				expiresAt: sql`case when ${rateLimits.expiresAt} < ${now} then ${windowEnd} else ${rateLimits.expiresAt} end`
			}
		})
		.returning();

	return row.count <= limit;
}
