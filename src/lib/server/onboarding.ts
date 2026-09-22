export const AVATAR_COLOURS = [
	'#6b7280',
	'#ef4444',
	'#f59e0b',
	'#10b981',
	'#3b82f6',
	'#8b5cf6',
	'#ec4899'
];

export const REMINDER_PREFERENCES = ['email', 'discord', 'both', 'none'] as const;

export const POLICY_VERSION = 'v0-draft';

const RESERVED_DISPLAY_NAMES = new Set([
	'admin',
	'administrator',
	'moderator',
	'mod',
	'system',
	'support',
	'staff',
	'owner'
]);

export function validateDisplayName(name: string): string | null {
	if (name.length < 2 || name.length > 30) {
		return 'Display name must be 2-30 characters.';
	}
	if (RESERVED_DISPLAY_NAMES.has(name.trim().toLowerCase())) {
		return 'That display name is reserved.';
	}
	return null;
}
