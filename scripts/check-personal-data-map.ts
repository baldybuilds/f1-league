import { getTableColumns, getTableName, is } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import * as schema from '../src/lib/server/db/schema.ts';
import { personalDataMap } from '../src/lib/server/db/personal-data-map.ts';

const missing: string[] = [];

for (const exported of Object.values(schema)) {
	if (!is(exported, PgTable)) continue;

	const tableName = getTableName(exported);
	const columns = getTableColumns(exported);

	for (const column of Object.values(columns)) {
		const key = `${tableName}.${column.name}`;
		if (!(key in personalDataMap)) {
			missing.push(key);
		}
	}
}

if (missing.length > 0) {
	console.error('Unclassified columns in personal-data-map.ts:');
	for (const key of missing) {
		console.error(`  - ${key}`);
	}
	process.exit(1);
}

console.log(`All columns classified (${Object.keys(personalDataMap).length} entries).`);
