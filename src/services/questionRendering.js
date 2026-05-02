export const DEFAULT_SHOW_SCHEMA_DETAILS = false

export const getQuestionOptions = (question = {}) =>
    (question.options || question.items || []).map((option) =>
        typeof option === 'string' ? { value: option, label: option } : option
    )

export const getUnsupportedControlMessage = (question = {}) => {
    if (
        ['multiselect_any', 'multiselect'].includes(question.response_type) &&
        getQuestionOptions(question).length === 0
    ) {
        return 'No options configured for this multi-select question.'
    }
    return null
}

export const isNumericResponseType = (responseType) => ['integer', 'number'].includes(responseType)

const hasAnswer = (value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && String(value).trim() !== ''
}

export const getDecisionProgress = (schema = {}, effectiveAnswers = {}, hiddenQuestionIds = []) => {
    const hidden = new Set(hiddenQuestionIds)
    const visibleQuestions = (schema.questions || []).filter((question) => !hidden.has(question.id))
    return {
        answered: visibleQuestions.filter((question) => hasAnswer(effectiveAnswers[question.id])).length,
        total: visibleQuestions.length,
        hidden: hiddenQuestionIds.length,
    }
}
