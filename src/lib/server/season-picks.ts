import { db } from '$lib/server/db';
import { seasonPicks } from '$lib/server/db/schema';

interface SubmitSeasonPickInput {
	leagueSeasonId: string;
	userId: string;
	wdcDriverId: string;
	wccTeam: string;
}

/** Upserts a member's season-long WDC/WCC pick. Caller must already have
 * verified the round-1 lock hasn't passed. */
export async function submitSeasonPick(input: SubmitSeasonPickInput) {
	const now = new Date();
	await db
		.insert(seasonPicks)
		.values({ ...input, updatedAt: now })
		.onConflictDoUpdate({
			target: [seasonPicks.leagueSeasonId, seasonPicks.userId],
			set: { wdcDriverId: input.wdcDriverId, wccTeam: input.wccTeam, updatedAt: now }
		});
}
