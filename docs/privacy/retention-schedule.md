# Retention schedule

**Draft - proposed, to be confirmed by a UK data-protection professional before launch beyond the friend group.**

| Data                                   | Kept                                                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Login tokens (`login_tokens`)          | Deleted 24h after expiry                                                                                  |
| Auth sessions (`auth_sessions`)        | Deleted at expiry or sign-out                                                                             |
| Rate-limit counters (`rate_limits`)    | 24 hours                                                                                                  |
| Audit log (`audit_log`)                | 12 months                                                                                                 |
| Error events (Sentry, once configured) | 30 days, user ID only, no email                                                                           |
| Account and history                    | While the account is active                                                                               |
| Inactive accounts                      | After 36 months with no sign-in and no season participation: email warning, then anonymised 30 days later |
| Provider email logs (Resend)           | Per provider setting - to be recorded here once confirmed                                                 |

## Not yet automated

None of the deletion/anonymisation jobs above are implemented yet - this schedule states the _policy_, not current behavior. Specifically outstanding:

- A scheduled job to delete expired login tokens, sessions and rate-limit counters.
- The 36-month inactivity warning + anonymisation flow.
- Confirming Resend's own log-retention setting and recording it here.

## Backups

Erased data stays "beyond use" until backups roll off on schedule, per the ICO's erasure guidance. The rolling window depends on Neon's backup retention setting - to confirm and state explicitly in the privacy notice once decided.
