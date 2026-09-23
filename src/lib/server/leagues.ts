import { desc, eq } from 'drizzle-orm';
import { db, dbTx } from '$lib/server/db';
import { leagues, leagueSeasons, memberships } from '$lib/server/db/schema';

export async function createLeague(ownerId: string, name: string) {
	return dbTx.transaction(async (tx) => {
		const [league] = await tx.insert(leagues).values({ name, ownerId }).returning();

		await tx.insert(leagueSeasons).values({
			leagueId: league.id,
			year: 2027,
			status: 'setup',
			scoringRulesVersion: 'v1'
		});

		await tx.insert(memberships).values({
			leagueId: league.id,
			userId: ownerId,
			role: 'owner',
			status: 'active'
		});

		return league;
	});
}

/** Shared context for the LeagueNav component - the league's display name
 * and its current season's status, independent of any page's own
 * business-logic-specific (often status-filtered) season query. */
export async function getLeagueNavContext(leagueId: string) {
	const [league] = await db
		.select({ name: leagues.name })
		.from(leagues)
		.where(eq(leagues.id, leagueId));
	const [season] = await db
		.select({ status: leagueSeasons.status })
		.from(leagueSeasons)
		.where(eq(leagueSeasons.leagueId, leagueId))
		.orderBy(desc(leagueSeasons.year));
	return { leagueName: league?.name ?? '', seasonStatus: season?.status ?? null };
}
