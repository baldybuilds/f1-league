// Alias-free (no $lib/$env) so this module can be imported both by the
// SvelteKit app and by netlify/functions/sync-results.mts, which is built
// standalone by Netlify (esbuild), outside SvelteKit's Vite pipeline where
// $lib/$env aliases don't resolve. See scripts/seed-reference-data.ts for
// the same constraint.

const TOKEN_URL = 'https://api.openf1.org/token';
const API_BASE = 'https://api.openf1.org/v1';

interface CachedToken {
	accessToken: string;
	expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export interface OpenF1SessionResultRow {
	position: number | null;
	driver_number: number;
	dnf: boolean;
	dns: boolean;
	dsq: boolean;
}

export interface OpenF1DriverRow {
	driver_number: number;
	name_acronym: string;
}

/** Fetches a bearer token, cached in memory for its ~1h lifetime (confirmed
 * live 2026-09-23: 3600s, no refresh token). Reads credentials directly from
 * process.env - see the alias-free note above. */
export async function getAccessToken(): Promise<string> {
	if (cachedToken && cachedToken.expiresAt > Date.now()) {
		return cachedToken.accessToken;
	}

	const username = process.env.OPENF1_USERNAME;
	const password = process.env.OPENF1_PASSWORD;
	if (!username || !password) {
		throw new Error('OPENF1_USERNAME and OPENF1_PASSWORD are required.');
	}

	const body = new URLSearchParams({ username, password, grant_type: 'password' });
	const response = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});
	if (!response.ok) {
		throw new Error(`OpenF1 auth failed: ${response.status} ${await response.text()}`);
	}

	const json = (await response.json()) as { access_token: string; expires_in: number };
	cachedToken = {
		accessToken: json.access_token,
		expiresAt: Date.now() + json.expires_in * 1000 - 30_000 // refresh 30s early
	};
	return cachedToken.accessToken;
}

export async function fetchSessionResult(
	sessionKey: number,
	token: string
): Promise<OpenF1SessionResultRow[]> {
	const response = await fetch(`${API_BASE}/session_result?session_key=${sessionKey}`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!response.ok) {
		throw new Error(`OpenF1 session_result failed: ${response.status}`);
	}
	return response.json();
}

export async function fetchSessionDrivers(
	sessionKey: number,
	token: string
): Promise<OpenF1DriverRow[]> {
	const response = await fetch(`${API_BASE}/drivers?session_key=${sessionKey}`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!response.ok) {
		throw new Error(`OpenF1 drivers failed: ${response.status}`);
	}
	return response.json();
}

export interface TopThreeCodes {
	p1Code: string;
	p2Code: string;
	p3Code: string;
}

/** Pure - no I/O. `session_result.position` is null for dnf/dns/dsq entries
 * (confirmed live 2026-09-23), so top 3 must filter on position, not just
 * take the first 3 rows. Returns null if fewer than 3 positions are
 * classified yet (e.g. the race is still live). */
export function topThreeFromSessionResult(
	resultRows: OpenF1SessionResultRow[],
	driverRows: OpenF1DriverRow[]
): TopThreeCodes | null {
	const numberToCode = new Map(driverRows.map((d) => [d.driver_number, d.name_acronym]));

	const byPosition = new Map<number, number>(); // position -> driver_number
	for (const row of resultRows) {
		if (row.position !== null) byPosition.set(row.position, row.driver_number);
	}

	if (!byPosition.has(1) || !byPosition.has(2) || !byPosition.has(3)) return null;

	const p1Code = numberToCode.get(byPosition.get(1)!);
	const p2Code = numberToCode.get(byPosition.get(2)!);
	const p3Code = numberToCode.get(byPosition.get(3)!);
	if (!p1Code || !p2Code || !p3Code) return null;

	return { p1Code, p2Code, p3Code };
}
