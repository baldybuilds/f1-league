import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';
import type { ScoreBreakdown } from '../scoring';

export const reminderPreferenceEnum = pgEnum('reminder_preference', [
	'email',
	'discord',
	'both',
	'none'
]);
export const leagueSeasonStatusEnum = pgEnum('league_season_status', [
	'setup',
	'open',
	'active',
	'archived'
]);
export const membershipRoleEnum = pgEnum('membership_role', ['owner', 'admin', 'member']);
export const membershipStatusEnum = pgEnum('membership_status', ['pending', 'active', 'removed']);
export const roundStatusEnum = pgEnum('round_status', ['upcoming', 'locked', 'completed']);

export const users = pgTable(
	'users',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		displayName: text('display_name').notNull(),
		email: text('email').notNull(),
		avatarColour: text('avatar_colour').notNull(),
		timezone: text('timezone').notNull(),
		favouriteDriver: text('favourite_driver'),
		favouriteTeam: text('favourite_team'),
		reminderPreference: reminderPreferenceEnum('reminder_preference').notNull().default('email'),
		ageConfirmedAt: timestamp('age_confirmed_at', { withTimezone: true }),
		anonymisedAt: timestamp('anonymised_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('users_email_key').on(table.email)]
);

export const policyAcceptances = pgTable('policy_acceptances', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	document: text('document').notNull(),
	version: text('version').notNull(),
	acceptedAt: timestamp('accepted_at', { withTimezone: true }).notNull().defaultNow()
});

export const authSessions = pgTable(
	'auth_sessions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		sessionHash: text('session_hash').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		revokedAt: timestamp('revoked_at', { withTimezone: true }),
		lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('auth_sessions_session_hash_key').on(table.sessionHash)]
);

export const invites = pgTable(
	'invites',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		leagueId: uuid('league_id')
			.notNull()
			.references(() => leagues.id),
		tokenHash: text('token_hash').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		maxUses: integer('max_uses').notNull().default(1),
		uses: integer('uses').notNull().default(0),
		revokedAt: timestamp('revoked_at', { withTimezone: true }),
		approvalRequired: boolean('approval_required').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('invites_token_hash_key').on(table.tokenHash)]
);

export const loginTokens = pgTable(
	'login_tokens',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		email: text('email').notNull(),
		tokenHash: text('token_hash').notNull(),
		inviteId: uuid('invite_id').references(() => invites.id),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		consumedAt: timestamp('consumed_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('login_tokens_token_hash_key').on(table.tokenHash)]
);

export const rateLimits = pgTable(
	'rate_limits',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		key: text('key').notNull(),
		count: integer('count').notNull().default(1),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
	},
	(table) => [uniqueIndex('rate_limits_key_key').on(table.key)]
);

