import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { leagues, leagueSeasons, memberships } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');

	const rows = await db
		.select({
			leagueId: leagues.id,
			leagueName: leagues.name,
			role: memberships.role,
			status: memberships.status,
			seasonYear: leagueSeasons.year,
			seasonStatus: leagueSeasons.status
		})
		.from(memberships)
		.innerJoin(leagues, eq(memberships.leagueId, leagues.id))
		.innerJoin(leagueSeasons, eq(leagueSeasons.leagueId, leagues.id))
		.where(eq(memberships.userId, locals.user.id))
		.orderBy(leagues.createdAt);

	return { leagues: rows };
};
