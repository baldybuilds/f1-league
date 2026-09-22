import { afterEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { leagueSeasons, memberships } from './db/schema';
import { createLeague } from './leagues';
import { createTestUser, deleteTestLeague, deleteTestUser } from './test-helpers';

describe('createLeague', () => {
	let leagueId = '';
	let ownerId = '';
	let ownerEmail = '';

	afterEach(async () => {
		if (leagueId) await deleteTestLeague(leagueId);
		if (ownerId) await deleteTestUser(ownerId, ownerEmail);
		leagueId = '';
		ownerId = '';
		ownerEmail = '';
	});

	it('creates a league, a default season, and an active owner membership atomically', async () => {
		const owner = await createTestUser();
		ownerId = owner.id;
		ownerEmail = owner.email;

		const league = await createLeague(owner.id, 'CI Test League');
		leagueId = league.id;

		const [season] = await db
			.select()
			.from(leagueSeasons)
			.where(eq(leagueSeasons.leagueId, league.id));
		const [membership] = await db
			.select()
			.from(memberships)
			.where(eq(memberships.leagueId, league.id));

		expect(season?.status).toBe('setup');
		expect(season?.year).toBe(2027);
		expect(membership?.role).toBe('owner');
		expect(membership?.status).toBe('active');
	});
});
