# Two-Minute Video Script

## 0:00-0:15 Intro/problem

"This is RaDE for DHIS2: an installable DHIS2 App Platform app for rabies exposure decision support. The problem is that rabies post-exposure decisions are time-sensitive, detail-heavy, and usually have to fit inside existing surveillance workflows. RaDE helps structure that work inside DHIS2."

## 0:15-0:35 What app does and evidence basis

"The app supports guided rabies exposure intake, local rule-based recommendations, rationale, missing-information prompts, and Tracker-compatible outputs. The decision workflow is based on the WHO SEARO rabies post-exposure prophylaxis decision tree. A UKHSA terrestrial mammal country-risk overlay adds country context, while bat lyssavirus context is handled separately and depends on local guidance."

## 0:35-1:05 Rabies intake/live decision support

"Here, the reviewer sees the polished app home state: RaDE for DHIS2, rabies exposure decision support for DHIS2 Tracker, and badges for the rabies workflow package, decision schema, and demo Tracker program. On the intake screen, I can load a synthetic sample case or enter exposure, wound, animal, country, and patient context. The live panel updates with missing information, derived fields, and decision status as answers change."

## 1:05-1:30 Run demo/decision output

"When I run the demo, RaDE produces deterministic local decision support. It shows the matched rule, recommendation headline, rationale, suggested actions, missing information, follow-up task suggestions, and a note preview. This is demonstration and workflow support only. Final management must follow local public-health policy, clinical judgment, and local governance."

## 1:30-1:48 Tracker-compatible payload concepts

"The app also previews Tracker-compatible payload concepts. DHIS2 Tracker remains the system of record. The generated payload uses scaffold metadata until a deployment maps the local Tracker program, stages, data elements, option sets, tracked entity attributes, and org units."

## 1:48-2:00 Metadata readiness/security/production caveat

"The readiness page flags placeholder metadata before validation or import. The logic is deterministic and local, with no external AI service required and no real patient data in the demo fixtures. Production use requires local DHIS2 metadata mapping, payload validation, and clinical and public-health governance review."
