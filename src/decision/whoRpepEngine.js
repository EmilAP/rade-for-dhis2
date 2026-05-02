const FALLBACK_OUTCOME = {
    code: 'manual_review_required',
    severity: 'grey',
    headline: 'Manual review required.',
    actions: ['Complete intake and reconcile with local public health policy.'],
}

export const hasAnswer = (value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && String(value).trim() !== ''
}

const asArray = (value) => (Array.isArray(value) ? value : hasAnswer(value) ? [value] : [])

const readSelector = (condition, rawAnswers, derivedValues, effectiveAnswers) => {
    if (condition.field) return effectiveAnswers[condition.field]
    if (condition.derived) return derivedValues[condition.derived]
    return undefined
}

const conditionMissingFields = (condition, answers, missing = new Set()) => {
    if (!condition || typeof condition !== 'object') return missing
    if (Array.isArray(condition.all)) {
        condition.all.forEach((item) => conditionMissingFields(item, answers, missing))
        return missing
    }
    if (Array.isArray(condition.any)) {
        const anyAnswered = condition.any.some((item) => {
            if (item.field) return hasAnswer(answers[item.field])
            return true
        })
        if (!anyAnswered) {
            condition.any.forEach((item) => {
                if (item.field) missing.add(item.field)
            })
        }
        return missing
    }
    if (condition.field && !hasAnswer(answers[condition.field])) missing.add(condition.field)
    return missing
}

const evaluateCondition = (condition, rawAnswers, derivedValues, effectiveAnswers) => {
    if (!condition || typeof condition !== 'object') return false
    if (condition.always === true) return true
    if (Array.isArray(condition.all)) {
        return condition.all.every((item) =>
            evaluateCondition(item, rawAnswers, derivedValues, effectiveAnswers)
        )
    }
    if (Array.isArray(condition.any)) {
        return condition.any.some((item) =>
            evaluateCondition(item, rawAnswers, derivedValues, effectiveAnswers)
        )
    }

    const selected = readSelector(condition, rawAnswers, derivedValues, effectiveAnswers)

    if (Object.prototype.hasOwnProperty.call(condition, 'equals')) {
        return Array.isArray(selected)
            ? selected.includes(condition.equals)
            : selected === condition.equals
    }
    if (Array.isArray(condition.in)) {
        return Array.isArray(selected)
            ? selected.some((value) => condition.in.includes(value))
            : condition.in.includes(selected)
    }
    if (Array.isArray(condition.not_in)) {
        return hasAnswer(selected) && !condition.not_in.includes(selected)
    }
    if (Array.isArray(condition.overlaps)) {
        return asArray(selected).some((value) => condition.overlaps.includes(value))
    }
    if (condition.field || condition.derived) return hasAnswer(selected)

    return false
}

const applyDerivedValue = (target, value, derivedValues, effectiveAnswers, rawAnswers, allowOverwrite) => {
    derivedValues[target] = value
    if (allowOverwrite || !hasAnswer(rawAnswers[target])) {
        effectiveAnswers[target] = value
    }
}

const getOutcomeCatalogEntry = (decisionSupport, outcomeCode) => {
    const catalog = decisionSupport?.outcome_catalog || []
    return catalog.find((item) => item.code === outcomeCode) || null
}

const buildMissingFields = (schema, effectiveAnswers, hiddenQuestionIds, matchedRule) => {
    const questions = schema.questions || []
    const hidden = new Set(hiddenQuestionIds)
    const missing = questions
        .filter((question) => question.type === 'core')
        .filter((question) => !hidden.has(question.id))
        .filter((question) => !hasAnswer(effectiveAnswers[question.id]))
        .map((question) => ({
            questionId: question.id,
            text: question.text,
            section: question.section,
        }))

    if (matchedRule?.when) {
        for (const questionId of conditionMissingFields(matchedRule.when, effectiveAnswers)) {
            const question = questions.find((item) => item.id === questionId)
            if (question && !hidden.has(questionId) && !missing.some((item) => item.questionId === questionId)) {
                missing.push({ questionId, text: question.text, section: question.section })
            }
        }
    }

    return missing
}

