// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { InferSelectModel } from 'drizzle-orm';
import type { users } from '$lib/server/db/schema';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: InferSelectModel<typeof users> | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
