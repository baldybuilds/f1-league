import { and, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { authSessions, users } from '$lib/server/db/schema';
import { generateToken, hashToken } from './tokens';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function sessionCookieName(secure: boolean): string {
	return secure ? '__Host-session' : 'session';
}

export async function createSession(userId: string): Promise<string> {
	const { token, hash } = generateToken();
	await db.insert(authSessions).values({
		userId,
		sessionHash: hash,
		expiresAt: new Date(Date.now() + SESSION_TTL_MS)
	});
	return token;
}

export async function validateSession(rawToken: string) {
	const hash = hashToken(rawToken);
	const now = new Date();

	const [row] = await db
		.select({ user: users, sessionId: authSessions.id, expiresAt: authSessions.expiresAt })
		.from(authSessions)
		.innerJoin(users, eq(authSessions.userId, users.id))
		.where(and(eq(authSessions.sessionHash, hash), isNull(authSessions.revokedAt)));

	if (!row || row.expiresAt < now || row.user.anonymisedAt !== null) return null;

	await db.update(authSessions).set({ lastSeenAt: now }).where(eq(authSessions.id, row.sessionId));

	return row.user;
}

export async function revokeSession(rawToken: string): Promise<void> {
	const hash = hashToken(rawToken);
	await db
		.update(authSessions)
		.set({ revokedAt: new Date() })
		.where(eq(authSessions.sessionHash, hash));
}
