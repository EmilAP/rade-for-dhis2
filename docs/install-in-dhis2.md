# Install In DHIS2

## Build the app zip

From a fresh clone of this repository:

```bash
npm install
npm run build
```

The DHIS2 App Platform build creates:

```text
build/bundle/rade-rabies-exposure-1.0.0.zip
```

`npm run pack` and `yarn build` are also available through the package scripts.

## Upload through App Management

1. Sign in to a DHIS2 instance as a user allowed to manage apps.
2. Open **App Management**.
3. Upload `build/bundle/rade-rabies-exposure-1.0.0.zip`.
4. Open **RaDE: Rabies Exposure Decision Support** from the DHIS2 app menu.

The app runs inside the DHIS2 session. It does not ask users to paste DHIS2 usernames or passwords into frontend code.

## Run locally with a proxy

For development or review against a DHIS2 instance at `http://localhost:8080`:

```bash
npm start -- --proxy http://localhost:8080
```

For the documented two-port local proxy shape:

```bash
npm run start:local
```

This serves the app at `http://localhost:3000`, proxies DHIS2 API calls through `http://localhost:8082`, and expects DHIS2 at `http://localhost:8080`.

## Bundled demo fixtures

The app can run with bundled synthetic fixtures and no production metadata:

- `src/assets/rabies_intake_v2_with_decision_logic.json`
- `src/assets/rabies_intake_v2_dhis2_competition.json`
- `src/assets/dhis2-rabies-competition-scenario.json`
- `src/fixtures/demo-summary.json`

These fixtures are for demonstration and review. They contain no real patient data.

## Evidence basis

- World Health Organization, Regional Office for South-East Asia. "Rabies post-exposure prophylaxis decision tree." WHO SEARO. PDF. Accessed 1 May 2026. https://cdn.who.int/media/docs/default-source/searo/ntd/who-searo-rabies-post-exposure-prophylaxis-decision-tree.pdf?sfvrsn=81239502_1
- UK Health Security Agency. "Rabies risks in terrestrial animals by country." GOV.UK. Published 29 May 2014; last updated 1 May 2024. Accessed 1 May 2026. https://www.gov.uk/government/publications/rabies-risks-by-country/rabies-risks-in-terrestrial-animals-by-country

WHO SEARO is the decision workflow basis. UKHSA is only the terrestrial mammal country-risk overlay. UKHSA does not cover the whole decision engine. Bat lyssavirus context is separate and local-guidance dependent. Check the live UKHSA source periodically for freshness.

## Production metadata and import limitations

Demo fixtures work without metadata import. Production use requires mapping local DHIS2 programs, stages, data elements, option sets, tracked entity attributes, and org units. Default `RADE_*` and `PLACEHOLDER_*` identifiers are demo scaffold values and must be replaced.

Tracker validation/import is not clinical approval. Do not enable live production import without local metadata validation, payload review, local public-health policy review, clinical governance, privacy/security review, and DHIS2 role-based access configuration.

No external AI service is required.
