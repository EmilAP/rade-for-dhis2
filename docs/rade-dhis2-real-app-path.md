# RaDE For DHIS2 Real App Path

## Submitted product

The submitted product is **RaDE for DHIS2**: an installable DHIS2 App Platform app for rabies exposure decision support and Tracker-compatible output concepts.

C-COMS and CCM are not part of this submission. Earlier RaDE work is prior/reference work only and is not required to build, test, install, or understand this public repository.

## Current app behavior

The app provides:

- A DHIS2 App Platform project with `d2.config.js` and `@dhis2/cli-app-scripts`.
- A polished first screen titled **RaDE for DHIS2** with subtitle **Rabies exposure decision support for DHIS2 Tracker**.
- Reviewer badges for **Workflow package: Rabies exposure**, **Decision schema: v2.1.0**, and **Demo Tracker program: Animal Exposure Tracker**.
- Guided rabies exposure intake from bundled schema assets.
- WHO SEARO-aligned local deterministic decision support.
- UKHSA terrestrial mammal country-risk overlay with separate bat lyssavirus context.
- Demo output with matched rule, rationale, recommended actions, missing information, follow-up task suggestions, note preview, and Tracker payload concepts.
- Metadata readiness checks that block `RADE_*` and `PLACEHOLDER_*` scaffold IDs from being treated as production-ready.
- DHIS2 validation-mode API path through the current app runtime/session when running inside DHIS2.

## Evidence basis

- World Health Organization, Regional Office for South-East Asia. "Rabies post-exposure prophylaxis decision tree." WHO SEARO. PDF. Accessed 1 May 2026. https://cdn.who.int/media/docs/default-source/searo/ntd/who-searo-rabies-post-exposure-prophylaxis-decision-tree.pdf?sfvrsn=81239502_1
- UK Health Security Agency. "Rabies risks in terrestrial animals by country." GOV.UK. Published 29 May 2014; last updated 1 May 2024. Accessed 1 May 2026. https://www.gov.uk/government/publications/rabies-risks-by-country/rabies-risks-in-terrestrial-animals-by-country

WHO SEARO is the decision workflow basis. UKHSA is only the terrestrial mammal country-risk overlay. Bat lyssavirus context is separate and local-guidance dependent.

## Deferred production work

Before operational use, implementers must map local DHIS2 metadata, validate payloads against the target instance, reconcile workflow wording with local policy, check UKHSA source freshness, and complete clinical/public-health, privacy, security, sharing, audit, and role review.

The app should be presented as demonstration/workflow decision support only, not production clinical automation.
