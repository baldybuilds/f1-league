import { and, eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { drivers, leagueSeasons, rounds, seasonPicks } from '$lib/server/db/schema';
import { requireMember } from '$lib/server/authorization';
import { submitSeasonPick } from '$lib/server/season-picks';
import { getLeagueNavContext } from '$lib/server/leagues';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(303, '/login');
	await requireMember(locals.user.id, params.id, 'member');

	const navContext = await getLeagueNavContext(params.id);

	const [season] = await db
		.select()
		.from(leagueSeasons)
		.where(and(eq(leagueSeasons.leagueId, params.id), eq(leagueSeasons.status, 'active')));

	const rosterDrivers = await db
		.select()
		.from(drivers)
		.where(eq(drivers.active, true))
		.orderBy(drivers.name);
	const teams = [...new Set(rosterDrivers.map((d) => d.team))].sort();

	if (!season) {
		return {
			...navContext,
			leagueId: params.id,
			season: null,
			locked: false,
			currentPick: null,
			drivers: rosterDrivers,
			teams
		};
	}

	const [round1] = await db
		.select()
		.from(rounds)
		.where(and(eq(rounds.year, season.year), eq(rounds.roundNumber, 1)));
	const locked = round1 ? round1.lockAt <= new Date() : false;

	const [currentPick] = await db
		.select()
		.from(seasonPicks)
		.where(and(eq(seasonPicks.leagueSeasonId, season.id), eq(seasonPicks.userId, locals.user.id)));

	return {
		...navContext,
		leagueId: params.id,
		season,
		locked,
		currentPick: currentPick ?? null,
		drivers: rosterDrivers,
		teams
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) redirect(303, '/login');
		await requireMember(locals.user.id, params.id, 'member');

		const formData = await request.formData();
		const wdcDriverId = String(formData.get('wdcDriverId') ?? '');
		const wccTeam = String(formData.get('wccTeam') ?? '');
		if (!wdcDriverId || !wccTeam) {
			return fail(400, { error: 'Pick both a WDC driver and a WCC team.' });
		}

		const [season] = await db
			.select()
			.from(leagueSeasons)
			.where(and(eq(leagueSeasons.leagueId, params.id), eq(leagueSeasons.status, 'active')));
		if (!season) return fail(400, { error: 'This league season is not active.' });

		const [round1] = await db
			.select()
			.from(rounds)
			.where(and(eq(rounds.year, season.year), eq(rounds.roundNumber, 1)));
		if (round1 && round1.lockAt <= new Date()) {
			return fail(400, { error: 'Season picks are locked - round 1 has started.' });
		}

		await submitSeasonPick({
			leagueSeasonId: season.id,
			userId: locals.user.id,
			wdcDriverId,
			wccTeam
		});

		return { success: true };
	}
};
