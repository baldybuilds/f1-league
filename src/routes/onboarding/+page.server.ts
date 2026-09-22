import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dbTx } from '$lib/server/db';
import { users, policyAcceptances } from '$lib/server/db/schema';
import {
	AVATAR_COLOURS,
	POLICY_VERSION,
	REMINDER_PREFERENCES,
	validateDisplayName
} from '$lib/server/onboarding';
import { redeemInvite } from '$lib/server/invites';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(303, '/login');
	if (locals.user.ageConfirmedAt) redirect(303, '/');

	return {
		inviteId: url.searchParams.get('invite'),
		avatarColours: AVATAR_COLOURS,
		reminderPreferences: REMINDER_PREFERENCES,
		timezones: Intl.supportedValuesOf('timeZone')
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		if (!locals.user) redirect(303, '/login');

		const formData = await request.formData();
		const displayName = String(formData.get('displayName') ?? '').trim();
		const avatarColour = String(formData.get('avatarColour') ?? '');
		const timezone = String(formData.get('timezone') ?? '');
		const reminderPreference = String(formData.get('reminderPreference') ?? '');
		const ageConfirmed = formData.get('ageConfirmed') === 'on';
		const termsAccepted = formData.get('termsAccepted') === 'on';
		const privacyAccepted = formData.get('privacyAccepted') === 'on';
		const inviteId = url.searchParams.get('invite');

		const displayNameError = validateDisplayName(displayName);
		if (displayNameError) return fail(400, { error: displayNameError });

		if (!AVATAR_COLOURS.includes(avatarColour)) {
			return fail(400, { error: 'Choose a valid avatar colour.' });
		}
		if (!timezone) {
			return fail(400, { error: 'Choose a timezone.' });
		}
		if (
			!REMINDER_PREFERENCES.includes(reminderPreference as (typeof REMINDER_PREFERENCES)[number])
		) {
			return fail(400, { error: 'Choose a valid reminder preference.' });
		}
		if (!ageConfirmed) {
			return fail(400, { error: 'You must confirm you are 18 or over.' });
		}
		if (!termsAccepted || !privacyAccepted) {
			return fail(400, { error: 'You must accept the terms and privacy notice.' });
		}

		const userId = locals.user.id;
		const now = new Date();

		await dbTx.transaction(async (tx) => {
			await tx
				.update(users)
				.set({
					displayName,
					avatarColour,
					timezone,
					reminderPreference: reminderPreference as (typeof REMINDER_PREFERENCES)[number],
					ageConfirmedAt: now,
					updatedAt: now
				})
				.where(eq(users.id, userId));

			await tx.insert(policyAcceptances).values([
				{ userId, document: 'terms', version: POLICY_VERSION, acceptedAt: now },
				{ userId, document: 'privacy', version: POLICY_VERSION, acceptedAt: now }
			]);

			if (inviteId) {
				await redeemInvite(tx, inviteId, userId);
			}
		});

		redirect(303, '/');
	}
};
