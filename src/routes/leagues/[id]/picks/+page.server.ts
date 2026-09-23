import { and, desc, eq, gt, lte } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { drivers, leagueSeasons, picks, rounds, scoreEvents } from '$lib/server/db/schema';
import { requireMember } from '$lib/server/authorization';
import { submitPick } from '$lib/server/picks';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(303, '/login');
	await requireMember(locals.user.id, params.id, 'member');

	const [season] = await db
		.select()
		.from(leagueSeasons)
		.where(and(eq(leagueSeasons.leagueId, params.id), eq(leagueSeasons.status, 'active')));

	const rosterDrivers = await db
		.select()
		.from(drivers)
		.where(eq(drivers.active, true))
		.orderBy(drivers.name);

	if (!season) {
		return { season: null, round: null, currentPick: null, pastPicks: [], drivers: rosterDrivers };
	}

	const now = new Date();
	const [round] = await db
		.select()
		.from(rounds)
		.where(and(eq(rounds.year, season.year), gt(rounds.lockAt, now)))
		.orderBy(rounds.roundNumber)
		.limit(1);

	const [currentPick] = round
		? await db
				.select()
				.from(picks)
				.where(
					and(
						eq(picks.leagueSeasonId, season.id),
						eq(picks.userId, locals.user.id),
						eq(picks.roundId, round.id)
					)
				)
		: [];

	const pastPicks = await db
		.select({
			roundName: rounds.name,
			roundNumber: rounds.roundNumber,
			p1DriverId: picks.p1DriverId,
			p2DriverId: picks.p2DriverId,
			p3DriverId: picks.p3DriverId,
			points: scoreEvents.points
		})
		.from(picks)
		.innerJoin(rounds, eq(picks.roundId, rounds.id))
		.leftJoin(
			scoreEvents,
			and(
				eq(scoreEvents.leagueSeasonId, picks.leagueSeasonId),
				eq(scoreEvents.userId, picks.userId),
				eq(scoreEvents.roundId, picks.roundId)
			)
		)
		.where(
			and(
				eq(picks.leagueSeasonId, season.id),
				eq(picks.userId, locals.user.id),
				lte(rounds.lockAt, now)
			)
		)
		.orderBy(desc(rounds.roundNumber));

	return { season, round, currentPick: currentPick ?? null, pastPicks, drivers: rosterDrivers };
};

export const actions: Actions = {
	submitPick: async ({ request, params, locals }) => {
		if (!locals.user) redirect(303, '/login');
		await requireMember(locals.user.id, params.id, 'member');

		const formData = await request.formData();
		const roundId = String(formData.get('roundId') ?? '');
		const p1DriverId = String(formData.get('p1DriverId') ?? '');
		const p2DriverId = String(formData.get('p2DriverId') ?? '');
		const p3DriverId = String(formData.get('p3DriverId') ?? '');

		if (!roundId || !p1DriverId || !p2DriverId || !p3DriverId) {
			return fail(400, { error: 'Pick all three positions.' });
		}
		if (new Set([p1DriverId, p2DriverId, p3DriverId]).size !== 3) {
			return fail(400, { error: 'Pick three different drivers.' });
		}

		const [season] = await db
			.select()
			.from(leagueSeasons)
			.where(and(eq(leagueSeasons.leagueId, params.id), eq(leagueSeasons.status, 'active')));
		if (!season) return fail(400, { error: 'This league season is not active.' });

		const [round] = await db.select().from(rounds).where(eq(rounds.id, roundId));
		if (!round || round.year !== season.year) return fail(400, { error: 'Round not found.' });
		if (round.lockAt <= new Date()) {
			return fail(400, { error: 'Picks are locked for this round.' });
		}

		await submitPick({
			leagueSeasonId: season.id,
			userId: locals.user.id,
			roundId,
			p1DriverId,
			p2DriverId,
			p3DriverId
		});

		return { success: true };
	}
};
