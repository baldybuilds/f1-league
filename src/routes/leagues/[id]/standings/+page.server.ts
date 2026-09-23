import { and, desc, eq, sql } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { leagueSeasons, scoreEvents, users } from '$lib/server/db/schema';
import { requireMember } from '$lib/server/authorization';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(303, '/login');
	await requireMember(locals.user.id, params.id, 'member');

	const [season] = await db
		.select()
		.from(leagueSeasons)
		.where(and(eq(leagueSeasons.leagueId, params.id), eq(leagueSeasons.status, 'active')));

	if (!season) return { season: null, standings: [] };

	const standings = await db
		.select({
			userId: scoreEvents.userId,
			displayName: users.displayName,
			avatarColour: users.avatarColour,
			totalPoints: sql<number>`sum(${scoreEvents.points})`.mapWith(Number),
			roundsScored: sql<number>`count(*)`.mapWith(Number)
		})
		.from(scoreEvents)
		.innerJoin(users, eq(scoreEvents.userId, users.id))
		.where(eq(scoreEvents.leagueSeasonId, season.id))
		.groupBy(scoreEvents.userId, users.displayName, users.avatarColour)
		.orderBy(desc(sql`sum(${scoreEvents.points})`));

	return { season, standings };
};
