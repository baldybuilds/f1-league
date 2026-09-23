// Run with: DATABASE_URL=... node scripts/seed-reference-data.ts
//
// Seeds a synthetic driver roster and a handful of test rounds so the
// pick -> lock -> result -> score pipeline can be exercised. This is
// explicitly test data for the `development` Neon branch, not the real
// 2027 calendar (see documentation/PLAN.md's "confirmed lineups seeded
// for 2027" launch-checklist item). Running it twice is safe - drivers are
// upserted by `code`, rounds by `(year, round_number)`.

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drivers, rounds } from '../src/lib/server/db/schema.ts';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required to run this script');
}

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), {
	schema: { drivers, rounds }
});

// Team colours only, per documentation/PLAN.md's branding rule - no logos, no
// headshots. Used as small UI accents (driver chips, select lists).
const TEAM_COLORS: Record<string, string> = {
	'Red Bull Racing': '#3671C6',
	Ferrari: '#E8002D',
	McLaren: '#FF8000',
	Mercedes: '#27F4D2',
	'Aston Martin': '#229971',
	Alpine: '#FF87BC',
	Haas: '#B6BABD',
	Williams: '#64C4FF',
	RB: '#6692FF',
	'Kick Sauber': '#52E252'
};

const DRIVER_ROSTER = [
	{ code: 'VER', name: 'Max Verstappen', team: 'Red Bull Racing', number: 1 },
	{ code: 'PER', name: 'Sergio Perez', team: 'Red Bull Racing', number: 11 },
	{ code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', number: 16 },
	{ code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', number: 55 },
	{ code: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari', number: 44 },
	{ code: 'RUS', name: 'George Russell', team: 'Mercedes', number: 63 },
	{ code: 'ANT', name: 'Kimi Antonelli', team: 'Mercedes', number: 12 },
	{ code: 'NOR', name: 'Lando Norris', team: 'McLaren', number: 4 },
	{ code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', number: 81 },
	{ code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', number: 14 },
	{ code: 'STR', name: 'Lance Stroll', team: 'Aston Martin', number: 18 },
	{ code: 'GAS', name: 'Pierre Gasly', team: 'Alpine', number: 10 },
	{ code: 'OCO', name: 'Esteban Ocon', team: 'Haas', number: 31 },
	{ code: 'ALB', name: 'Alexander Albon', team: 'Williams', number: 23 },
	{ code: 'SAR', name: 'Logan Sargeant', team: 'Williams', number: 2 },
	{ code: 'TSU', name: 'Yuki Tsunoda', team: 'RB', number: 22 },
	{ code: 'RIC', name: 'Daniel Ricciardo', team: 'RB', number: 3 },
	{ code: 'BOT', name: 'Valtteri Bottas', team: 'Kick Sauber', number: 77 },
	{ code: 'ZHO', name: 'Zhou Guanyu', team: 'Kick Sauber', number: 24 },
	{ code: 'MAG', name: 'Kevin Magnussen', team: 'Haas', number: 20 },
	{ code: 'COL', name: 'Franco Colapinto', team: 'Alpine', number: 43 }
] as const;

function daysFromNow(days: number): Date {
	return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

const TEST_ROUNDS = [
	{ year: 2027, roundNumber: 1, name: 'Test GP 1 (seed)', lockAt: daysFromNow(7) },
	{ year: 2027, roundNumber: 2, name: 'Test GP 2 (seed)', lockAt: daysFromNow(21) },
	{ year: 2027, roundNumber: 3, name: 'Test GP 3 (seed)', lockAt: daysFromNow(-7) } // already locked, for result-entry testing
] as const;

async function main() {
	for (const driver of DRIVER_ROSTER) {
		const teamColor = TEAM_COLORS[driver.team];
		await db
			.insert(drivers)
			.values({ ...driver, teamColor })
			.onConflictDoUpdate({
				target: drivers.code,
				set: { name: driver.name, team: driver.team, number: driver.number, teamColor }
			});
	}
	console.log(`Seeded ${DRIVER_ROSTER.length} drivers.`);

	for (const round of TEST_ROUNDS) {
		await db
			.insert(rounds)
			.values(round)
			.onConflictDoUpdate({
				target: [rounds.year, rounds.roundNumber],
				set: { name: round.name, lockAt: round.lockAt }
			});
	}
	console.log(`Seeded ${TEST_ROUNDS.length} rounds.`);
}

await main();
process.exit(0);
