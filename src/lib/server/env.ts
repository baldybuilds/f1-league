import { env as privateEnv } from '$env/dynamic/private';
import * as v from 'valibot';

const EnvSchema = v.object({
	APP_ENV: v.picklist(['development', 'production']),
	DATABASE_URL: v.pipe(v.string(), v.nonEmpty()),
	RESEND_API_KEY: v.pipe(v.string(), v.nonEmpty()),
	RESEND_FROM_ADDRESS: v.optional(v.pipe(v.string(), v.nonEmpty()), 'onboarding@resend.dev'),
	EMAIL_ALLOWLIST: v.optional(v.string(), '')
});

const result = v.safeParse(EnvSchema, {
	APP_ENV: privateEnv.APP_ENV,
	DATABASE_URL: privateEnv.DATABASE_URL,
	RESEND_API_KEY: privateEnv.RESEND_API_KEY,
	RESEND_FROM_ADDRESS: privateEnv.RESEND_FROM_ADDRESS,
	EMAIL_ALLOWLIST: privateEnv.EMAIL_ALLOWLIST
});

if (!result.success) {
	throw new Error(`Invalid environment configuration: ${JSON.stringify(result.issues)}`);
}

export const env = result.output;
