# Privacy and data-protection governance documents

**Status: draft.** Everything in this folder is a working draft written against the ICO's published guidance, not legal advice. A UK data-protection professional must review the privacy notice, terms, and retention schedule before the app launches beyond the private friend group it's built for. Where a decision is still open, the document says so rather than presenting it as settled.

These documents formalize the "Data protection (UK GDPR)" section of `documentation/PLAN.md` (the fuller design rationale lives there) into the standalone artifacts a real launch needs.

## Contents

- [`record-of-processing.md`](./record-of-processing.md) - what personal data is held, why, and under what lawful basis.
- [`dpia-lite.md`](./dpia-lite.md) - a lightweight data protection impact assessment: risks identified and the mitigations already built.
- [`vendor-register.md`](./vendor-register.md) - every processor handling personal data, with purpose, region, and transfer mechanism.
- [`retention-schedule.md`](./retention-schedule.md) - how long each category of data is kept and why.
- [`access-request-runbook.md`](./access-request-runbook.md) - handling a subject access or portability request.
- [`breach-runbook.md`](./breach-runbook.md) - handling a suspected data breach.
- [`privacy-notice-draft.md`](./privacy-notice-draft.md) and [`terms-draft.md`](./terms-draft.md) - the player-facing draft text shown at onboarding, versioned to match `policy_acceptances.version` in the database (currently `v0-draft`).

## Before any launch beyond the friend group

- [ ] External UK data-protection professional has reviewed every document in this folder.
- [ ] ICO fee self-assessment run (see `documentation/PLAN.md`'s assumptions).
- [ ] Children's code assessment completed.
- [ ] Each vendor's UK-to-US transfer mechanism confirmed and recorded in the vendor register.
- [ ] Self-serve export and both erasure modes actually built and tested (see `access-request-runbook.md` - they're referenced there as not yet implemented).
