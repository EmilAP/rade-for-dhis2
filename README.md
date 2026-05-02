# RaDE for DHIS2

RaDE for DHIS2 is an installable DHIS2 App Platform web app for rabies exposure decision support in DHIS2 Tracker workflows. It provides structured intake, WHO SEARO-aligned rule-based recommendations, rationale, missing-information prompts, metadata readiness checks, and Tracker-compatible output concepts while keeping DHIS2 Tracker as the system of record.

This repository is the self-contained public competition submission for **RaDE for DHIS2**. C-COMS/CCM are not part of this submission, and prior RaDE work is reference context only; reviewers do not need any sibling repository or private local folder to build, test, install, or understand this app.

## What this app does

- Runs as a DHIS2 App Platform app using `d2.config.js`, `@dhis2/cli-app-scripts`, `@dhis2/app-runtime`, and `@dhis2/ui`.
- Presents a rabies exposure intake workflow with the polished app title **RaDE for DHIS2** and subtitle **Rabies exposure decision support for DHIS2 Tracker**.
- Uses bundled demo fixtures under `src/assets/` and `src/fixtures/`; no runtime file dependency outside this repository is required.
- Applies deterministic local rule-based decision support from the app-facing schema in `src/assets/rabies_intake_v2_with_decision_logic.json`.
- Shows matched rule, rationale, missing information, recommended actions, follow-up task suggestions, and note/artifact previews.
- Generates Tracker-compatible payload concepts and validates readiness for DHIS2 metadata mapping.
- Uses the DHIS2 app runtime/session for DHIS2 API calls where applicable and does not store DHIS2 credentials in frontend code.

## What it does not yet do

- It is not production clinical automation and is not final clinical or public-health authority.
- It does not automatically import live patient records by default.
- It does not provide completed metadata mapping for every DHIS2 instance.
- It does not replace local public-health policy, clinical judgment, governance, privacy review, security review, or role-based access configuration.
- It does not require or call an external AI service.

Final management must follow local public-health policy, clinical judgment, clinical/public-health governance, and locally configured DHIS2 metadata.

## Quick Start For Reviewers

From a fresh clone:

```bash
npm install
npm run build
npm test -- --watchAll=false
```

The DHIS2 App Platform build writes the installable archive to:

```text
build/bundle/rade-for-dhis2-1.0.0.zip
```

For the competition package, keeping this zip in the repository is intentional because it is small enough for review. If a future release omits the zip from Git, download it from the GitHub Releases page for `https://github.com/EmilAP/rade-for-dhis2` or rebuild it with `npm run build`.

## Run Locally With A DHIS2 Proxy

Start or sign in to a DHIS2 instance, then run one of these from the repository root:

```bash
npm start -- --proxy http://localhost:8080
```

For the documented local demo proxy shape, use:

```bash
npm run start:local
```

`start:local` keeps DHIS2 on `http://localhost:8080`, runs the App Platform proxy on `http://localhost:8082`, and serves the app on `http://localhost:3000`. If the App Platform sign-in dialog appears, use the DHIS2 server URL and credentials for your review instance. The demo fixtures can run without production metadata mapping.

The project also includes Yarn-compatible scripts:

```bash
yarn install
yarn build
yarn test --watchAll=false
```

Known non-blocking toolchain output may include App Platform dependency deprecation warnings, including `punycode`, Vite chunk-size warnings from bundled app assets, and npm audit findings in transitive DHIS2 App Platform/UI build dependencies. The app has no external AI service and does not store DHIS2 credentials in frontend code.

## Install Into DHIS2 App Management

1. Build the app with `npm run build`, or use `build/bundle/rade-for-dhis2-1.0.0.zip` if present.
2. Sign in to a DHIS2 instance as a user allowed to manage apps.
3. Open **App Management**.
4. Upload `build/bundle/rade-for-dhis2-1.0.0.zip`.
5. Open **RaDE for DHIS2** from the DHIS2 app menu.

DHIS2 Tracker remains the system of record. Production use requires local Tracker metadata mapping before validation/import paths are enabled for real data.

## Evidence And Reference Data

- **Decision workflow:** World Health Organization, Regional Office for South-East Asia. "Rabies post-exposure prophylaxis decision tree." WHO SEARO. PDF. Accessed 1 May 2026. Source: https://cdn.who.int/media/docs/default-source/searo/ntd/who-searo-rabies-post-exposure-prophylaxis-decision-tree.pdf?sfvrsn=81239502_1
- **Terrestrial mammal country-risk overlay:** UK Health Security Agency. "Rabies risks in terrestrial animals by country." GOV.UK. Published 29 May 2014; last updated 1 May 2024. Accessed 1 May 2026. Source: https://www.gov.uk/government/publications/rabies-risks-by-country/rabies-risks-in-terrestrial-animals-by-country

WHO SEARO is the basis for the rabies PEP decision-tree workflow. UKHSA is used only as a terrestrial mammal country-risk overlay and does not cover the whole decision engine. Bat lyssavirus context is separate and local-guidance dependent. The UKHSA source should be checked periodically for freshness, and local public-health policy plus clinical judgment remain authoritative.

## Security And Responsible Data Use

- The current engine is deterministic, local, and rule-based.
- No external AI service is required.
- Demo fixtures are synthetic and contain no real patient/person data or PHI.
- The app does not store DHIS2 credentials in frontend code.
- DHIS2 API calls use the DHIS2 App Platform runtime/session when the app is installed or proxied in DHIS2.
- Default `RADE_*` and `PLACEHOLDER_*` metadata identifiers are scaffold values and must be replaced before production validation/import.
- Production deployment requires local DHIS2 metadata mapping, Tracker payload validation, DHIS2 role-based access controls, and clinical/public-health governance review.

## Documentation

- [docs/install-in-dhis2.md](docs/install-in-dhis2.md)
- [docs/local-development.md](docs/local-development.md)
- [docs/metadata-mapping.md](docs/metadata-mapping.md)
- [docs/security-and-data-use.md](docs/security-and-data-use.md)
- [docs/rade-dhis2-real-app-path.md](docs/rade-dhis2-real-app-path.md)
- [docs/two-minute-video-script.md](docs/two-minute-video-script.md)
- [docs/dhis2-form-answers.md](docs/dhis2-form-answers.md)
- [docs/public-repo-completeness-check.md](docs/public-repo-completeness-check.md)
- [docs/public-release-cleanup-plan.md](docs/public-release-cleanup-plan.md)

## Current Limitations

- Demonstration/workflow decision support only; not production clinical automation.
- Real DHIS2 deployments must map local programs, stages, data elements, option sets, tracked entity attributes, and org units.
- Tracker payloads should be validated with `/api/tracker?importMode=VALIDATE` before any import workflow is considered.
- UKHSA country-risk source freshness should be checked against the live GOV.UK page before operational use.
- Clinical/public-health policy, data protection, sharing, role, and governance sign-off remain required.

## Competition Submission Note

Submitted product: **RaDE for DHIS2**.

Recommended documentation URL for the DHIS2 App Competition form:

```text
https://github.com/EmilAP/rade-for-dhis2/blob/main/README.md
```

Recommended artifact: `build/bundle/rade-for-dhis2-1.0.0.zip`.
