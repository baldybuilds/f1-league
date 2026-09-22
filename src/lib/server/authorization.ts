import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { memberships } from './db/schema';

type Role = 'member' | 'admin' | 'owner';

const ROLE_RANK: Record<Role, number> = { member: 0, admin: 1, owner: 2 };

/** Every league query should take its league id from this check. Returns the
 * membership row on success. A non-member, a pending/removed member, or a
 * member of a *different* league all get the same 404 - it never confirms a
 * league exists to someone without active access to it (IDOR-safe). */
export async function requireMember(
	userId: string | undefined,
	leagueId: string,
	minRole: Role = 'member'
) {
	if (!userId) error(401, 'Sign in required.');

	const [membership] = await db
		.select()
		.from(memberships)
		.where(and(eq(memberships.leagueId, leagueId), eq(memberships.userId, userId)));

	if (!membership || membership.status !== 'active') {
		error(404, 'League not found.');
	}

	if (ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
		error(403, 'You do not have permission to do that.');
	}

	return membership;
}