export const evaluateConditionForTest = evaluateCondition

export const evaluateWhoRpepDecision = (schema = {}, userAnswers = {}) => {
    const decisionSupport = schema.decision_support
    const rawAnswers = { ...(userAnswers || {}) }
    const derivedValues = {}
    const effectiveAnswers = { ...rawAnswers }
    const hiddenQuestionIds = []
    const warnings = []
    const trace = []

    if (!decisionSupport) {
        warnings.push('decision_support is missing; only intake rendering is available.')
        const missingFields = buildMissingFields(schema, effectiveAnswers, hiddenQuestionIds, null)
        return {
            rawAnswers,
            derivedValues,
            effectiveAnswers,
            hiddenQuestionIds,
            matchedRule: null,
            outcome: FALLBACK_OUTCOME,
            rationale: 'No decision_support overlay is present in the schema.',
            recommendedActions: FALLBACK_OUTCOME.actions,
            missingFields,
            warnings,
            trace,
        }
    }

    for (const rule of decisionSupport.derived_field_rules || []) {
        if (evaluateCondition(rule.when, rawAnswers, derivedValues, effectiveAnswers)) {
            applyDerivedValue(
                rule.sets,
                rule.value,
                derivedValues,
                effectiveAnswers,
                rawAnswers,
                rule.overwrite === true || rule.allow_overwrite === true
            )
            trace.push(`derived:${rule.id} set ${rule.sets}=${JSON.stringify(rule.value)}`)
        } else {
            trace.push(`derived:${rule.id} skipped`)
        }
    }

    for (const rule of decisionSupport.ui_visibility_rules || []) {
        if (evaluateCondition(rule.when, rawAnswers, derivedValues, effectiveAnswers)) {
            if (rule.hide_field && !hiddenQuestionIds.includes(rule.hide_field)) {
                hiddenQuestionIds.push(rule.hide_field)
                trace.push(`visibility:${rule.id} hid ${rule.hide_field}`)
            }
            Object.entries(rule.derive || {}).forEach(([target, value]) => {
                applyDerivedValue(target, value, derivedValues, effectiveAnswers, rawAnswers, false)
                trace.push(`visibility:${rule.id} derived ${target}=${JSON.stringify(value)}`)
            })
        } else {
            trace.push(`visibility:${rule.id} skipped`)
        }
    }

    const terminalRules = [...(decisionSupport.terminal_rules || [])].sort(
        (left, right) => (left.priority ?? 9999) - (right.priority ?? 9999)
    )
    const matchedRule = terminalRules.find((rule) =>
        evaluateCondition(rule.when, rawAnswers, derivedValues, effectiveAnswers)
    ) || null

    if (matchedRule) trace.push(`terminal:${matchedRule.id} matched`)
    else warnings.push('No terminal decision rule matched.')

    const outcomeCode = matchedRule?.outcome || 'manual_review_required'
    const catalogEntry = getOutcomeCatalogEntry(decisionSupport, outcomeCode)
    const outcome = catalogEntry || {
        code: outcomeCode,
        severity: matchedRule ? 'grey' : 'grey',
        headline: matchedRule ? outcomeCode : 'Manual review required.',
        actions: FALLBACK_OUTCOME.actions,
    }
    const missingFields = buildMissingFields(schema, effectiveAnswers, hiddenQuestionIds, matchedRule)

    if (outcomeCode === 'INSUFFICIENT_INFORMATION' && missingFields.length === 0) {
        warnings.push('Decision rule reported insufficient information; clinical/public-health review is still required.')
    }

    return {
        rawAnswers,
        derivedValues,
        effectiveAnswers,
        hiddenQuestionIds,
        matchedRule,
        outcome,
        rationale: matchedRule?.rationale || outcome.headline,
        recommendedActions: outcome.actions || [],
        missingFields,
        warnings,
        trace,
    }
}
