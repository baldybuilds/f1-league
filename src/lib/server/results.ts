import { and, eq } from 'drizzle-orm';
import { dbTx } from '$lib/server/db';
import { leagueSeasons, memberships, picks, rounds, scoreEvents } from '$lib/server/db/schema';
import { recordAuditEvent } from '$lib/server/audit-log';
import { scoreRound } from '$lib/server/scoring';

interface EnterResultInput {
	leagueId: string;
	roundId: string;
	enteredByUserId: string;
	p1DriverId: string;
	p2DriverId: string;
	p3DriverId: string;
}

/** Writes a round's result and (re)computes `score_events` for the acting
 * league's active members. Rounds are global (shared across every league
 * with a season in that year), so re-entering "the same" result from a
 * different league's dashboard only scores that league's own members -
 * it doesn't reach into other leagues. Idempotent: re-running with a
 * corrected result overwrites both the round and the score_events rows. */
export async function enterResult(input: EnterResultInput) {
	const { leagueId, roundId, enteredByUserId, p1DriverId, p2DriverId, p3DriverId } = input;

	await dbTx.transaction(async (tx) => {
		const [round] = await tx.select().from(rounds).where(eq(rounds.id, roundId));
		if (!round) throw new Error('Round not found.');
		if (round.lockAt > new Date()) {
			throw new Error('This round has not locked yet - picks are still open.');
		}

		const isOverride = round.resultEnteredAt !== null;

		await tx
			.update(rounds)
			.set({
				resultP1Id: p1DriverId,
				resultP2Id: p2DriverId,
				resultP3Id: p3DriverId,
				resultEnteredAt: new Date(),
				resultEnteredBy: enteredByUserId,
				status: 'completed'
			})
			.where(eq(rounds.id, roundId));

		const [season] = await tx
			.select()
			.from(leagueSeasons)
			.where(
				and(
					eq(leagueSeasons.leagueId, leagueId),
					eq(leagueSeasons.year, round.year),
					eq(leagueSeasons.status, 'active')
				)
			);
		if (!season) throw new Error('This league has no active season for this round.');

		const members = await tx
			.select({ userId: memberships.userId })
			.from(memberships)
			.where(and(eq(memberships.leagueId, leagueId), eq(memberships.status, 'active')));

		const result = { p1: p1DriverId, p2: p2DriverId, p3: p3DriverId };

		for (const member of members) {
			const [pick] = await tx
				.select()
				.from(picks)
				.where(
					and(
						eq(picks.leagueSeasonId, season.id),
						eq(picks.userId, member.userId),
						eq(picks.roundId, roundId)
					)
				);

			const { points, breakdown } = pick
				? scoreRound({ p1: pick.p1DriverId, p2: pick.p2DriverId, p3: pick.p3DriverId }, result)
				: { points: 0, breakdown: { topThree: 0, exactPosition: 0, winner: 0 } };

			await tx
				.insert(scoreEvents)
				.values({
					leagueSeasonId: season.id,
					userId: member.userId,
					roundId,
					points,
					breakdown
				})
				.onConflictDoUpdate({
					target: [scoreEvents.leagueSeasonId, scoreEvents.userId, scoreEvents.roundId],
					set: { points, breakdown }
				});
		}

		await recordAuditEvent(tx, {
			actorUserId: enteredByUserId,
			action: isOverride ? 'result_overridden' : 'result_entered',
			targetType: 'round',
			targetId: roundId,
			metadata: { leagueId, p1DriverId, p2DriverId, p3DriverId }
		});
	});
}
