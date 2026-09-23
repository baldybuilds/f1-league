// Scheduled Netlify Function - built standalone by Netlify (esbuild), not by
// SvelteKit's Vite pipeline, so $lib/$env aliases don't resolve here. Own DB
// client + relative imports for schema/openf1/scoring, same constraint as
// scripts/seed-reference-data.ts. See documentation/PLAN.md's OpenF1 section.

import type { Config } from '@netlify/functions';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { and, eq, gte, isNotNull, lte } from 'drizzle-orm';
import {
	auditLog,
	drivers,
	leagueSeasons,
	memberships,
	picks,
	rounds,
	scoreEvents
} from '../../src/lib/server/db/schema.ts';
import {
	fetchSessionDrivers,
	fetchSessionResult,
	getAccessToken,
	topThreeFromSessionResult
} from '../../src/lib/server/openf1.ts';
import { scoreRound } from '../../src/lib/server/scoring.ts';

const RECHECK_WINDOW_DAYS = 7;

export default async () => {
	if (!process.env.DATABASE_URL) {
		console.error('sync-results: DATABASE_URL is not set.');
		return new Response('DATABASE_URL not set', { status: 500 });
	}

	const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), {
		schema: { auditLog, drivers, leagueSeasons, memberships, picks, rounds, scoreEvents }
	});

	const now = new Date();
	const windowStart = new Date(now.getTime() - RECHECK_WINDOW_DAYS * 24 * 60 * 60 * 1000);

	const candidateRounds = await db
		.select()
		.from(rounds)
		.where(
			and(
				isNotNull(rounds.openf1SessionKey),
				lte(rounds.lockAt, now),
				gte(rounds.lockAt, windowStart)
			)
		);

	console.log(`sync-results: ${candidateRounds.length} candidate round(s) in the recheck window.`);

	if (candidateRounds.length === 0) {
		return new Response('No candidate rounds.', { status: 200 });
	}

	let token: string;
	try {
		token = await getAccessToken();
	} catch (err) {
		console.error('sync-results: failed to get an OpenF1 access token.', err);
		return new Response('OpenF1 auth failed', { status: 500 });
	}

	const roster = await db.select().from(drivers);
	const codeToDriverId = new Map(roster.map((d) => [d.code, d.id]));

	let synced = 0;
	for (const round of candidateRounds) {
		try {
			const sessionKey = round.openf1SessionKey!;
			const [resultRows, driverRows] = await Promise.all([
				fetchSessionResult(sessionKey, token),
				fetchSessionDrivers(sessionKey, token)
			]);

			const topThree = topThreeFromSessionResult(resultRows, driverRows);
			if (!topThree) {
				console.log(
					`sync-results: round ${round.id} (session ${sessionKey}) not fully classified yet, skipping.`
				);
				continue;
			}

			const p1DriverId = codeToDriverId.get(topThree.p1Code);
			const p2DriverId = codeToDriverId.get(topThree.p2Code);
			const p3DriverId = codeToDriverId.get(topThree.p3Code);
			if (!p1DriverId || !p2DriverId || !p3DriverId) {
				console.warn(
					`sync-results: round ${round.id} top three (${topThree.p1Code}/${topThree.p2Code}/${topThree.p3Code}) includes a driver not in our roster, skipping.`
				);
				continue;
			}

			const result = { p1: p1DriverId, p2: p2DriverId, p3: p3DriverId };

			await db.transaction(async (tx) => {
				await tx
					.update(rounds)
					.set({
						resultP1Id: p1DriverId,
						resultP2Id: p2DriverId,
						resultP3Id: p3DriverId,
						resultEnteredAt: new Date(),
						resultEnteredBy: null,
						status: 'completed'
					})
					.where(eq(rounds.id, round.id));

				const activeSeasons = await tx
					.select()
					.from(leagueSeasons)
					.where(and(eq(leagueSeasons.year, round.year), eq(leagueSeasons.status, 'active')));

				for (const season of activeSeasons) {
					const activeMembers = await tx
						.select({ userId: memberships.userId })
						.from(memberships)
						.where(
							and(eq(memberships.leagueId, season.leagueId), eq(memberships.status, 'active'))
						);

					for (const member of activeMembers) {
						const [pick] = await tx
							.select()
							.from(picks)
							.where(
								and(
									eq(picks.leagueSeasonId, season.id),
									eq(picks.userId, member.userId),
									eq(picks.roundId, round.id)
								)
							);

						const { points, breakdown } = pick
							? scoreRound(
									{ p1: pick.p1DriverId, p2: pick.p2DriverId, p3: pick.p3DriverId },
									result
								)
							: { points: 0, breakdown: { topThree: 0, exactPosition: 0, winner: 0 } };

						await tx
							.insert(scoreEvents)
							.values({
								leagueSeasonId: season.id,
								userId: member.userId,
								roundId: round.id,
								points,
								breakdown
							})
							.onConflictDoUpdate({
								target: [scoreEvents.leagueSeasonId, scoreEvents.userId, scoreEvents.roundId],
								set: { points, breakdown }
							});
					}
				}

				await tx.insert(auditLog).values({
					actorUserId: null,
					action: 'result_synced',
					targetType: 'round',
					targetId: round.id,
					metadata: {
						openf1SessionKey: sessionKey,
						p1DriverId,
						p2DriverId,
						p3DriverId,
						leaguesScored: activeSeasons.length
					}
				});
			});

			synced += 1;
		} catch (err) {
			console.error(`sync-results: failed to sync round ${round.id}.`, err);
		}
	}

	return new Response(`Synced ${synced}/${candidateRounds.length} round(s).`, { status: 200 });
};

export const config: Config = {
	schedule: '@hourly'
};
