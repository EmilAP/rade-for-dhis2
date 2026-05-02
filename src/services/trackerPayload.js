import { buildNotePreview, hasAnswer } from './demoAssessment'
import { evaluateWhoRpepDecision } from '../decision/whoRpepEngine'

const DEFAULT_MAPPING = {
    program: 'RADE_PROG_001',
    trackedEntityType: 'RADE_TET_PERSON',
    orgUnit: 'PLACEHOLDER_ORG_UNIT',
    programStages: {
        exposureIntake: 'RADE_PS_INTAKE',
        assessmentDisposition: 'RADE_PS_ASSESS',
        followUpVisit: 'RADE_PS_FOLLOWUP',
    },
    trackedEntityAttributes: {
        firstName: 'RADE_ATTR_FNAME',
        lastName: 'RADE_ATTR_LNAME',
        dateOfBirth: 'RADE_ATTR_DOB',
        sex: 'RADE_ATTR_SEX',
        phone: 'RADE_ATTR_PHONE',
        caseId: 'RADE_ATTR_CASEID',
    },
    dataElements: {},
}

const nowIso = () => new Date().toISOString()

const payloadId = () => `payload_${Date.now()}`

export const mergeMapping = (mapping = {}) => ({
    ...DEFAULT_MAPPING,
    ...mapping,
    programStages: {
        ...DEFAULT_MAPPING.programStages,
        ...(mapping.programStages || mapping.stages || {}),
    },
    trackedEntityAttributes: {
        ...DEFAULT_MAPPING.trackedEntityAttributes,
        ...(mapping.trackedEntityAttributes || mapping.attributes || {}),
    },
    dataElements: {
        ...DEFAULT_MAPPING.dataElements,
        ...(mapping.dataElements || {}),
    },
})

export const serializeAnswerForDhis2 = (question, value) => {
    if (Array.isArray(value)) return value.join('|')
    if (question.response_type === 'binary_yn') return value === 'yes' ? 'true' : 'false'
    return String(value)
}

const buildTaskSuggestions = (decisionResult) => [
    {
        task_type: 'clinical_review',
        priority: decisionResult.outcome?.severity === 'red' ? 'high' : 'routine',
        due: decisionResult.outcome?.severity === 'red' ? 'same_day' : 'as_available',
        description:
            'Review the decision-support result against local rabies PEP policy and clinical/public-health judgment.',
    },
    {
        task_type: 'animal_investigation',
        priority: 'routine',
        due: 'as_available',
        description:
            'Record whether the animal can be located, observed, quarantined, or tested, and update the decision if information changes.',
    },
    {
        task_type: 'follow_up_schedule',
        priority: decisionResult.outcome?.severity === 'green' ? 'routine' : 'high',
        due: 'after_day_0_decision',
        description:
            'If PEP is started, schedule vaccine follow-up visits and document RIG/RmAbs decisions according to local protocol.',
    },
]

const buildAssessmentFromDecision = (decisionResult) => ({
    status: 'who_searo_aligned_decision_support',
    code: decisionResult.outcome?.code || 'manual_review_required',
    headline: decisionResult.outcome?.headline || 'Manual review required.',
    severity: decisionResult.outcome?.severity || 'grey',
    matched_rule_id: decisionResult.matchedRule?.id || null,
    rationale: {
        summary: decisionResult.rationale,
        lines: [
            decisionResult.outcome?.headline || 'Manual review required.',
            decisionResult.rationale,
            `Matched rule: ${decisionResult.matchedRule?.id || 'none'}`,
            'Basis: WHO SEARO decision tree; local policy governs operational use.',
        ].filter(Boolean),
    },
    recommended_actions: decisionResult.recommendedActions || [],
    missing_information_prompts: decisionResult.missingFields.map((field) => ({
        question_id: field.questionId,
        prompt: field.text,
        section_id: field.section,
    })),
    follow_up_task_suggestions: buildTaskSuggestions(decisionResult),
    warnings: decisionResult.warnings || [],
})

export const buildLocalDemoOutput = (
    schema,
    answers,
    mappingInput = {},
    appConfig = {},
    providedDecisionResult = null
) => {
    const mapping = mergeMapping({
        ...mappingInput,
        program: mappingInput.program || appConfig.programId,
        orgUnit: mappingInput.orgUnit || appConfig.defaultOrgUnit,
    })
    const createdAt = nowIso()
    const id = payloadId()
    const trackedEntityId = `RADE_TEI_${id}`
    const decisionResult = providedDecisionResult || evaluateWhoRpepDecision(schema, answers)
    const assessment = buildAssessmentFromDecision(decisionResult)

    const dataValues = (schema.questions || [])
        .filter((question) => hasAnswer(answers[question.id]))
        .map((question) => ({
            dataElement:
                mapping.dataElements[question.id] || `RADE_DE_${question.id.toUpperCase()}`,
            value: serializeAnswerForDhis2(question, answers[question.id]),
        }))

    const trackerPayload = {
        trackedEntities: [
            {
                trackedEntity: trackedEntityId,
                trackedEntityType: mapping.trackedEntityType,
                orgUnit: mapping.orgUnit,
                attributes: [
                    {
                        attribute: mapping.trackedEntityAttributes.caseId,
                        value: trackedEntityId,
                    },
                ],
            },
        ],
        enrollments: [
            {
                enrollment: `RADE_ENROLL_${id}`,
                trackedEntity: trackedEntityId,
                program: mapping.program,
                orgUnit: mapping.orgUnit,
                enrolledAt: createdAt,
                occurredAt: createdAt,
                status: 'ACTIVE',
            },
        ],
        events: [
            {
                event: `RADE_EVT_INTAKE_${id}`,
                program: mapping.program,
                programStage: mapping.programStages.exposureIntake,
                trackedEntity: trackedEntityId,
                orgUnit: mapping.orgUnit,
                occurredAt: createdAt,
                status: 'COMPLETED',
                dataValues,
            },
            {
                event: `RADE_EVT_ASSESS_${id}`,
                program: mapping.program,
                programStage: mapping.programStages.assessmentDisposition,
                trackedEntity: trackedEntityId,
                orgUnit: mapping.orgUnit,
                occurredAt: createdAt,
                status: 'ACTIVE',
                dataValues: [
                    { dataElement: 'RADE_DE_ASSESS_STATUS', value: assessment.status },
                    { dataElement: 'RADE_DE_RECOMMEND', value: assessment.code },
                    {
                        dataElement: 'RADE_DE_MATCHED_RULE',
                        value: assessment.matched_rule_id || 'none',
                    },
                    {
                        dataElement: 'RADE_DE_ASSESS_NOTES',
                        value: assessment.rationale.summary,
                    },
                ],
                notes: [
                    {
                        value:
                            'Demo decision support. Local policy and governance review required before operational use.',
                    },
                ],
            },
        ],
    }

    return {
        demo_metadata_scaffold: {
            extension_name: 'RaDE: Rabies Exposure Decision Support',
            schema_path: 'src/assets/rabies_intake_v2_with_decision_logic.json',
            scenario_path: 'src/assets/dhis2-rabies-competition-scenario.json',
        },
        production_warning:
            'The RADE_* and PLACEHOLDER_* identifiers are demo placeholders. Replace them with local DHIS2 metadata UIDs and validate with /api/tracker?importMode=VALIDATE before production import.',
        schema: {
            schema_id: schema.schema_id,
            version: schema.version,
            question_count: (schema.questions || []).length,
        },
        recommendation: assessment,
        decisionResult,
        note_preview: buildNotePreview(assessment),
        trackerPayload,
        mapping,
    }
}
