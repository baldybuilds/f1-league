import { afterEach, describe, expect, it } from 'vitest';
import { isHttpError } from '@sveltejs/kit';
import { db } from './db';
import { memberships } from './db/schema';
import { createLeague } from './leagues';
import { requireMember } from './authorization';
import { createTestUser, deleteTestLeague, deleteTestUser } from './test-helpers';

function statusOf(err: unknown): number | undefined {
	return isHttpError(err) ? err.status : undefined;
}

describe('requireMember', () => {
	let leagueId = '';
	let leagueBId = '';
	let ownerId = '';
	let ownerEmail = '';
	let outsiderId = '';
	let outsiderEmail = '';

	afterEach(async () => {
		if (leagueId) await deleteTestLeague(leagueId);
		if (leagueBId) await deleteTestLeague(leagueBId);
		if (outsiderId) await deleteTestUser(outsiderId, outsiderEmail);
		if (ownerId) await deleteTestUser(ownerId, ownerEmail);
		leagueId = '';
		leagueBId = '';
		ownerId = '';
		ownerEmail = '';
		outsiderId = '';
		outsiderEmail = '';
	});

	it('succeeds for the owner at any required role', async () => {
		const owner = await createTestUser();
		ownerId = owner.id;
		ownerEmail = owner.email;
		const league = await createLeague(owner.id, 'CI Authz League');
		leagueId = league.id;

		const membership = await requireMember(owner.id, league.id, 'owner');
		expect(membership.role).toBe('owner');
	});

	it('404s for a user with no membership at all', async () => {
		const owner = await createTestUser();
		ownerId = owner.id;
		ownerEmail = owner.email;
		const league = await createLeague(owner.id, 'CI Authz League 2');
		leagueId = league.id;

		const outsider = await createTestUser();
		outsiderId = outsider.id;
		outsiderEmail = outsider.email;

		try {
			await requireMember(outsider.id, league.id);
			expect.unreachable('should have thrown');
		} catch (err) {
			expect(statusOf(err)).toBe(404);
		}
	});

	it('404s for a pending (not yet approved) member', async () => {
		const owner = await createTestUser();
		ownerId = owner.id;
		ownerEmail = owner.email;
		const league = await createLeague(owner.id, 'CI Authz League 3');
		leagueId = league.id;

		const outsider = await createTestUser();
		outsiderId = outsider.id;
		outsiderEmail = outsider.email;
		await db.insert(memberships).values({
			leagueId: league.id,
			userId: outsider.id,
			role: 'member',
			status: 'pending'
		});

		try {
			await requireMember(outsider.id, league.id);
			expect.unreachable('should have thrown');
		} catch (err) {
			expect(statusOf(err)).toBe(404);
		}
	});

	it('403s when the active member is under the required role', async () => {
		const owner = await createTestUser();
		ownerId = owner.id;
		ownerEmail = owner.email;
		const league = await createLeague(owner.id, 'CI Authz League 4');
		leagueId = league.id;

		const outsider = await createTestUser();
		outsiderId = outsider.id;
		outsiderEmail = outsider.email;
		await db.insert(memberships).values({
			leagueId: league.id,
			userId: outsider.id,
			role: 'member',
			status: 'active'
		});

		try {
			await requireMember(outsider.id, league.id, 'owner');
			expect.unreachable('should have thrown');
		} catch (err) {
			expect(statusOf(err)).toBe(403);
		}
	});

	it('404s for a member of a different league (cross-league / IDOR)', async () => {
		const owner = await createTestUser();
		ownerId = owner.id;
		ownerEmail = owner.email;
		const league = await createLeague(owner.id, 'CI Authz League 5');
		leagueId = league.id;

		const otherOwner = await createTestUser();
		outsiderId = otherOwner.id;
		outsiderEmail = otherOwner.email;
		const otherLeague = await createLeague(otherOwner.id, 'CI Authz League 5b');
		leagueBId = otherLeague.id;

		try {
			// otherOwner is a real (owner) member of otherLeague, but not of league.
			await requireMember(otherOwner.id, league.id);
			expect.unreachable('should have thrown');
		} catch (err) {
			expect(statusOf(err)).toBe(404);
		}
	});
});
