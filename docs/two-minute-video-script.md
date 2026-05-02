# Two-Minute Video Script — RaDE for DHIS2

## Acronyms / terms to spell out at first mention

- **RaDE** = Rabies Decision Engine  
- **PEP** = post-exposure prophylaxis  
- **WHO SEARO** = World Health Organization Regional Office for South-East Asia  
- **UKHSA** = UK Health Security Agency  
- **Tracker** = DHIS2 Tracker, DHIS2’s individual-level/case-based data model  

---

## Click path during recording

1. Start on the **Rabies Intake** tab.
2. Click **Load sample**.
3. Point to the left intake status and right **Decision support** panel.
4. Click **Validate / Run Demo**.
5. Click **Demo Output / Tracker Payload**.
6. Point to the recommendation, rationale, suggested actions, and payload preview.
7. Click **Metadata Mapping / Readiness**.
8. Point to metadata readiness / placeholder warnings.
9. Stop recording.

---

## 0:00–0:15 — Intro

**Say:**

> This is **RaDE — the Rabies Decision Engine — for DHIS2**, an installable DHIS2 App Platform app for rabies exposure decision support. Rabies **post-exposure prophylaxis**, or PEP, decisions are time-sensitive and detail-heavy, and RaDE helps structure that decision workflow inside DHIS2 Tracker.

**Screen:**

Start on the **Rabies Intake** tab, empty state.

---

## 0:15–0:30 — Evidence basis

**Say:**

> The workflow is based on the **World Health Organization Regional Office for South-East Asia**, or **WHO SEARO**, rabies PEP decision tree. The app also includes a **UK Health Security Agency**, or **UKHSA**, terrestrial mammal country-risk overlay, while bat lyssavirus context is handled separately and remains local-guidance dependent.

**Screen:**

Point to the evidence/scope panel if visible, or briefly point to the header/reference area.

---

## 0:30–0:50 — Load sample

**Say:**

> I’ll load a synthetic sample case. The app captures exposure, animal, wound, country, timing, and patient context, but presents it as a guided decision-support workflow rather than a raw schema dump.

**Action:**

Click **Load sample**.

Pause briefly for the UI to update.

---

## 0:50–1:10 — Live decision support

**Say:**

> As answers are entered, the decision-support panel updates with the current status, missing fields, derived answers, and risk signals. Some WHO source questions can be derived from richer fields, such as animal type, reducing duplicate data entry while preserving the logic internally.

**Screen:**

Point to:
- left intake status/progress,
- right **Decision support** panel,
- derived fields, if visible.

---

## 1:10–1:25 — Run demo

**Say:**

> Now I’ll run the demo assessment. The output is deterministic and local: it does not require an external artificial intelligence service or sending identifiable data outside the DHIS2 environment.

**Action:**

Click **Validate / Run Demo**.

---

## 1:25–1:42 — Output

**Say:**

> The demo produces a recommendation status, rationale, suggested actions, missing-information prompts, follow-up task suggestions, and note-style artifacts for review.

**Action:**

Click **Demo Output / Tracker Payload**.

**Screen:**

Point to the summary sections.

---

## 1:42–1:55 — DHIS2 Tracker payload

**Say:**

> It also previews Tracker-compatible output concepts. DHIS2 remains the system of record; RaDE is the decision-support layer that can write back structured recommendations once local metadata is mapped.

**Screen:**

Point to the Tracker payload or payload preview area.

---

## 1:55–2:05 — Metadata readiness / caveat

**Say:**

> The metadata readiness page flags placeholder identifiers before validation or import. Production use requires local DHIS2 metadata mapping, payload validation, and clinical and public-health governance review.

**Action:**

Click **Metadata Mapping / Readiness**.

Stop recording.

---

## If you need to cut 5–10 seconds

Use this shorter final line:

> Production use requires local metadata mapping and governance review.

---

## Avoid saying this in the two-minute video

Do **not** spend time on:
- OpenEMR,
- OpenMRS,
- SORMAS,
- broader C-COMS / case-contact-management strategy,
- where the app zip is located,
- detailed installation steps.

Those belong in the README and form, not the short video.
