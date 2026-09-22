import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { consumeLoginToken } from '$lib/server/auth/login';
import { createSession, sessionCookieName } from '$lib/server/auth/session';
import { redeemInviteStandalone } from '$lib/server/invites';

export const actions: Actions = {
	default: async ({ params, cookies, url }) => {
		const result = await consumeLoginToken(params.token);

		if (!result) {
			redirect(303, '/login?expired=1');
		}

		const { user, isNewUser, inviteId } = result;

		const sessionToken = await createSession(user.id);
		const secure = url.protocol === 'https:';

		cookies.set(sessionCookieName(secure), sessionToken, {
			path: '/',
			httpOnly: true,
			secure,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});

		if (isNewUser) {
			redirect(303, inviteId ? `/onboarding?invite=${inviteId}` : '/onboarding');
		}

		if (inviteId) {
			// Returning user redeeming an invite for a league they aren't in yet -
			// they're already onboarded, so no onboarding stop is needed.
			await redeemInviteStandalone(inviteId, user.id);
		}

		redirect(303, '/');
	}
};
