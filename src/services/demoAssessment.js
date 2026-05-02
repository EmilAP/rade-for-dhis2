const REQUIRED_RESPONSE_TYPES = new Set([
    'binary_yn',
    'ternary_ynu',
    'enum',
    'count_enum',
    'multiselect_any',
    'free_text',
    'datetime',
])

export const getQuestionsBySection = (schema) => {
    const sectionMap = new Map(
        (schema.sections || []).map((section) => [section.id, { ...section, questions: [] }])
    )

    for (const question of schema.questions || []) {
        const section = sectionMap.get(question.section) || {
            id: question.section || 'unsectioned',
            title: question.section || 'Other questions',
            questions: [],
        }
        section.questions.push(question)
        sectionMap.set(section.id, section)
    }

    return Array.from(sectionMap.values())
}

export const hasAnswer = (value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && String(value).trim() !== ''
}

export const buildDemoAssessment = (schema, answers) => {
    const questions = schema.questions || []
    const answeredCount = questions.filter((question) => hasAnswer(answers[question.id])).length
    const missingCoreQuestions = questions
        .filter((question) => question.type === 'core' && !hasAnswer(answers[question.id]))
        .map((question) => ({
            question_id: question.id,
            prompt: question.text,
            section_id: question.section,
        }))

    const riskSignals = []
    const category = answers.w05
    const exposureTypes = Array.isArray(answers.c12) ? answers.c12 : []

    if (category === 'category_iii' || exposureTypes.length > 0) {
        riskSignals.push('relevant_exposure_present')
    }
    if (answers.c15 === 'yes' || answers.c16 === 'yes' || answers.w04 === 'yes') {
        riskSignals.push('high_priority_victim')
    }
    if (answers.c25 === 'no' || answers.c24 === 'not_done') {
        riskSignals.push('animal_not_available_or_not_tested')
    }
    if (answers.c29 === 'no' || answers.c37 === 'yes') {
        riskSignals.push('vaccination_or_immunity_review_needed')
    }

    const unsupportedTypes = Array.from(
        new Set(
            questions
                .map((question) => question.response_type)
                .filter((responseType) => responseType && !REQUIRED_RESPONSE_TYPES.has(responseType))
        )
    )

    return {
        status: 'placeholder_assessment_generated',
        code: 'manual_review_required',
        rationale: {
            summary:
                'Local deterministic demo output only. Final recommendation requires local clinical protocol review and production validation.',
            lines: [
                `${answeredCount}/${questions.length} questions answered`,
                `${riskSignals.length} risk signal(s) detected from local demo rules`,
                `${missingCoreQuestions.length} unanswered core question(s)`,
                'Final PEP/RIG disposition is not production clinical automation',
            ],
        },
        risk_signals: riskSignals,
        missing_information_prompts: missingCoreQuestions,
        follow_up_task_suggestions: [
            {
                task_type: 'clinical_review',
                priority: 'high',
                due: 'same_day',
                description:
                    'Review exposure category, patient factors, and local PEP/RIG protocol before clinical action.',
            },
            {
                task_type: 'animal_investigation',
                priority: 'routine',
                due: 'as_available',
                description:
                    'Record whether the animal can be located, observed, quarantined, or tested.',
            },
            {
                task_type: 'follow_up_schedule',
                priority: 'high',
                due: 'after_day_0_decision',
                description:
                    'If PEP is started, schedule vaccine follow-up visits and document RIG decision.',
            },
        ],
        unsupported_response_types: unsupportedTypes,
    }
}

export const buildNotePreview = (assessment) => [
    'RaDE for DHIS2 demo note',
    `Status: ${assessment.status}`,
    `Recommendation: ${assessment.headline || assessment.code}`,
    `Matched rule: ${assessment.matched_rule_id || 'none'}`,
    '',
    'Rationale:',
    ...assessment.rationale.lines.map((line) => `- ${line}`),
    '',
    'Recommended actions:',
    ...(assessment.recommended_actions || []).map((line) => `- ${line}`),
    '',
    'Important: WHO SEARO-aligned decision support for demonstration/workflow support. Final management should follow local public health policy and clinical judgment.',
].join('\n')
