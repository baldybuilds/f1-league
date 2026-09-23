import type { ScoreBreakdown } from './scoring';

export interface ScoreEventRow {
	roundId: string;
	roundNumber: number;
	points: number;
	breakdown: ScoreBreakdown;
}

export interface UserStatRollup {
	roundsScored: number;
	totalPoints: number;
	podiumRate: number;
	exactRate: number;
	winnerRate: number;
	bestRound: ScoreEventRow | null;
	worstRound: ScoreEventRow | null;
}

/** Pure aggregation over a user's score_events rows - used both for a single
 * league season (My Season) and across every league season a user has
 * (Career), so the two pages share one tested rollup instead of duplicating
 * the same math at two scopes. */
export function computeUserStatRollup(rows: ScoreEventRow[]): UserStatRollup {
	if (rows.length === 0) {
		return {
			roundsScored: 0,
			totalPoints: 0,
			podiumRate: 0,
			exactRate: 0,
			winnerRate: 0,
			bestRound: null,
			worstRound: null
		};
	}

	let totalPoints = 0;
	let topThreeSum = 0;
	let exactSum = 0;
	let winnerSum = 0;
	let best = rows[0];
	let worst = rows[0];

	for (const row of rows) {
		totalPoints += row.points;
		topThreeSum += row.breakdown.topThree;
		exactSum += row.breakdown.exactPosition;
		winnerSum += row.breakdown.winner;
		if (row.points > best.points) best = row;
		if (row.points < worst.points) worst = row;
	}

	return {
		roundsScored: rows.length,
		totalPoints,
		podiumRate: topThreeSum / (rows.length * 3),
		exactRate: exactSum / (rows.length * 3),
		winnerRate: winnerSum / rows.length,
		bestRound: best,
		worstRound: worst
	};
}

export interface SeasonStandingSum {
	userId: string;
	regularPoints: number;
}

export interface SeasonBonuses {
	wdc: number;
	wcc: number;
}

export interface SeasonStandingResult {
	userId: string;
	regularPoints: number;
	wdcBonus: number;
	wccBonus: number;
	totalPoints: number;
	rank: number;
}

/** Pure - applies WDC/WCC bonuses and ranks with standard competition
 * ranking (ties share a rank, the next rank skips accordingly: 1, 1, 3). */
export function computeSeasonStandings(
	sums: SeasonStandingSum[],
	wdcMatches: Set<string>,
	wccMatches: Set<string>,
	bonuses: SeasonBonuses
): SeasonStandingResult[] {
	const withBonuses = sums.map((sum) => {
		const wdcBonus = wdcMatches.has(sum.userId) ? bonuses.wdc : 0;
		const wccBonus = wccMatches.has(sum.userId) ? bonuses.wcc : 0;
		return {
			userId: sum.userId,
			regularPoints: sum.regularPoints,
			wdcBonus,
			wccBonus,
			totalPoints: sum.regularPoints + wdcBonus + wccBonus
		};
	});

	withBonuses.sort((a, b) => b.totalPoints - a.totalPoints);

	const ranked: SeasonStandingResult[] = [];
	let previousTotal: number | null = null;
	let previousRank = 0;
	withBonuses.forEach((entry, index) => {
		const rank = entry.totalPoints === previousTotal ? previousRank : index + 1;
		ranked.push({ ...entry, rank });
		previousTotal = entry.totalPoints;
		previousRank = rank;
	});

	return ranked;
}
