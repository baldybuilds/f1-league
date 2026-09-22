# Access request runbook

**Draft - pending professional review.** Covers subject access requests (SARs), portability requests, and rectification requests. Deadline: one calendar month from a valid request, per UK GDPR (the DUAA allows "reasonable and proportionate" searches when locating the data).

## Current status

**Self-serve export is not built yet.** Until it exists, every request below is handled manually by the operator. This runbook describes the target process; the manual fallback is noted at each step.

## 1. Receiving a request

A request can arrive by any reasonable means (email, Discord DM, etc.) - there's no required format under UK GDPR. Log the request's date and channel.

## 2. Identity verification

Since players sign in via email magic link, receiving the request from the email address on file (or a Discord account already linked to it) is sufficient verification for a low-risk hobby app. If a request arrives through an unverified channel, ask the requester to confirm via their registered email before proceeding.

## 3. Fulfilling the request

- **Access / portability:** target is a self-serve JSON+CSV export, generated on demand and not stored server-side (per `documentation/PLAN.md`). **Not built yet** - until it is, manually query the database for every table listed in `record-of-processing.md` filtered to that user's ID, using `src/lib/server/db/personal-data-map.ts` to confirm nothing personal is missed, and provide the result directly.
- **Rectification:** profile edits should be self-serve once a profile-editing UI exists. Until then, update the `users` row directly and note the change (who, when, what) somewhere durable - this audit trail itself should eventually go through `audit_log`.
- **Erasure:** see `documentation/PLAN.md`'s two modes (anonymise / erase everything) - **neither is built yet**. Until they are, erasure must be done manually and carefully: anonymise mode clears `users.display_name`/`email`/profile fields and any Discord link while leaving picks/results in place; erase-everything mode additionally deletes picks/answers/scores and recomputes any derived tables. Log every manual erasure in `audit_log` as a system action.

## 4. Deadline tracking

Note the one-month deadline the day the request is logged. If a request is complex, UK GDPR allows extending by up to two further months - if that happens, tell the requester within the first month, with reasons.

## 5. Refusing a request

Only refuse (or charge a fee) if the request is manifestly unfounded or excessive - document the reasoning if this ever happens. For a friend-group app this should be rare to never.

## 6. Objection, restriction and complaints

Provide a contact address for objections and complaints (to be added to `privacy-notice-draft.md` once decided). The DUAA's complaints-handling requirement (in force from 19 June 2026, per secondary sources - verify against the ICO's own DUAA pages before relying on this date) means complaints must be acknowledged and handled, not just received.
