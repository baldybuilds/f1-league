import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createLeague } from '$lib/server/leagues';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();

		if (name.length < 2 || name.length > 60) {
			return fail(400, { error: 'League name must be 2-60 characters.' });
		}

		await createLeague(locals.user.id, name);

		redirect(303, '/');
	}
};
