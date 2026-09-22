# Record of processing activities

**Draft - pending professional review.** Controller: the app's operator (a private individual running this for a friend group at the time of writing; formalize this line if that changes).

## What we hold

Display name, email, timezone, avatar colour, optional favourite driver and team, reminder preference, picks, answers, scores, league memberships, the Discord user ID (only once linked), policy-acceptance records, and the 18+ confirmation timestamp.

We do **not** collect date of birth, location, photos, payment details, or free-text messages between players. IPs exist only as short-lived hashed rate-limit keys (`rate_limits.key` - see `src/lib/server/db/personal-data-map.ts`, which classifies every column as personal or non-personal and is enforced in CI).

## Processing activities and lawful bases

| Processing                                                                  | Data involved                                     | Lawful basis                                                                                                            |
| --------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Account creation, profile, picks, league play, magic-link and result emails | Display name, email, profile fields, picks/scores | Contract - needed to provide the game                                                                                   |
| Pick reminders (email, Discord)                                             | Email, Discord ID, reminder preference            | Service message, not marketing. On by default with one-click opt-out; content strictly service-only, never promotional. |
| Rate limiting, abuse and security logs                                      | Hashed IP/email keys only                         | Legitimate interests (written assessment still to be completed)                                                         |
| Discord linking                                                             | Discord user ID                                   | User-initiated (the player chooses to link)                                                                             |
| Product news or promotions                                                  | N/A                                               | Not currently processed. If ever added, requires a separate opt-in, default off, per PECR.                              |

## Recipients

Netlify (hosting), Neon (database), Resend (transactional email), Sentry (error tracking, once configured) - see `vendor-register.md` for the full processor list, region, and transfer mechanism per vendor. No personal data is shared with OpenF1 (public F1 reference data only, queried one-way).

## Retention

See `retention-schedule.md`.

## Data subject rights

See `access-request-runbook.md` for the request-handling process. In brief: self-serve export (once built), profile edits at any time, and two erasure modes (anonymise by default, or erase everything including picks/scores) - see `documentation/PLAN.md`'s "Rights" section for the full design.
