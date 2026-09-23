import { describe, expect, it } from 'vitest';
import { computeSeasonStandings, computeUserStatRollup, type ScoreEventRow } from './stats';

describe('computeUserStatRollup', () => {
	it('returns zeroed-out stats for no rounds', () => {
		const result = computeUserStatRollup([]);
		expect(result).toEqual({
			roundsScored: 0,
			totalPoints: 0,
			podiumRate: 0,
			exactRate: 0,
			winnerRate: 0,
			bestRound: null,
			worstRound: null
		});
	});

	it('handles every round scoring zero', () => {
		const rows: ScoreEventRow[] = [
			{
				roundId: 'r1',
				roundNumber: 1,
				points: 0,
				breakdown: { topThree: 0, exactPosition: 0, winner: 0 }
			},
			{
				roundId: 'r2',
				roundNumber: 2,
				points: 0,
				breakdown: { topThree: 0, exactPosition: 0, winner: 0 }
			}
		];
		const result = computeUserStatRollup(rows);
		expect(result.totalPoints).toBe(0);
		expect(result.podiumRate).toBe(0);
		expect(result.exactRate).toBe(0);
		expect(result.winnerRate).toBe(0);
		expect(result.roundsScored).toBe(2);
	});

	it('computes rates and best/worst round across mixed results', () => {
		const rows: ScoreEventRow[] = [
			{
				roundId: 'r1',
				roundNumber: 1,
				points: 7,
				breakdown: { topThree: 3, exactPosition: 3, winner: 1 }
			},
			{
				roundId: 'r2',
				roundNumber: 2,
				points: 3,
				breakdown: { topThree: 1, exactPosition: 1, winner: 1 }
			},
			{
				roundId: 'r3',
				roundNumber: 3,
				points: 0,
				breakdown: { topThree: 0, exactPosition: 0, winner: 0 }
			}
		];
		const result = computeUserStatRollup(rows);
		expect(result.roundsScored).toBe(3);
		expect(result.totalPoints).toBe(10);
		expect(result.podiumRate).toBeCloseTo(4 / 9);
		expect(result.exactRate).toBeCloseTo(4 / 9);
		expect(result.winnerRate).toBeCloseTo(2 / 3);
		expect(result.bestRound?.roundId).toBe('r1');
		expect(result.worstRound?.roundId).toBe('r3');
	});

	it('resolves a best/worst tie to the first occurrence, deterministically', () => {
		const rows: ScoreEventRow[] = [
			{
				roundId: 'r1',
				roundNumber: 1,
				points: 5,
				breakdown: { topThree: 2, exactPosition: 1, winner: 0 }
			},
			{
				roundId: 'r2',
				roundNumber: 2,
				points: 5,
				breakdown: { topThree: 2, exactPosition: 1, winner: 0 }
			}
		];
		const result = computeUserStatRollup(rows);
		expect(result.bestRound?.roundId).toBe('r1');
		expect(result.worstRound?.roundId).toBe('r1');
	});
});

describe('computeSeasonStandings', () => {
	it('applies WDC/WCC bonuses only to matching users and ranks by total', () => {
		const result = computeSeasonStandings(
			[
				{ userId: 'a', regularPoints: 50 },
				{ userId: 'b', regularPoints: 70 }
			],
			new Set(['a']), // a matched WDC
			new Set(), // nobody matched WCC
			{ wdc: 25, wcc: 15 }
		);

		const byUser = Object.fromEntries(result.map((r) => [r.userId, r]));
		expect(byUser.a).toEqual({
			userId: 'a',
			regularPoints: 50,
			wdcBonus: 25,
			wccBonus: 0,
			totalPoints: 75,
			rank: 1
		});
		expect(byUser.b).toEqual({
			userId: 'b',
			regularPoints: 70,
			wdcBonus: 0,
			wccBonus: 0,
			totalPoints: 70,
			rank: 2
		});
	});

	it('uses standard competition ranking for ties (1, 1, 3)', () => {
		const result = computeSeasonStandings(
			[
				{ userId: 'a', regularPoints: 50 },
				{ userId: 'b', regularPoints: 50 },
				{ userId: 'c', regularPoints: 40 }
			],
			new Set(),
			new Set(),
			{ wdc: 25, wcc: 15 }
		);

		const byUser = Object.fromEntries(result.map((r) => [r.userId, r.rank]));
		expect(byUser.a).toBe(1);
		expect(byUser.b).toBe(1);
		expect(byUser.c).toBe(3);
	});

	it('applies both bonuses to the same user', () => {
		const result = computeSeasonStandings(
			[{ userId: 'a', regularPoints: 10 }],
			new Set(['a']),
			new Set(['a']),
			{ wdc: 25, wcc: 15 }
		);
		expect(result[0]).toEqual({
			userId: 'a',
			regularPoints: 10,
			wdcBonus: 25,
			wccBonus: 15,
			totalPoints: 50,
			rank: 1
		});
	});
});
