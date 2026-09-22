import { env as privateEnv } from '$env/dynamic/private';
import * as v from 'valibot';

const EnvSchema = v.object({
	APP_ENV: v.picklist(['development', 'production'])
});

const result = v.safeParse(EnvSchema, {
	APP_ENV: privateEnv.APP_ENV
});

if (!result.success) {
	throw new Error(`Invalid environment configuration: ${JSON.stringify(result.issues)}`);
}

export const env = result.output;
