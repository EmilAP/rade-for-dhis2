# Security And Data Use

## Scope

RaDE for DHIS2 is an installable DHIS2 App Platform app for rabies exposure workflow demonstration and decision support. It is not production clinical automation and is not final clinical or public-health authority.

## Decision logic

- The current decision engine is deterministic, local, and rule-based.
- No external AI service is required.
- Decision support runs in the browser using bundled schema/rule assets.
- Operational use requires local public-health policy review, clinical judgment, and local governance.

## Data handling

- Demo fixtures are synthetic and contain no real patient/person data or PHI.
- The app does not store DHIS2 credentials in frontend code.
- DHIS2 API calls use the DHIS2 app runtime/session where applicable.
- Production deployments should use DHIS2 role-based access controls, sharing rules, audit expectations, and local data protection processes.

## Metadata and payload caution

- Default `RADE_*` and `PLACEHOLDER_*` IDs are demo scaffold values.
- Placeholder metadata must be replaced before production validation/import.
- Tracker payloads should be validated with `/api/tracker?importMode=VALIDATE` before any import path is considered.
- Production use requires local DHIS2 metadata mapping and governance review.

## Evidence and freshness caveat

- World Health Organization, Regional Office for South-East Asia. "Rabies post-exposure prophylaxis decision tree." WHO SEARO. PDF. Accessed 1 May 2026. https://cdn.who.int/media/docs/default-source/searo/ntd/who-searo-rabies-post-exposure-prophylaxis-decision-tree.pdf?sfvrsn=81239502_1
- UK Health Security Agency. "Rabies risks in terrestrial animals by country." GOV.UK. Published 29 May 2014; last updated 1 May 2024. Accessed 1 May 2026. https://www.gov.uk/government/publications/rabies-risks-by-country/rabies-risks-in-terrestrial-animals-by-country

Decision workflow: WHO SEARO rabies PEP decision tree. Country-risk overlay: UKHSA terrestrial mammal rabies risk by country.

WHO SEARO provides the demo decision-tree basis. UKHSA is only the terrestrial mammal country-risk overlay and does not cover the whole decision engine. Bat lyssavirus context is separate and local-guidance dependent. The live UKHSA source should be checked periodically for freshness.
