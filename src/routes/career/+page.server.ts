import { desc, eq, sql } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	leagueSeasons,
	leagues,
	rounds,
	scoreEvents,
	seasonEntries,
	seasonStandings
} from '$lib/server/db/schema';
import { computeUserStatRollup } from '$lib/server/stats';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	const userId = locals.user.id;

	const [{ seasonsPlayed }] = await db
		.select({ seasonsPlayed: sql<number>`count(*)`.mapWith(Number) })
		.from(seasonEntries)
		.where(eq(seasonEntries.userId, userId));

	const standingsRows = await db
		.select({
			leagueName: leagues.name,
			year: leagueSeasons.year,
			rank: seasonStandings.rank,
			totalPoints: seasonStandings.totalPoints
		})
		.from(seasonStandings)
		.innerJoin(leagueSeasons, eq(seasonStandings.leagueSeasonId, leagueSeasons.id))
		.innerJoin(leagues, eq(leagueSeasons.leagueId, leagues.id))
		.where(eq(seasonStandings.userId, userId))
		.orderBy(desc(seasonStandings.totalPoints));

	const titles = standingsRows.filter((row) => row.rank === 1).length;
	const bestSeason = standingsRows[0] ?? null;

	const eventRows = await db
		.select({
			roundId: scoreEvents.roundId,
			roundNumber: rounds.roundNumber,
			points: scoreEvents.points,
			breakdown: scoreEvents.breakdown
		})
		.from(scoreEvents)
		.innerJoin(rounds, eq(scoreEvents.roundId, rounds.id))
		.where(eq(scoreEvents.userId, userId));

	const rollup = computeUserStatRollup(eventRows);

	return { seasonsPlayed, titles, bestSeason, standingsRows, rollup };
};
