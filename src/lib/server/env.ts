import * as v from 'valibot';

const EnvSchema = v.object({
	APP_ENV: v.picklist(['development', 'production'])
});

const result = v.safeParse(EnvSchema, {
	APP_ENV: process.env.APP_ENV
});

if (!result.success) {
	throw new Error(`Invalid environment configuration: ${JSON.stringify(result.issues)}`);
}

export const env = result.output;
