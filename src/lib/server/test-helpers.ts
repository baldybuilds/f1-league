import { eq } from 'drizzle-orm';
import { db } from './db';
import {
	users,
	authSessions,
	loginTokens,
	policyAcceptances,
	seasonEntries,
	memberships,
	leagueSeasons,
	invites,
	leagues
} from './db/schema';

let counter = 0;

export function testEmail(prefix = 'citest'): string {
	counter += 1;
	return `${prefix}-${Date.now()}-${counter}-${Math.random().toString(36).slice(2)}@example.com`;
}

export async function createTestUser(overrides: Partial<typeof users.$inferInsert> = {}) {
	const [user] = await db
		.insert(users)
		.values({
			displayName: 'CI Test User',
			email: testEmail(),
			avatarColour: '#6b7280',
			timezone: 'UTC',
			ageConfirmedAt: new Date(),
			...overrides
		})
		.returning();
	return user;
}

/** Deletes a test user and everything that directly references it. Does not
 * touch leagues the user owns - use deleteTestLeague first for those. */
export async function deleteTestUser(userId: string, email: string) {
	await db.delete(authSessions).where(eq(authSessions.userId, userId));
	await db.delete(loginTokens).where(eq(loginTokens.email, email));
	await db.delete(policyAcceptances).where(eq(policyAcceptances.userId, userId));
	await db.delete(seasonEntries).where(eq(seasonEntries.userId, userId));
	await db.delete(memberships).where(eq(memberships.userId, userId));
	await db.delete(users).where(eq(users.id, userId));
}

export async function deleteTestLeague(leagueId: string) {
	const seasons = await db
		.select({ id: leagueSeasons.id })
		.from(leagueSeasons)
		.where(eq(leagueSeasons.leagueId, leagueId));

	for (const season of seasons) {
		await db.delete(seasonEntries).where(eq(seasonEntries.leagueSeasonId, season.id));
	}

	await db.delete(invites).where(eq(invites.leagueId, leagueId));
	await db.delete(memberships).where(eq(memberships.leagueId, leagueId));
	await db.delete(leagueSeasons).where(eq(leagueSeasons.leagueId, leagueId));
	await db.delete(leagues).where(eq(leagues.id, leagueId));
}
