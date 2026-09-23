import { desc, eq, sql } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { leagueSeasons, scoreEvents, seasonStandings, users } from '$lib/server/db/schema';
import { requireMember } from '$lib/server/authorization';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(303, '/login');
	await requireMember(locals.user.id, params.id, 'member');

	const [season] = await db
		.select()
		.from(leagueSeasons)
		.where(eq(leagueSeasons.leagueId, params.id))
		.orderBy(desc(leagueSeasons.year));

	if (!season || (season.status !== 'active' && season.status !== 'archived')) {
		return { season: null, standings: [], archived: false as const };
	}

	if (season.status === 'archived') {
		// Frozen at archive time - reading from score_events here would let a
		// later scoring-code change alter a supposedly-immutable final table.
		const standings = await db
			.select({
				userId: seasonStandings.userId,
				displayName: users.displayName,
				avatarColour: users.avatarColour,
				totalPoints: seasonStandings.totalPoints,
				rank: seasonStandings.rank
			})
			.from(seasonStandings)
			.innerJoin(users, eq(seasonStandings.userId, users.id))
			.where(eq(seasonStandings.leagueSeasonId, season.id))
			.orderBy(seasonStandings.rank);

		return { season, standings, archived: true as const };
	}

	const standings = await db
		.select({
			userId: scoreEvents.userId,
			displayName: users.displayName,
			avatarColour: users.avatarColour,
			totalPoints: sql<number>`sum(${scoreEvents.points})`.mapWith(Number),
			roundsScored: sql<number>`count(*)`.mapWith(Number)
		})
		.from(scoreEvents)
		.innerJoin(users, eq(scoreEvents.userId, users.id))
		.where(eq(scoreEvents.leagueSeasonId, season.id))
		.groupBy(scoreEvents.userId, users.displayName, users.avatarColour)
		.orderBy(desc(sql`sum(${scoreEvents.points})`));

	return { season, standings, archived: false as const };
};
