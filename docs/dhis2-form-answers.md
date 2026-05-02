# DHIS2 App Competition Form Answers

## Contact

**Email:** emil.prikryl@gmail.com

**Organization:** self

## Submission

**Name:** Rabies Decision Engine (RaDE) for DHIS2

**Category:** Web App; Integration

**Optional Other:** DHIS2 App Platform decision-support app

Do not select External Service unless a deployed external backend service is added later.

## Under-300-character description

RaDE for DHIS2 is an installable DHIS2 App Platform app for rabies exposure decision support: structured intake, WHO SEARO-aligned rules, missing-field prompts, metadata readiness checks, and Tracker-compatible outputs.

## Contributors

Built by Emil Prikryl with AI-assisted development support. No additional human contributors.

## Release status

**Released/new:** New extension

**Entered before:** No

## Links

**Source code link:** https://github.com/EmilAP/rade-for-dhis2

**Documentation link:** https://github.com/EmilAP/rade-for-dhis2/blob/main/README.md

**Video URL:** TODO: add final public video URL

**Distribution/release URL:** TODO: add GitHub Release URL if the zip is published as a release artifact

## Artifact

`build/bundle/rade-rabies-exposure-1.0.0.zip`

Expected repository path after build:

```text
build/bundle/rade-rabies-exposure-1.0.0.zip
```

## Prerequisites

Requires a DHIS2 instance that can install DHIS2 App Platform web apps. The app can run with bundled demo fixtures, but production use requires mapping local DHIS2 Tracker metadata, including programs, stages, data elements, option sets, tracked entity attributes, and org units. Node.js/npm or yarn are required only for local development/building from source.

## Security

The app uses deterministic local rule-based decision support and does not require external AI services or transmission of identifiable data outside the DHIS2 environment. It uses the DHIS2 app session/runtime for API calls and does not store DHIS2 credentials in frontend code. Demo fixtures contain no real patient data. Production deployments should replace placeholder metadata IDs, validate Tracker payloads before import, use DHIS2 role-based access controls, and review recommendations under local public-health governance.

## Screenshot suggestions

- First screen showing **RaDE: Rabies Exposure Decision Support**, **Rabies exposure decision support for DHIS2 Tracker**, the concise demo decision-support banner, and reviewer badges.
- Intake page after loading the sample scenario, including live decision support.
- Demo Output page showing recommendation and payload readiness warning.
- Metadata Readiness page showing placeholder checks.

## Scope note

The submitted product is RaDE for DHIS2. It is an installable DHIS2 App Platform app, not a standalone static HTML demo. C-COMS/CCM are not part of this submission, and reviewers do not need prior RaDE repositories.
