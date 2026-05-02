# App Hub Submission Readiness

## Recommended App Hub name

RaDE: Rabies Exposure Decision Support

This avoids repeating DHIS2 in the app name while keeping DHIS2 Tracker context in the subtitle, description, and documentation.

## What the app does

RaDE is an installable DHIS2 App Platform app for rabies exposure workflow demonstration and decision support. It provides guided exposure intake, local rule-based decision support, missing-field prompts, Tracker payload preview, and metadata readiness checks.

The demo decision workflow is based on the WHO SEARO rabies PEP decision tree. The UKHSA source is used only as a terrestrial mammal country-risk overlay. Bat lyssavirus context is separate and local-guidance dependent.

## Target users

- DHIS2 implementers evaluating rabies exposure Tracker workflows.
- Surveillance and public-health teams reviewing workflow fit.
- Local configuration teams mapping Tracker metadata for a target DHIS2 instance.
- Reviewers assessing rule transparency, metadata readiness, and App Platform behavior.

## Installation steps

1. Clone the public repository: `https://github.com/EmilAP/rade-for-dhis2`.
2. Install dependencies with `npm install`.
3. Build the app with `npm run build`.
4. Upload `build/bundle/rade-rabies-exposure-1.0.0.zip` through DHIS2 App Management.
5. Open `RaDE: Rabies Exposure Decision Support` from the DHIS2 app menu.

## Demo mode

Demo mode runs without importing metadata into the DHIS2 instance. The bundled sample scenario and fixtures are synthetic and are included under `src/assets/` and `src/fixtures/`.

In demo mode the app can:

- render the intake workflow;
- run local deterministic decision support;
- show missing fields, risk signals, and suggested actions;
- preview Tracker-shaped payload concepts;
- explain metadata readiness blockers.

## Production metadata requirements

Operational use requires local Tracker metadata mapping before validation or import. Local teams must map:

- program;
- program stages;
- tracked entity type;
- tracked entity attributes;
- data elements;
- option sets/options where applicable;
- organisation units.

Default `RADE_*` and `PLACEHOLDER_*` identifiers are scaffold values. The Metadata Readiness page checks mappings and flags those placeholders so they are not mistaken for production-ready metadata.

## Screenshots list

Recommended App Hub screenshots are documented in [app-hub-screenshots.md](app-hub-screenshots.md):

- First screen / Intake.
- Sample intake with live decision support.
- Demo Output.
- Metadata Readiness.
- Evidence and scope expanded.

## Security notes

- No external AI service is required.
- No DHIS2 credentials are stored in frontend code.
- DHIS2 API calls use the DHIS2 App Runtime session.
- Demo fixtures are synthetic and contain no real patient data.
- No external scripts, stylesheets, or CDNs are added by the app source.
- DataStore namespace is `rade-dhis2`; key is `config`; the config is optional for demo mode and should contain no secrets.

See [app-hub-security-checklist.md](app-hub-security-checklist.md) for the detailed checklist.

## Limitations

- Demonstration/workflow decision support only; not production clinical automation.
- Not a final clinical or public-health authority.
- Does not automatically discover metadata from arbitrary DHIS2 instances.
- Does not import live patient records by default.
- UKHSA country-risk source freshness should be checked before operational use.
- Production use requires local policy alignment, privacy/security review, DHIS2 role-based access configuration, and governance sign-off.

## Support/contact

Use GitHub issues in the public repository for support and submission review questions:

`https://github.com/EmilAP/rade-for-dhis2/issues`

## Source citations

WHO: World Health Organization, Regional Office for South-East Asia. "Rabies post-exposure prophylaxis decision tree." WHO SEARO. PDF. Accessed 1 May 2026. URL: https://cdn.who.int/media/docs/default-source/searo/ntd/who-searo-rabies-post-exposure-prophylaxis-decision-tree.pdf?sfvrsn=81239502_1

UKHSA: UK Health Security Agency. "Rabies risks in terrestrial animals by country." GOV.UK. Published 29 May 2014; last updated 1 May 2024. Accessed 1 May 2026. URL: https://www.gov.uk/government/publications/rabies-risks-by-country/rabies-risks-in-terrestrial-animals-by-country

## Responsible data use statement

RaDE should be used as decision support and workflow support only. Local teams remain responsible for clinical/public-health decision-making, consent and privacy requirements, role-based access, data minimization, retention, sharing agreements, and incident response. Do not enter real patient data into demo fixtures or unmanaged review environments.
