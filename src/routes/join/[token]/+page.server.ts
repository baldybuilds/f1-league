import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getInviteDetails, redeemInviteStandalone } from '$lib/server/invites';
import { createLoginToken } from '$lib/server/auth/login';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = async ({ params, locals }) => {
	const invite = await getInviteDetails(params.token);
	if (!invite) error(404, 'This invite link is invalid, expired, revoked, or already used up.');

	if (locals.user && !locals.user.ageConfirmedAt) {
		redirect(303, `/onboarding?invite=${invite.inviteId}`);
	}

	return {
		leagueName: invite.leagueName,
		ownerDisplayName: invite.ownerDisplayName,
		signedIn: Boolean(locals.user)
	};
};

export const actions: Actions = {
	sendLink: async ({ request, params, url }) => {
		const invite = await getInviteDetails(params.token);
		if (!invite) error(404, 'This invite link is invalid, expired, revoked, or already used up.');

		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();

		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { error: 'Enter a valid email address.' });
		}

		await createLoginToken(
			email,
			(token) => `${url.origin}/login/confirm/${token}`,
			invite.inviteId
		);

		return { sent: true };
	},

	joinNow: async ({ params, locals }) => {
		if (!locals.user) redirect(303, `/join/${params.token}`);

		const invite = await getInviteDetails(params.token);
		if (!invite) error(404, 'This invite link is invalid, expired, revoked, or already used up.');

		await redeemInviteStandalone(invite.inviteId, locals.user.id);

		redirect(303, '/');
	}
};
