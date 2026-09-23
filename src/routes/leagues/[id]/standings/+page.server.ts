import { desc, eq, sql } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { leagues, leagueSeasons, scoreEvents, seasonStandings, users } from '$lib/server/db/schema';
import { requireMember } from '$lib/server/authorization';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(303, '/login');
	await requireMember(locals.user.id, params.id, 'member');

	const [[league], [season]] = await Promise.all([
		db.select({ name: leagues.name }).from(leagues).where(eq(leagues.id, params.id)),
		db
			.select()
			.from(leagueSeasons)
			.where(eq(leagueSeasons.leagueId, params.id))
			.orderBy(desc(leagueSeasons.year))
	]);
	const leagueId = params.id;
	const leagueName = league?.name ?? '';
	const seasonStatus = season?.status ?? null;

	if (!season || (season.status !== 'active' && season.status !== 'archived')) {
		return {
			leagueId,
			leagueName,
			seasonStatus,
			season: null,
			standings: [],
			archived: false as const
		};
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

		return { leagueId, leagueName, seasonStatus, season, standings, archived: true as const };
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

	return { leagueId, leagueName, seasonStatus, season, standings, archived: false as const };
};
