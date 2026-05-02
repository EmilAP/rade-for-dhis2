# Public Repo Completeness Check

This checklist verifies that `rade-dhis2-app` can stand alone as the public repository `https://github.com/EmilAP/rade-for-dhis2` for DHIS2 App Competition reviewers.

## A. Installable DHIS2 app source

- [x] `d2.config.js` is present.
- [x] `package.json` is present with App Platform scripts.
- [x] App source is under `src/`.
- [x] App assets are under `src/assets/`.
- [x] Build script is available: `npm run build`.
- [x] Test script is available: `npm test -- --watchAll=false`.

## B. Installable artifact

- [x] Installable archive path is documented: `build/bundle/rade-for-dhis2-1.0.0.zip`.
- [x] Keeping the zip in this repo is intentional for the competition release if present.
- [x] README explains how to rebuild it with `npm run build`.
- [x] README explains that a future omitted zip should be downloaded from GitHub Releases.

## C. Core demo assets

- [x] App-facing schema: `src/assets/rabies_intake_v2_with_decision_logic.json`.
- [x] Fallback/reference schema: `src/assets/rabies_intake_v2_dhis2_competition.json`.
- [x] Sample scenario: `src/assets/dhis2-rabies-competition-scenario.json`.
- [x] Demo summary fixture: `src/fixtures/demo-summary.json`.
- [x] Metadata readiness logic is in `src/services/metadataReadiness.js` and mapping can be pasted/uploaded in the app.
- [x] No runtime dependency on files outside this repo is required.

## D. Documentation

- [x] `README.md`.
- [x] `docs/install-in-dhis2.md`.
- [x] `docs/local-development.md`.
- [x] `docs/metadata-mapping.md`.
- [x] `docs/security-and-data-use.md`.
- [x] `docs/rade-dhis2-real-app-path.md`.
- [x] `docs/two-minute-video-script.md`.
- [x] `docs/dhis2-form-answers.md`.
- [x] `docs/public-release-cleanup-plan.md`.

## E. Citations/evidence basis

- [x] README cites WHO SEARO rabies PEP decision tree.
- [x] README cites UKHSA rabies risks in terrestrial animals by country.
- [x] Docs clarify WHO SEARO is the decision workflow basis.
- [x] Docs clarify UKHSA is only the terrestrial mammal country-risk overlay.
- [x] Docs clarify UKHSA does not cover the whole decision engine.
- [x] Docs clarify bat lyssavirus context is separate and local-guidance dependent.
- [x] Docs state the UKHSA source should be periodically checked for freshness.
- [x] Docs state local public-health policy and clinical judgment remain authoritative.

## F. Responsible data/security notes

- [x] Deterministic local rule-based logic is documented.
- [x] No external AI service requirement is documented.
- [x] Demo fixtures contain no real patient/demo PHI.
- [x] Placeholder metadata warning is documented.
- [x] Production requires local DHIS2 metadata mapping and governance review.
- [x] App does not store DHIS2 credentials in frontend code.
- [x] App uses DHIS2 app session/runtime for API calls where applicable.

## G. Reviewer quick start

- [x] README supports `npm install`.
- [x] README supports `npm run build`.
- [x] README supports `npm test -- --watchAll=false`.
- [x] README explains installing/uploading `rade-for-dhis2-1.0.0.zip` into DHIS2 App Management.
- [x] README documents local DHIS2 proxy commands.

## H. Form links

- [x] README is suitable as the documentation link: `https://github.com/EmilAP/rade-for-dhis2/blob/main/README.md`.

## I. No hidden dependency on prior work

- [x] Reviewers do not need `rade-v2`, the parent module folder, CCM, C-COMS, DHIS2 stack/source folders, private output folders, or uncommitted sibling files.
- [x] Prior RaDE work is described only as reference context where relevant, not as a required dependency.

## J. No confusing legacy material

- [x] No docs in this app repo imply the submission is only a static HTML demo.
- [x] No docs in this app repo present C-COMS/CCM as the submitted product.
- [x] No docs require reviewers to inspect `rade-v2` or CCM.
- [x] No docs claim production clinical automation or final clinical authority.
- [x] README and docs describe the installable DHIS2 App Platform app.
- [x] README documents the current test command.

## Current conclusion

The app folder is designed to be self-contained for public review after generated local folders are removed and `npm run build` plus `npm test -- --watchAll=false` pass from this folder.
