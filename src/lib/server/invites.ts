import { and, eq, gt, isNull } from 'drizzle-orm';
import { db, dbTx } from '$lib/server/db';
import {
	invites,
	leagues,
	memberships,
	seasonEntries,
	leagueSeasons,
	users
} from '$lib/server/db/schema';
import { generateToken, hashToken } from '$lib/server/auth/tokens';
import { recordAuditEvent } from '$lib/server/audit-log';

interface CreateInviteOptions {
	expiresInDays?: number;
	maxUses?: number;
	approvalRequired?: boolean;
}

export async function createInvite(
	leagueId: string,
	{ expiresInDays = 7, maxUses = 1, approvalRequired = false }: CreateInviteOptions = {}
) {
	const { token, hash } = generateToken();

	await db.insert(invites).values({
		leagueId,
		tokenHash: hash,
		expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
		maxUses,
		approvalRequired
	});

	return token;
}

export async function getInviteDetails(rawToken: string) {
	const hash = hashToken(rawToken);
	const now = new Date();

	const [row] = await db
		.select({
			inviteId: invites.id,
			leagueId: invites.leagueId,
			leagueName: leagues.name,
			ownerDisplayName: users.displayName,
			maxUses: invites.maxUses,
			uses: invites.uses,
			approvalRequired: invites.approvalRequired
		})
		.from(invites)
		.innerJoin(leagues, eq(invites.leagueId, leagues.id))
		.innerJoin(users, eq(leagues.ownerId, users.id))
		.where(and(eq(invites.tokenHash, hash), isNull(invites.revokedAt), gt(invites.expiresAt, now)));

	if (!row || row.uses >= row.maxUses) return null;

	return row;
}

type Transaction = Parameters<Parameters<typeof dbTx.transaction>[0]>[0];

/** Creates the membership + season entry for an invite redemption. Idempotent -
 * a no-op if the user is already a member, or if the invite no longer exists.
 * Must run inside a transaction. */
export async function redeemInvite(tx: Transaction, inviteId: string, userId: string) {
	const [invite] = await tx.select().from(invites).where(eq(invites.id, inviteId));
	if (!invite) return;

	const [existing] = await tx
		.select()
		.from(memberships)
		.where(and(eq(memberships.leagueId, invite.leagueId), eq(memberships.userId, userId)));

	if (existing) return;

	const [membership] = await tx
		.insert(memberships)
		.values({
			leagueId: invite.leagueId,
			userId,
			role: 'member',
			status: invite.approvalRequired ? 'pending' : 'active'
		})
		.returning();

	await recordAuditEvent(tx, {
		actorUserId: userId,
		action: 'membership_created',
		targetType: 'membership',
		targetId: membership.id,
		metadata: { role: membership.role, status: membership.status, via: 'invite' }
	});

	const [season] = await tx
		.select()
		.from(leagueSeasons)
		.where(eq(leagueSeasons.leagueId, invite.leagueId))
		.orderBy(leagueSeasons.year);

	if (season) {
		await tx.insert(seasonEntries).values({ leagueSeasonId: season.id, userId });
	}

	await tx
		.update(invites)
		.set({ uses: invite.uses + 1 })
		.where(eq(invites.id, inviteId));
}

/** Runs redeemInvite in its own transaction, for callers that don't already have one open. */
export async function redeemInviteStandalone(inviteId: string, userId: string) {
	await dbTx.transaction(async (tx) => {
		await redeemInvite(tx, inviteId, userId);
	});
}
