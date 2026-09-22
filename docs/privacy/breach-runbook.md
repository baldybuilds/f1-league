# Breach runbook

**Draft - pending professional review.**

## What counts as a breach

Any incident leading to accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, personal data. Examples for this app: a leaked database credential, a compromised Netlify/Neon/Resend/Sentry account, a bug that exposes one player's picks or email to another before lock, or a lost/stolen device with an active session.

## 1. Assess

As soon as a suspected breach is identified:

- What data was involved? Cross-check against `record-of-processing.md`.
- How many people are affected?
- Is the exposure ongoing, or already contained?
- What's the likely risk to the affected people (embarrassment, financial risk, safety)? The pot ledger being note-only and the app never handling money limits the financial-risk surface, but email addresses and picks are still personal data.

## 2. Contain

- Rotate any compromised credentials immediately (see the key-rotation runbook referenced in `documentation/PLAN.md`'s "Security and production posture").
- Revoke affected sessions (`auth_sessions.revoked_at`) if account compromise is suspected.
- If a vendor account is compromised, follow that vendor's own incident process alongside this one.

## 3. Log

Record every incident in a breach log (to be created - a simple dated record is sufficient for this app's scale): what happened, when discovered, what data, how many people, containment actions taken, and the ICO/user-notification decision below.

## 4. Notify the ICO

If the breach poses a risk to people's rights and freedoms, report it to the ICO as soon as possible and, where feasible, within **72 hours** of becoming aware of it. If the 72-hour deadline can't be met, report anyway with the reasons for delay and follow up with more information once available.

## 5. Notify affected people

If the breach is likely to result in a **high risk** to people, tell them directly and without undue delay - what happened, what data, and what they can do (e.g. sign out everywhere, watch for phishing).

## 6. Review

After any breach: update this runbook, the key-rotation process, or the relevant code with whatever would have prevented it, and note the fix in the breach log entry.
