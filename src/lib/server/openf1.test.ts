import { describe, expect, it } from 'vitest';
import {
	topThreeFromSessionResult,
	type OpenF1DriverRow,
	type OpenF1SessionResultRow
} from './openf1';

// Trimmed from a real response (session_key=11369, 2026 Madrid GP, fetched
// live 2026-09-23) - includes the null-position DNF rows that make this
// function non-trivial.
const driverRows: OpenF1DriverRow[] = [
	{ driver_number: 1, name_acronym: 'NOR' },
	{ driver_number: 3, name_acronym: 'VER' },
	{ driver_number: 12, name_acronym: 'ANT' },
	{ driver_number: 55, name_acronym: 'SAI' },
	{ driver_number: 11, name_acronym: 'PER' },
	{ driver_number: 18, name_acronym: 'STR' }
];

const resultRows: OpenF1SessionResultRow[] = [
	{ position: null, driver_number: 55, dnf: true, dns: false, dsq: false },
	{ position: null, driver_number: 11, dnf: true, dns: false, dsq: false },
	{ position: null, driver_number: 18, dnf: true, dns: false, dsq: false },
	{ position: 1, driver_number: 12, dnf: false, dns: false, dsq: false },
	{ position: 2, driver_number: 3, dnf: false, dns: false, dsq: false },
	{ position: 3, driver_number: 1, dnf: false, dns: false, dsq: false }
];

describe('topThreeFromSessionResult', () => {
	it('extracts the top three by position, ignoring null-position DNF rows and row order', () => {
		const result = topThreeFromSessionResult(resultRows, driverRows);
		expect(result).toEqual({ p1Code: 'ANT', p2Code: 'VER', p3Code: 'NOR' });
	});

	it('returns null when fewer than three positions are classified yet (session still live)', () => {
		const incomplete = resultRows.filter((r) => r.position !== 3);
		expect(topThreeFromSessionResult(incomplete, driverRows)).toBeNull();
	});

	it('returns null when a classified driver has no matching driver row', () => {
		const missingDriver = driverRows.filter((d) => d.driver_number !== 12);
		expect(topThreeFromSessionResult(resultRows, missingDriver)).toBeNull();
	});

	it('returns null for a completely empty result set', () => {
		expect(topThreeFromSessionResult([], driverRows)).toBeNull();
	});
});
