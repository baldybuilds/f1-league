import { env } from '$lib/server/env';

interface SendEmailInput {
	to: string;
	subject: string;
	html: string;
}

function isAllowed(to: string): boolean {
	if (env.APP_ENV === 'production') return true;
	const allowlist = env.EMAIL_ALLOWLIST.split(',')
		.map((address) => address.trim().toLowerCase())
		.filter(Boolean);
	return allowlist.includes(to.toLowerCase());
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
	if (!isAllowed(to)) {
		// Not sent, per the non-production allow-list. Logged in full (not just
		// skipped) so local/dev testing can still grab the link - matches
		// PLAN.md's environment table: local email is "none sent (logged locally)".
		console.log(`[email not sent, not on allowlist] to=${to} subject=${subject}\n${html}`);
		return;
	}

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ from: env.RESEND_FROM_ADDRESS, to, subject, html })
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Resend request failed: ${response.status} ${body}`);
	}
}
