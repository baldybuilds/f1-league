# Lightweight DPIA

**Draft - pending professional review.** A full statutory DPIA may be required before any public launch; this lightweight version is the working assessment for the friend-group phase, following the ICO's "when do we need to do a DPIA" screening questions.

## Nature, scope, context and purpose

- **Nature:** a small web app collecting accounts, profiles and game picks for a private F1 predictions league among friends, built on Netlify + Neon Postgres.
- **Scope:** currently one private league, invite-only, no public sign-up. Multi-league from day one architecturally, but no open registration.
- **Context:** players are friends of the operator who chose to join via a direct invite link. Nobody is compelled to participate, and there's no commercial relationship.
- **Purpose:** run a low-effort, season-long prediction game with real stakes among people who already know each other.

## Necessity and proportionality

Every field collected (see `record-of-processing.md`) is used directly to run the game (identify the player, contact them, personalize the experience, score their picks) or to secure the account (sessions, rate limiting). No field is collected "just in case."

## Risks identified

| Risk                                                                                                                                    | Likelihood/impact                                                                          | Mitigation                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The service is "likely to be accessed by children" under the ICO's Children's code, even though not aimed at them                       | Assessment not yet done - flagged as required before any public launch                     | 18+ checkbox at onboarding; no public profiles, no photos, no player-to-player free text, display names visible only to league co-members                             |
| Small-league re-identification: "anonymise" erasure leaves picks/results in place, so a small group could guess who "Former player" was | Real but acknowledged - the ICO's test still classes this as pseudonymised, not anonymised | The confirmation screen for anonymise-mode erasure says so explicitly; "erase everything" mode is offered as the stronger alternative                                 |
| Credential/session compromise exposing accounts                                                                                         | Standard web-app risk                                                                      | Hashed magic-link tokens and session IDs (never stored in plaintext), `__Host-`/`Secure`/`HttpOnly` cookies, rate limiting on login, 15-minute single-use magic links |
| Data breach at a third-party processor                                                                                                  | Depends on the vendor                                                                      | See `vendor-register.md`; 2FA required on every vendor account; `breach-runbook.md` covers the response process                                                       |
| Over-collection creeping in as features are added                                                                                       | Ongoing                                                                                    | `personal-data-map.ts` + its CI check (`scripts/check-personal-data-map.ts`) fails the build if a new database column isn't explicitly classified                     |

## Consultation

No external consultation has taken place yet. Required before any launch beyond the friend group: a UK data-protection professional review of this DPIA, the privacy notice, and the retention schedule.

## Outcome

Proceed with the friend-group phase as currently scoped. Do not expand to public sign-up, and do not enable the pot ledger for anything beyond invite-only private leagues, until the Children's code assessment and professional review above are complete.
