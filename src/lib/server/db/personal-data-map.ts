export type DataClassification = 'personal' | 'non-personal';

/**
 * Every column in schema.ts must have an entry here (enforced by
 * scripts/check-personal-data-map.ts). Drives the export/erasure jobs later,
 * per documentation/PLAN.md's "Personal-data map as code".
 */
export const personalDataMap: Record<string, DataClassification> = {
	'users.id': 'non-personal',
	'users.display_name': 'personal',
	'users.email': 'personal',
	'users.avatar_colour': 'personal',
	'users.timezone': 'personal',
	'users.favourite_driver': 'personal',
	'users.favourite_team': 'personal',
	'users.reminder_preference': 'personal',
	'users.age_confirmed_at': 'personal',
	'users.anonymised_at': 'non-personal',
	'users.created_at': 'non-personal',
	'users.updated_at': 'non-personal',

	'policy_acceptances.id': 'non-personal',
	'policy_acceptances.user_id': 'non-personal',
	'policy_acceptances.document': 'non-personal',
	'policy_acceptances.version': 'non-personal',
	'policy_acceptances.accepted_at': 'personal',

	'auth_sessions.id': 'non-personal',
	'auth_sessions.user_id': 'non-personal',
	'auth_sessions.session_hash': 'non-personal',
	'auth_sessions.created_at': 'non-personal',
	'auth_sessions.expires_at': 'non-personal',
	'auth_sessions.revoked_at': 'non-personal',
	'auth_sessions.last_seen_at': 'non-personal',

	'login_tokens.id': 'non-personal',
	'login_tokens.email': 'personal',
	'login_tokens.token_hash': 'non-personal',
	'login_tokens.invite_id': 'non-personal',
	'login_tokens.expires_at': 'non-personal',
	'login_tokens.consumed_at': 'non-personal',
	'login_tokens.created_at': 'non-personal',

	// Keys must be hashed, never a raw IP or email — see PLAN.md "IPs exist
	// only as short-lived hashed rate-limit keys".
	'rate_limits.id': 'non-personal',
	'rate_limits.key': 'non-personal',
	'rate_limits.count': 'non-personal',
	'rate_limits.expires_at': 'non-personal',

	'leagues.id': 'non-personal',
	'leagues.name': 'non-personal',
	'leagues.owner_id': 'non-personal',
	'leagues.created_at': 'non-personal',

	'league_seasons.id': 'non-personal',
	'league_seasons.league_id': 'non-personal',
	'league_seasons.year': 'non-personal',
	'league_seasons.status': 'non-personal',
	'league_seasons.settings': 'non-personal',
	'league_seasons.scoring_rules_version': 'non-personal',
	'league_seasons.created_at': 'non-personal',
	'league_seasons.updated_at': 'non-personal',

	'memberships.id': 'non-personal',
	'memberships.league_id': 'non-personal',
	'memberships.user_id': 'non-personal',
	'memberships.role': 'non-personal',
	'memberships.status': 'non-personal',
	'memberships.created_at': 'non-personal',
	'memberships.updated_at': 'non-personal',

	'season_entries.id': 'non-personal',
	'season_entries.league_season_id': 'non-personal',
	'season_entries.user_id': 'non-personal',
	'season_entries.joined_at': 'non-personal',

	'invites.id': 'non-personal',
	'invites.league_id': 'non-personal',
	'invites.token_hash': 'non-personal',
	'invites.expires_at': 'non-personal',
	'invites.max_uses': 'non-personal',
	'invites.uses': 'non-personal',
	'invites.revoked_at': 'non-personal',
	'invites.approval_required': 'non-personal',
	'invites.created_at': 'non-personal',

	'drivers.id': 'non-personal',
	'drivers.code': 'non-personal',
	'drivers.name': 'non-personal',
	'drivers.team': 'non-personal',
	'drivers.number': 'non-personal',
	'drivers.active': 'non-personal',
	'drivers.created_at': 'non-personal',

	'rounds.id': 'non-personal',
	'rounds.year': 'non-personal',
	'rounds.round_number': 'non-personal',
	'rounds.name': 'non-personal',
	'rounds.lock_at': 'non-personal',
	'rounds.status': 'non-personal',
	'rounds.result_p1_id': 'non-personal',
	'rounds.result_p2_id': 'non-personal',
	'rounds.result_p3_id': 'non-personal',
	'rounds.result_entered_at': 'non-personal',
	'rounds.result_entered_by': 'non-personal',
	'rounds.openf1_session_key': 'non-personal',
	'rounds.created_at': 'non-personal',

	// A player's pick is their prediction, not a fact about them, but it's
	// tied to their account - treat it as personal per PLAN.md's "what we
	// hold" list ("picks, answers, scores").
	'picks.id': 'non-personal',
	'picks.league_season_id': 'non-personal',
	'picks.user_id': 'non-personal',
	'picks.round_id': 'non-personal',
	'picks.p1_driver_id': 'personal',
	'picks.p2_driver_id': 'personal',
	'picks.p3_driver_id': 'personal',
	'picks.submitted_at': 'personal',
	'picks.updated_at': 'personal',

	'score_events.id': 'non-personal',
	'score_events.league_season_id': 'non-personal',
	'score_events.user_id': 'non-personal',
	'score_events.round_id': 'non-personal',
	'score_events.points': 'personal',
	'score_events.breakdown': 'personal',
	'score_events.created_at': 'non-personal',

	// metadata must never have raw PII written into it - enforced by review,
	// not by this map, since its shape varies per audit action.
	'audit_log.id': 'non-personal',
	'audit_log.actor_user_id': 'non-personal',
	'audit_log.action': 'non-personal',
	'audit_log.target_type': 'non-personal',
	'audit_log.target_id': 'non-personal',
	'audit_log.metadata': 'non-personal',
	'audit_log.created_at': 'non-personal'
};
