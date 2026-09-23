export type TopThreePick = { p1: string; p2: string; p3: string };

export type ScoreBreakdown = {
	topThree: number;
	exactPosition: number;
	winner: number;
};

export type ScoreResult = {
	points: number;
	breakdown: ScoreBreakdown;
};

/**
 * PLAN.md "Top-three scoring": +1 per pick driver in the actual top 3 (any
 * position, max 3), +1 per exact-position match (max 3), +1 for the correct
 * winner (max 7 total). Duplicate drivers within a pick are rejected at
 * submission time, not here - a pick reaching this function is assumed valid.
 */
export function scoreRound(pick: TopThreePick, result: TopThreePick): ScoreResult {
	const pickDrivers = [pick.p1, pick.p2, pick.p3];
	const resultDrivers = new Set([result.p1, result.p2, result.p3]);

	const topThree = new Set(pickDrivers.filter((driver) => resultDrivers.has(driver))).size;
	const exactPosition = [
		pick.p1 === result.p1,
		pick.p2 === result.p2,
		pick.p3 === result.p3
	].filter(Boolean).length;
	const winner = pick.p1 === result.p1 ? 1 : 0;

	return {
		points: topThree + exactPosition + winner,
		breakdown: { topThree, exactPosition, winner }
	};
}
