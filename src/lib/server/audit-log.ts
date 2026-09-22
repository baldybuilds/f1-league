import { dbTx } from './db';
import { auditLog } from './db/schema';

type Transaction = Parameters<Parameters<typeof dbTx.transaction>[0]>[0];

interface RecordAuditEventInput {
	actorUserId?: string | null;
	action: string;
	targetType: string;
	targetId?: string | null;
	metadata?: Record<string, unknown>;
}

/** Records an audit event as part of an existing transaction, so a change and
 * its record either both land or both roll back. */
export async function recordAuditEvent(tx: Transaction, input: RecordAuditEventInput) {
	await tx.insert(auditLog).values({
		actorUserId: input.actorUserId ?? null,
		action: input.action,
		targetType: input.targetType,
		targetId: input.targetId ?? null,
		metadata: input.metadata ?? {}
	});
}
