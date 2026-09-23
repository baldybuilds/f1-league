import { db } from '$lib/server/db';
import { picks } from '$lib/server/db/schema';

interface SubmitPickInput {
	leagueSeasonId: string;
	userId: string;
	roundId: string;
	p1DriverId: string;
	p2DriverId: string;
	p3DriverId: string;
}

/** Upserts a member's pick for a round. Caller must already have verified
 * `now() < round.lockAt` and that the three drivers are distinct. */
export async function submitPick(input: SubmitPickInput) {
	const now = new Date();
	await db
		.insert(picks)
		.values({ ...input, updatedAt: now })
		.onConflictDoUpdate({
			target: [picks.leagueSeasonId, picks.userId, picks.roundId],
			set: {
				p1DriverId: input.p1DriverId,
				p2DriverId: input.p2DriverId,
				p3DriverId: input.p3DriverId,
				updatedAt: now
			}
		});
}
