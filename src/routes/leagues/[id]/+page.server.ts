import { and, eq, isNull, lte } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db, dbTx } from '$lib/server/db';
import {
	drivers,
	invites,
	leagues,
	leagueSeasons,
	memberships,
	rounds,
	users
} from '$lib/server/db/schema';
import { requireMember } from '$lib/server/authorization';
import { createInvite } from '$lib/server/invites';
import { recordAuditEvent } from '$lib/server/audit-log';
import { enterResult } from '$lib/server/results';

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

	let roundNeedingResult = null;
	let rosterDrivers: (typeof drivers.$inferSelect)[] = [];
	if (isAdminOrOwner && season?.status === 'active') {
		[roundNeedingResult] = await db
			.select()
			.from(rounds)
			.where(
				and(
					eq(rounds.year, season.year),
					lte(rounds.lockAt, new Date()),
					isNull(rounds.resultEnteredAt)
				)
			)
			.orderBy(rounds.roundNumber)
			.limit(1);
		rosterDrivers = await db
			.select()
			.from(drivers)
			.where(eq(drivers.active, true))
			.orderBy(drivers.name);
	}

	return {
		league,
		season,
		membership,
		members,
		invites: leagueInvites,
		isAdminOrOwner,
		roundNeedingResult: roundNeedingResult ?? null,
		drivers: rosterDrivers
	};
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
	},

	activateSeason: async ({ params, locals }) => {
		if (!locals.user) redirect(303, '/login');
		await requireMember(locals.user.id, params.id, 'admin');
		const actorUserId = locals.user.id;

		await dbTx.transaction(async (tx) => {
			const [season] = await tx
				.select()
				.from(leagueSeasons)
				.where(and(eq(leagueSeasons.leagueId, params.id), eq(leagueSeasons.status, 'setup')));
			if (!season) return;

			await tx
				.update(leagueSeasons)
				.set({ status: 'active', updatedAt: new Date() })
				.where(eq(leagueSeasons.id, season.id));

			await recordAuditEvent(tx, {
				actorUserId,
				action: 'season_activated',
				targetType: 'league_season',
				targetId: season.id,
				metadata: { leagueId: params.id }
			});
		});
	},

	enterResult: async ({ request, params, locals }) => {
		if (!locals.user) redirect(303, '/login');
		await requireMember(locals.user.id, params.id, 'admin');

		const formData = await request.formData();
		const roundId = String(formData.get('roundId') ?? '');
		const p1DriverId = String(formData.get('p1DriverId') ?? '');
		const p2DriverId = String(formData.get('p2DriverId') ?? '');
		const p3DriverId = String(formData.get('p3DriverId') ?? '');

		if (!roundId || !p1DriverId || !p2DriverId || !p3DriverId) {
			return fail(400, { resultError: 'Fill in P1, P2 and P3.' });
		}
		if (new Set([p1DriverId, p2DriverId, p3DriverId]).size !== 3) {
			return fail(400, { resultError: 'The top three must be three different drivers.' });
		}

		try {
			await enterResult({
				leagueId: params.id,
				roundId,
				enteredByUserId: locals.user.id,
				p1DriverId,
				p2DriverId,
				p3DriverId
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Could not save the result.';
			return fail(400, { resultError: message });
		}

		return { resultSuccess: true };
	}
};
