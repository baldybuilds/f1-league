import { describe, expect, it } from 'vitest';
import { scoreRound } from './scoring';

describe('scoreRound', () => {
	const result = { p1: 'VER', p2: 'NOR', p3: 'LEC' };

	it('scores the max of 7 for a perfect pick', () => {
		const { points, breakdown } = scoreRound({ p1: 'VER', p2: 'NOR', p3: 'LEC' }, result);
		expect(points).toBe(7);
		expect(breakdown).toEqual({ topThree: 3, exactPosition: 3, winner: 1 });
	});

	it('scores top-three matches independently of order', () => {
		const { points, breakdown } = scoreRound({ p1: 'LEC', p2: 'VER', p3: 'NOR' }, result);
		// all 3 in the top three, but no exact positions and no correct winner
		expect(points).toBe(3);
		expect(breakdown).toEqual({ topThree: 3, exactPosition: 0, winner: 0 });
	});

	it('scores a partial match', () => {
		const { points, breakdown } = scoreRound({ p1: 'VER', p2: 'PIA', p3: 'HAM' }, result);
		// VER: in top three + exact position + winner = 3; PIA/HAM: nothing
		expect(points).toBe(3);
		expect(breakdown).toEqual({ topThree: 1, exactPosition: 1, winner: 1 });
	});

	it('scores zero for no overlap', () => {
		const { points, breakdown } = scoreRound({ p1: 'PIA', p2: 'HAM', p3: 'RUS' }, result);
		expect(points).toBe(0);
		expect(breakdown).toEqual({ topThree: 0, exactPosition: 0, winner: 0 });
	});

	it('scores the correct winner in the wrong pick slot as a top-three match but not a win', () => {
		const { points, breakdown } = scoreRound({ p1: 'NOR', p2: 'VER', p3: 'LEC' }, result);
		expect(points).toBe(4);
		expect(breakdown).toEqual({ topThree: 3, exactPosition: 1, winner: 0 });
	});

	it('does not double-count a duplicated driver in the pick', () => {
		const { points, breakdown } = scoreRound({ p1: 'VER', p2: 'VER', p3: 'LEC' }, result);
		// VER counted once for top-three despite appearing twice, even though
		// it lands in two exact-position matches (p1 and, coincidentally, p3
		// is a separate exact match for LEC)
		expect(points).toBe(5);
		expect(breakdown).toEqual({ topThree: 2, exactPosition: 2, winner: 1 });
	});
});
