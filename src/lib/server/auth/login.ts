import { and, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { loginTokens, users } from '$lib/server/db/schema';
import { sendEmail } from '$lib/server/email/resend';
import { generateToken, hashToken } from './tokens';

const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

/** Always creates a token and sends an email, regardless of whether the address
 * belongs to an existing user - that's what keeps the caller's response identical
 * for known and unknown addresses. `inviteId` binds the token to an invite for
 * first-time sign-ups (PLAN.md: no open sign-up - a new account needs one). */
export async function createLoginToken(
	email: string,
	confirmUrl: (token: string) => string,
	inviteId?: string
): Promise<void> {
	const { token, hash } = generateToken();

	await db.insert(loginTokens).values({
		email,
		tokenHash: hash,
		inviteId,
		expiresAt: new Date(Date.now() + LOGIN_TOKEN_TTL_MS)
	});

	await sendEmail({
		to: email,
		subject: 'Sign in to F1 Predictions League',
		html: `<p>Click the link below to finish signing in. This link expires in 15 minutes.</p><p><a href="${confirmUrl(token)}">Sign in</a></p>`
	});
}

export interface ConsumeLoginTokenResult {
	user: typeof users.$inferSelect;
	isNewUser: boolean;
	inviteId: string | null;
}

/** Validates and consumes a login token. Rejects sign-up for a brand-new email
 * with no invite attached (no open sign-up). A new user gets a minimal row
 * (age_confirmed_at left null, i.e. not onboarded yet) - the onboarding route
 * fills in the rest. */
export async function consumeLoginToken(rawToken: string): Promise<ConsumeLoginTokenResult | null> {
	const hash = hashToken(rawToken);
	const now = new Date();

	const [record] = await db
		.select()
		.from(loginTokens)
		.where(and(eq(loginTokens.tokenHash, hash), isNull(loginTokens.consumedAt)));

	if (!record || record.expiresAt < now) return null;

	await db.update(loginTokens).set({ consumedAt: now }).where(eq(loginTokens.id, record.id));

	const [existingUser] = await db.select().from(users).where(eq(users.email, record.email));
	if (existingUser) {
		return { user: existingUser, isNewUser: false, inviteId: record.inviteId };
	}

	if (!record.inviteId) return null;

	const [newUser] = await db
		.insert(users)
		.values({
			displayName: record.email.split('@')[0],
			email: record.email,
			avatarColour: '#6b7280',
			timezone: 'UTC'
		})
		.returning();

	return { user: newUser, isNewUser: true, inviteId: record.inviteId };
}
