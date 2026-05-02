# Metadata Mapping

## Why mapping is required

The bundled app can generate Tracker-compatible payload concepts, but the default metadata IDs are demo scaffold values. Production use requires local DHIS2 metadata UIDs for:

- Tracker program.
- Program stages.
- Data elements.
- Option sets.
- Tracked entity attributes.
- Organisation units.
- Tracked entity type.

`RADE_*` and `PLACEHOLDER_*` values are intentionally treated as production-readiness blockers.

## Mapping JSON shape

The in-app Metadata Mapping / Readiness page accepts pasted or uploaded JSON. A minimal shape is:

```json
{
  "program": "realProgramUid",
  "orgUnit": "realOrgUnitUid",
  "trackedEntityType": "realTrackedEntityTypeUid",
  "programStages": {
    "exposureIntake": "realStageUid",
    "assessmentDisposition": "realStageUid",
    "followUpVisit": "realStageUid"
  },
  "trackedEntityAttributes": {
    "caseId": "realAttributeUid"
  },
  "dataElements": {
    "c02": "realDataElementUid"
  }
}
```

Every persisted intake question should be mapped deliberately. Derived fields and decision outcomes should also be mapped if the local Tracker program stores them as assessment or disposition data elements.

## Readiness checks

The app performs local checks before validation or import planning:

- Fails if `RADE_*` IDs remain.
- Fails if `PLACEHOLDER_*` IDs remain.
- Warns if organisation unit mapping is missing.
- Warns if program or stage mapping is missing.
- Warns if intake questions do not have explicit data element mappings.

Passing these checks does not prove clinical or operational readiness. It only means the mapping no longer contains obvious scaffold IDs and is structurally complete enough for DHIS2 validation-mode testing.

## Production rule

Do not run live production import until local metadata is mapped, payloads are validated with the target DHIS2 instance, local public-health policy is reconciled, and clinical/public-health governance review is complete.
