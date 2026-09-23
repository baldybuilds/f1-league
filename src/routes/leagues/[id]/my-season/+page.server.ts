import { and, desc, eq, sql } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	drivers,
	leagues,
	leagueSeasons,
	memberships,
	picks,
	rounds,
	scoreEvents,
	seasonStandings
} from '$lib/server/db/schema';
import { requireMember } from '$lib/server/authorization';
import { computeSeasonStandings, computeUserStatRollup } from '$lib/server/stats';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(303, '/login');
	await requireMember(locals.user.id, params.id, 'member');
	const userId = locals.user.id;

	const [league] = await db
		.select({ name: leagues.name })
		.from(leagues)
		.where(eq(leagues.id, params.id));
	const leagueId = params.id;
	const leagueName = league?.name ?? '';

	const [season] = await db
		.select()
		.from(leagueSeasons)
		.where(eq(leagueSeasons.leagueId, params.id))
		.orderBy(desc(leagueSeasons.year));

	const seasonStatus = season?.status ?? null;

	if (!season) return { leagueId, leagueName, seasonStatus, season: null };

	const eventRows = await db
		.select({
			roundId: scoreEvents.roundId,
			roundNumber: rounds.roundNumber,
			points: scoreEvents.points,
			breakdown: scoreEvents.breakdown
		})
		.from(scoreEvents)
		.innerJoin(rounds, eq(scoreEvents.roundId, rounds.id))
		.where(and(eq(scoreEvents.leagueSeasonId, season.id), eq(scoreEvents.userId, userId)))
		.orderBy(rounds.roundNumber);

	const rollup = computeUserStatRollup(eventRows);

	const pickRows = await db
		.select({
			roundNumber: rounds.roundNumber,
			roundName: rounds.name,
			p1DriverId: picks.p1DriverId,
			p2DriverId: picks.p2DriverId,
			p3DriverId: picks.p3DriverId,
			resultP1Id: rounds.resultP1Id,
			resultP2Id: rounds.resultP2Id,
			resultP3Id: rounds.resultP3Id
		})
		.from(picks)
		.innerJoin(rounds, eq(picks.roundId, rounds.id))
		.where(and(eq(picks.leagueSeasonId, season.id), eq(picks.userId, userId)))
		.orderBy(desc(rounds.roundNumber));

	const driverRows = await db.select().from(drivers);

	let rank: number | null = null;
	let frozenStanding: typeof seasonStandings.$inferSelect | null = null;

	if (season.status === 'archived') {
		const [row] = await db
			.select()
			.from(seasonStandings)
			.where(
				and(eq(seasonStandings.leagueSeasonId, season.id), eq(seasonStandings.userId, userId))
			);
		frozenStanding = row ?? null;
		rank = row?.rank ?? null;
	} else if (season.status === 'active') {
		const activeMembers = await db
			.select({ userId: memberships.userId })
			.from(memberships)
			.where(and(eq(memberships.leagueId, params.id), eq(memberships.status, 'active')));
		const sumsRows = await db
			.select({
				userId: scoreEvents.userId,
				regularPoints: sql<number>`sum(${scoreEvents.points})`.mapWith(Number)
			})
			.from(scoreEvents)
			.where(eq(scoreEvents.leagueSeasonId, season.id))
			.groupBy(scoreEvents.userId);
		const sumsByUser = new Map(sumsRows.map((r) => [r.userId, r.regularPoints]));
		const standings = computeSeasonStandings(
			activeMembers.map((m) => ({
				userId: m.userId,
				regularPoints: sumsByUser.get(m.userId) ?? 0
			})),
			new Set(),
			new Set(),
			{ wdc: 0, wcc: 0 }
		);
		rank = standings.find((s) => s.userId === userId)?.rank ?? null;
	}

	return {
		leagueId,
		leagueName,
		seasonStatus,
		season,
		rollup,
		pickRows,
		driverRows,
		rank,
		frozenStanding
	};
};
