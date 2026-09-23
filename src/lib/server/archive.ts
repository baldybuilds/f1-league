import { and, eq, sql } from 'drizzle-orm';
import { dbTx } from '$lib/server/db';
import {
	leagueSeasons,
	memberships,
	scoreEvents,
	seasonPicks,
	seasonStandings
} from '$lib/server/db/schema';
import { recordAuditEvent } from '$lib/server/audit-log';
import { computeSeasonStandings } from '$lib/server/stats';

interface ArchiveSeasonInput {
	leagueId: string;
	wdcWinnerDriverId: string;
	wccWinnerTeam: string;
	actorUserId: string;
}

const DEFAULT_WDC_BONUS = 25;
const DEFAULT_WCC_BONUS = 15;

function readBonus(settings: unknown, key: 'wdcBonus' | 'wccBonus', fallback: number): number {
	if (settings && typeof settings === 'object' && key in settings) {
		const value = (settings as Record<string, unknown>)[key];
		if (typeof value === 'number') return value;
	}
	return fallback;
}

/** Freezes a league season's final table: sums score_events per active
 * member, applies WDC/WCC bonuses for members whose season pick matches the
 * confirmed winner, ranks with standard competition ranking, writes one
 * immutable season_standings row per member, and flips the season to
 * archived. Transactional - either all of it lands or none does. */
export async function archiveSeason(input: ArchiveSeasonInput) {
	const { leagueId, wdcWinnerDriverId, wccWinnerTeam, actorUserId } = input;

	await dbTx.transaction(async (tx) => {
		const [season] = await tx
			.select()
			.from(leagueSeasons)
			.where(and(eq(leagueSeasons.leagueId, leagueId), eq(leagueSeasons.status, 'active')));
		if (!season) throw new Error('This league has no active season to archive.');

		const activeMembers = await tx
			.select({ userId: memberships.userId })
			.from(memberships)
			.where(and(eq(memberships.leagueId, leagueId), eq(memberships.status, 'active')));

		const sumsRows = await tx
			.select({
				userId: scoreEvents.userId,
				regularPoints: sql<number>`sum(${scoreEvents.points})`.mapWith(Number)
			})
			.from(scoreEvents)
			.where(eq(scoreEvents.leagueSeasonId, season.id))
			.groupBy(scoreEvents.userId);
		const sumsByUser = new Map(sumsRows.map((row) => [row.userId, row.regularPoints]));

		const picks = await tx
			.select()
			.from(seasonPicks)
			.where(eq(seasonPicks.leagueSeasonId, season.id));

		const wdcMatches = new Set(
			picks.filter((p) => p.wdcDriverId === wdcWinnerDriverId).map((p) => p.userId)
		);
		const wccMatches = new Set(
			picks.filter((p) => p.wccTeam === wccWinnerTeam).map((p) => p.userId)
		);

		const bonuses = {
			wdc: readBonus(season.settings, 'wdcBonus', DEFAULT_WDC_BONUS),
			wcc: readBonus(season.settings, 'wccBonus', DEFAULT_WCC_BONUS)
		};

		const standings = computeSeasonStandings(
			activeMembers.map((m) => ({
				userId: m.userId,
				regularPoints: sumsByUser.get(m.userId) ?? 0
			})),
			wdcMatches,
			wccMatches,
			bonuses
		);

		for (const entry of standings) {
			await tx
				.insert(seasonStandings)
				.values({ leagueSeasonId: season.id, ...entry })
				.onConflictDoUpdate({
					target: [seasonStandings.leagueSeasonId, seasonStandings.userId],
					set: {
						regularPoints: entry.regularPoints,
						wdcBonus: entry.wdcBonus,
						wccBonus: entry.wccBonus,
						totalPoints: entry.totalPoints,
						rank: entry.rank
					}
				});
		}

		await tx
			.update(leagueSeasons)
			.set({
				status: 'archived',
				wdcWinnerDriverId,
				wccWinnerTeam,
				updatedAt: new Date()
			})
			.where(eq(leagueSeasons.id, season.id));

		await recordAuditEvent(tx, {
			actorUserId,
			action: 'season_archived',
			targetType: 'league_season',
			targetId: season.id,
			metadata: { leagueId, wdcWinnerDriverId, wccWinnerTeam, memberCount: activeMembers.length }
		});
	});
}
