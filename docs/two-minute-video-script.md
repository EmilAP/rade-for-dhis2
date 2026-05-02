# Two-Minute Video Script

## 0:00-0:15 Intro/problem

"This is RaDE for DHIS2: an installable DHIS2 App Platform app for rabies exposure decision support. The problem is that rabies post-exposure decisions are time-sensitive, detail-heavy, and usually have to fit inside existing surveillance workflows. RaDE helps structure that work inside DHIS2."

## 0:15-0:35 What app does and evidence basis

"The app supports guided rabies exposure intake, local rule-based decision support, missing-field prompts, and Tracker-compatible outputs. Decision workflow: WHO SEARO rabies PEP decision tree. Country-risk overlay: UKHSA terrestrial mammal rabies risk by country. Bat lyssavirus context is separate and local-guidance dependent."

## 0:35-1:05 Rabies intake/live decision support

"Here, the reviewer sees the polished app home state: RaDE for DHIS2; rabies exposure decision support for DHIS2 Tracker; and the concise banner: demo decision support only, local rule-based logic, no external AI service required. On the intake screen, I can load a synthetic sample case or enter exposure, animal, wound, country, and patient context. The live panel updates with status, missing fields, derived fields, and suggested actions as answers change."

## 1:05-1:30 Run demo/decision output

"When I run the demo, RaDE produces deterministic local decision support. It shows recommendation status, rationale, suggested actions, missing information, follow-up task suggestions, and a note preview. Debug details still expose the matched rule and trace when needed. Operational use requires local metadata mapping, policy review, and clinical and public-health governance."

## 1:30-1:48 Tracker-compatible payload concepts

"The app also previews Tracker-compatible payload concepts. DHIS2 Tracker remains the system of record. The generated payload uses scaffold metadata until a deployment maps the local Tracker program, stages, data elements, option sets, tracked entity attributes, and org units."

## 1:48-2:00 Metadata readiness/security/production caveat

"The readiness page flags placeholder metadata before validation or import. The logic is deterministic and local, with no external AI service required and no real patient data in the demo fixtures. Production use requires local DHIS2 metadata mapping, payload validation, and clinical and public-health governance review."
