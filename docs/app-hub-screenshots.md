# App Hub Screenshots

Recommended screenshots for a DHIS2 App Hub submission.

## 1. First screen / Intake

State: freshly opened app at 1280x800.

Show:

- App title: RaDE: Rabies Exposure Decision Support.
- Subtitle: Rabies exposure decision support for DHIS2 Tracker.
- Concise demo decision-support caveat.
- Evidence and scope panel collapsed.
- Intake tab selected.

Purpose: shows the app is polished, DHIS2 App Platform compatible, and understandable within a few seconds.

## 2. Sample intake with live decision support

State: click Load sample on the Intake tab.

Show:

- A populated intake section.
- Right-rail Decision support status pill and summary.
- Missing fields, risk signals, and suggested next actions.
- Derived fields and context collapsed unless the screenshot needs to demonstrate auditability.

Purpose: demonstrates deterministic decision support without exposing raw JSON.

## 3. Demo Output

State: after Load sample and Validate / Run Demo.

Show:

- Decision result summary.
- Rationale.
- Recommended actions or task suggestions.
- Tracker payload readiness warning.
- Raw JSON sections collapsed.

Purpose: shows reviewer-facing output and production guardrails.

## 4. Metadata Readiness

State: Metadata Readiness tab with default/placeholder mapping state, or pasted scaffold mapping.

Show:

- Readiness status pill.
- Placeholder IDs found.
- Required mapping categories.
- Next steps.

Purpose: shows why production use is blocked until local DHIS2 metadata is mapped.

## 5. Evidence and scope expanded

State: first screen or Notes tab with Evidence and scope expanded.

Show:

- WHO SEARO citation.
- UKHSA terrestrial mammal country-risk overlay citation.
- Scope note separating WHO decision basis, UKHSA overlay, and bat lyssavirus context.

Purpose: shows source transparency without letting citations dominate the default UI.