export const leagues = pgTable('leagues', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	ownerId: uuid('owner_id')
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const leagueSeasons = pgTable('league_seasons', {
	id: uuid('id').primaryKey().defaultRandom(),
	leagueId: uuid('league_id')
		.notNull()
		.references(() => leagues.id),
	year: integer('year').notNull(),
	status: leagueSeasonStatusEnum('status').notNull().default('setup'),
	settings: jsonb('settings').notNull().default({}),
	scoringRulesVersion: text('scoring_rules_version').notNull(),
	wdcWinnerDriverId: uuid('wdc_winner_driver_id').references(() => drivers.id),
	wccWinnerTeam: text('wcc_winner_team'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const memberships = pgTable(
	'memberships',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		leagueId: uuid('league_id')
			.notNull()
			.references(() => leagues.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		role: membershipRoleEnum('role').notNull().default('member'),
		status: membershipStatusEnum('status').notNull().default('pending'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('memberships_league_id_user_id_key').on(table.leagueId, table.userId)]
);

export const seasonEntries = pgTable(
	'season_entries',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		leagueSeasonId: uuid('league_season_id')
			.notNull()
			.references(() => leagueSeasons.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('season_entries_league_season_id_user_id_key').on(
			table.leagueSeasonId,
			table.userId
		)
	]
);

export const drivers = pgTable(
	'drivers',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		code: text('code').notNull(),
		name: text('name').notNull(),
		team: text('team').notNull(),
		teamColor: text('team_color'),
		number: integer('number'),
		active: boolean('active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('drivers_code_key').on(table.code)]
);

export const rounds = pgTable(
	'rounds',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		year: integer('year').notNull(),
		roundNumber: integer('round_number').notNull(),
		name: text('name').notNull(),
		lockAt: timestamp('lock_at', { withTimezone: true }).notNull(),
		status: roundStatusEnum('status').notNull().default('upcoming'),
		openf1SessionKey: integer('openf1_session_key'),
		resultP1Id: uuid('result_p1_id').references(() => drivers.id),
		resultP2Id: uuid('result_p2_id').references(() => drivers.id),
		resultP3Id: uuid('result_p3_id').references(() => drivers.id),
		resultEnteredAt: timestamp('result_entered_at', { withTimezone: true }),
		resultEnteredBy: uuid('result_entered_by').references(() => users.id),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('rounds_year_round_number_key').on(table.year, table.roundNumber)]
);

export const picks = pgTable(
	'picks',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		leagueSeasonId: uuid('league_season_id')
			.notNull()
			.references(() => leagueSeasons.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		roundId: uuid('round_id')
			.notNull()
			.references(() => rounds.id),
		p1DriverId: uuid('p1_driver_id')
			.notNull()
			.references(() => drivers.id),
		p2DriverId: uuid('p2_driver_id')
			.notNull()
			.references(() => drivers.id),
		p3DriverId: uuid('p3_driver_id')
			.notNull()
			.references(() => drivers.id),
		submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('picks_league_season_id_user_id_round_id_key').on(
			table.leagueSeasonId,
			table.userId,
			table.roundId
		)
	]
);

export const scoreEvents = pgTable(
	'score_events',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		leagueSeasonId: uuid('league_season_id')
			.notNull()
			.references(() => leagueSeasons.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		roundId: uuid('round_id')
			.notNull()
			.references(() => rounds.id),
		points: integer('points').notNull(),
		breakdown: jsonb('breakdown')
			.$type<ScoreBreakdown>()
			.notNull()
			.default({} as ScoreBreakdown),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('score_events_league_season_id_user_id_round_id_key').on(
			table.leagueSeasonId,
			table.userId,
			table.roundId
		)
	]
);

export const seasonPicks = pgTable(
	'season_picks',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		leagueSeasonId: uuid('league_season_id')
			.notNull()
			.references(() => leagueSeasons.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		wdcDriverId: uuid('wdc_driver_id')
			.notNull()
			.references(() => drivers.id),
		wccTeam: text('wcc_team').notNull(),
		submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('season_picks_league_season_id_user_id_key').on(table.leagueSeasonId, table.userId)
	]
);

export const seasonStandings = pgTable(
	'season_standings',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		leagueSeasonId: uuid('league_season_id')
			.notNull()
			.references(() => leagueSeasons.id),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		regularPoints: integer('regular_points').notNull(),
		wdcBonus: integer('wdc_bonus').notNull().default(0),
		wccBonus: integer('wcc_bonus').notNull().default(0),
		totalPoints: integer('total_points').notNull(),
		rank: integer('rank').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('season_standings_league_season_id_user_id_key').on(
			table.leagueSeasonId,
			table.userId
		)
	]
);

export const auditLog = pgTable('audit_log', {
	id: uuid('id').primaryKey().defaultRandom(),
	actorUserId: uuid('actor_user_id').references(() => users.id),
	action: text('action').notNull(),
	targetType: text('target_type').notNull(),
	targetId: uuid('target_id'),
	metadata: jsonb('metadata').notNull().default({}),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
