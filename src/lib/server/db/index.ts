import { neon, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import { env } from '$lib/server/env';
import * as schema from './schema';

/** One-shot queries (HTTP transport) - used for the hot path, e.g. session validation on every request. */
export const db = drizzle(neon(env.DATABASE_URL), { schema });

/** Multi-statement writes needing atomicity (WebSocket transport, supports db.transaction()). */
export const dbTx = drizzleServerless(new Pool({ connectionString: env.DATABASE_URL }), { schema });
