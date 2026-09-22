import { and, eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { invites, leagues, leagueSeasons, memberships, users } from '$lib/server/db/schema';
import { requireMember } from '$lib/server/authorization';
import { createInvite } from '$lib/server/invites';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(303, '/login');

	const [membership] = await db
		.select()
		.from(memberships)
		.where(and(eq(memberships.leagueId, params.id), eq(memberships.userId, locals.user.id)));

	if (!membership) error(404, 'League not found.');

	const [league] = await db.select().from(leagues).where(eq(leagues.id, params.id));
	if (!league) error(404, 'League not found.');

	const [season] = await db
		.select()
		.from(leagueSeasons)
		.where(eq(leagueSeasons.leagueId, params.id))
		.orderBy(leagueSeasons.year);

	if (membership.status !== 'active') {
		return { league, season, membership, members: null, invites: null, isAdminOrOwner: false };
	}

	const isAdminOrOwner = membership.role === 'owner' || membership.role === 'admin';

	const members = await db
		.select({
			membershipId: memberships.id,
			displayName: users.displayName,
			avatarColour: users.avatarColour,
			role: memberships.role,
			status: memberships.status
		})
		.from(memberships)
		.innerJoin(users, eq(memberships.userId, users.id))
		.where(eq(memberships.leagueId, params.id))
		.orderBy(memberships.createdAt);

	const leagueInvites = isAdminOrOwner
		? await db
				.select()
				.from(invites)
				.where(eq(invites.leagueId, params.id))
				.orderBy(invites.createdAt)
		: null;

	return { league, season, membership, members, invites: leagueInvites, isAdminOrOwner };
};

export const actions: Actions = {
	createInvite: async ({ params, locals, url }) => {
		if (!locals.user) redirect(303, '/login');
		await requireMember(locals.user.id, params.id, 'admin');

		const token = await createInvite(params.id, { maxUses: 10 });

		return { inviteUrl: `${url.origin}/join/${token}` };
	},

	revokeInvite: async ({ request, params, locals }) => {
		if (!locals.user) redirect(303, '/login');
		await requireMember(locals.user.id, params.id, 'admin');

		const formData = await request.formData();
		const inviteId = String(formData.get('inviteId') ?? '');
		if (!inviteId) return fail(400, { error: 'Missing invite id.' });

		await db
			.update(invites)
			.set({ revokedAt: new Date() })
			.where(and(eq(invites.id, inviteId), eq(invites.leagueId, params.id)));
	},

	approveMember: async ({ request, params, locals }) => {
		if (!locals.user) redirect(303, '/login');
		await requireMember(locals.user.id, params.id, 'admin');

		const formData = await request.formData();
		const membershipId = String(formData.get('membershipId') ?? '');
		if (!membershipId) return fail(400, { error: 'Missing membership id.' });

		await db
			.update(memberships)
			.set({ status: 'active', updatedAt: new Date() })
			.where(and(eq(memberships.id, membershipId), eq(memberships.leagueId, params.id)));
	}
};
