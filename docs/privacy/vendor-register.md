# Vendor / processor register

**Draft - pending professional review.** Transfer mechanisms marked "to confirm" are exactly that: PLAN.md's own assumptions list flags them as unchecked. Confirm each one (UK-US Data Bridge, IDTA, or UK Addendum, as applicable) before any real player data flows through a vendor.

| Vendor    | Purpose                                       | Personal data involved                                                                        | Region                                                        | Transfer mechanism                                                                   | DPA in place         |
| --------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------- |
| Netlify   | Hosting, build/deploy, env var storage        | None directly (app data lives in Neon); access logs may contain IPs                           | Global CDN, US company                                        | To confirm                                                                           | To confirm           |
| Neon      | Postgres database (all application data)      | Everything in `record-of-processing.md`                                                       | `aws-eu-central-1` (Frankfurt) - EU region already selected   | Data stored in the EU; to confirm transfer mechanism for any US-based support/access | To confirm           |
| Resend    | Transactional email (magic links, reminders)  | Email address, email content                                                                  | To confirm - EU region available, not yet explicitly selected | To confirm                                                                           | To confirm           |
| Sentry    | Error tracking                                | User ID only (per the retention schedule - no email in error events)                          | Not yet set up - EU region available                          | N/A until configured                                                                 | N/A until configured |
| Discord   | League chat integration (`/pick`, reminders)  | Discord user ID (only for players who link their account)                                     | Not yet integrated (Phase 4)                                  | To confirm                                                                           | To confirm           |
| Anthropic | Planned: AI recaps (post-launch feature)      | Not yet integrated - scope TBD, but player-supplied text would be treated as data per PLAN.md | Not yet integrated                                            | To confirm                                                                           | To confirm           |
| OpenF1    | Race data (results, schedules, session facts) | None - public F1 reference data only, queried one-way                                         | N/A                                                           | N/A - no personal data shared                                                        | N/A                  |

## Notes

- Prefer EU or UK regions where a vendor offers them, since Resend and Sentry both do.
- OpenF1's own terms (commercial use, redistribution) need confirming with the maintainer before any public sign-up - see `documentation/PLAN.md`'s "Legal, brand and licensing guardrails".
- This table should be re-verified whenever a new vendor is added (e.g. Discord in Phase 4, Anthropic if AI recaps ship) - don't let a new integration go live without a row here.
