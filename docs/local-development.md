# Local Development

## Prerequisites

- Node.js/npm compatible with `@dhis2/cli-app-scripts`.
- A DHIS2 instance for proxied runtime/API testing.
- Yarn is optional; npm commands are documented for reviewers.

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

The installable DHIS2 app archive is written to:

```text
build/bundle/rade-for-dhis2-1.0.0.zip
```

`npm run pack` uses the same App Platform build command.

## Test

```bash
npm test -- --watchAll=false
```

The test suite covers the WHO SEARO-aligned decision engine, schema `decision_support.test_cases`, multiselect helper behavior, answer progress counting, debug-default behavior, and metadata placeholder readiness.

## Start with a DHIS2 proxy

```bash
npm start -- --proxy http://localhost:8080
```

For the local two-port proxy shape:

```bash
npm run start:local
```

`start:local` expects DHIS2 at `http://localhost:8080`, uses proxy port `8082`, and serves the app at `http://localhost:3000`.

If the generated App Platform shell gets stale and Vite reports a missing `.d2` import, force a shell rebuild:

```bash
npm run start:force -- --proxy http://localhost:8080 --proxyPort 8082
```

## Known non-blocking warnings

Install/build output may include DHIS2 App Platform dependency warnings such as npm audit findings in transitive build/UI packages, `punycode` deprecation notices, and chunk-size warnings. A conservative dependency refresh has been applied, but some remaining warnings are inside the current DHIS2 App Platform/UI toolchain and should not be forced with `npm audit fix --force` unless the app is retested carefully afterward.

## Development behavior

- The app renders `src/assets/rabies_intake_v2_with_decision_logic.json` as the primary app-facing schema.
- The sample loader uses `src/assets/dhis2-rabies-competition-scenario.json`.
- Decision support is deterministic, local, and rule-based.
- DHIS2 API calls use `@dhis2/app-runtime` when the app is installed or proxied inside DHIS2.
- No external AI service is required.
