import { afterEach, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { auditLog, invites, memberships } from './db/schema';
import { createLeague } from './leagues';
import { createInvite, getInviteDetails, redeemInviteStandalone } from './invites';
import { hashToken } from './auth/tokens';
import { createTestUser, deleteTestLeague, deleteTestUser } from './test-helpers';

describe('invites', () => {
	let leagueId = '';
	let ownerId = '';
	let ownerEmail = '';
	let memberId = '';
	let memberEmail = '';

	afterEach(async () => {
		if (leagueId) await deleteTestLeague(leagueId);
		if (memberId) await deleteTestUser(memberId, memberEmail);
		if (ownerId) await deleteTestUser(ownerId, ownerEmail);
		leagueId = '';
		ownerId = '';
		ownerEmail = '';
		memberId = '';
		memberEmail = '';
	});

	it('createInvite + getInviteDetails round-trips league and owner info', async () => {
		const owner = await createTestUser({ displayName: 'CI Owner' });
		ownerId = owner.id;
		ownerEmail = owner.email;
		const league = await createLeague(owner.id, 'CI Invite League');
		leagueId = league.id;

		const token = await createInvite(league.id, { maxUses: 1 });
		const details = await getInviteDetails(token);

		expect(details?.leagueName).toBe('CI Invite League');
		expect(details?.ownerDisplayName).toBe('CI Owner');
	});

	it('rejects a revoked invite', async () => {
		const owner = await createTestUser();
		ownerId = owner.id;
		ownerEmail = owner.email;
		const league = await createLeague(owner.id, 'CI Revoked League');
		leagueId = league.id;

		const token = await createInvite(league.id);
		await db
			.update(invites)
			.set({ revokedAt: new Date() })
			.where(eq(invites.tokenHash, hashToken(token)));

		expect(await getInviteDetails(token)).toBeNull();
	});

	it('redeemInvite creates a membership and season entry, and is idempotent', async () => {
		const owner = await createTestUser();
		ownerId = owner.id;
		ownerEmail = owner.email;
		const league = await createLeague(owner.id, 'CI Redeem League');
		leagueId = league.id;

		const member = await createTestUser();
		memberId = member.id;
		memberEmail = member.email;

		const token = await createInvite(league.id, { maxUses: 5 });
		const details = await getInviteDetails(token);

		await redeemInviteStandalone(details!.inviteId, member.id);
		await redeemInviteStandalone(details!.inviteId, member.id); // idempotent

		const rows = await db
			.select()
			.from(memberships)
			.where(and(eq(memberships.leagueId, league.id), eq(memberships.userId, member.id)));

		expect(rows).toHaveLength(1);

		const auditRows = await db
			.select()
			.from(auditLog)
			.where(and(eq(auditLog.actorUserId, member.id), eq(auditLog.action, 'membership_created')));

		expect(auditRows).toHaveLength(1);
		expect(auditRows[0].targetId).toBe(rows[0].id);
	});

	it('enforces max uses', async () => {
		const owner = await createTestUser();
		ownerId = owner.id;
		ownerEmail = owner.email;
		const league = await createLeague(owner.id, 'CI MaxUses League');
		leagueId = league.id;

		const member = await createTestUser();
		memberId = member.id;
		memberEmail = member.email;

		const token = await createInvite(league.id, { maxUses: 1 });
		const details = await getInviteDetails(token);
		await redeemInviteStandalone(details!.inviteId, member.id);

		expect(await getInviteDetails(token)).toBeNull();
	});
});
