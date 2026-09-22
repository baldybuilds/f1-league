import { dbTx } from '$lib/server/db';
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
