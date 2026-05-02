const PLACEHOLDER_PREFIXES = ['RADE_', 'PLACEHOLDER_']

const isPlaceholderValue = (value) =>
    typeof value === 'string' && PLACEHOLDER_PREFIXES.some((prefix) => value.startsWith(prefix))

const walkValues = (value, path = '$', result = []) => {
    if (Array.isArray(value)) {
        value.forEach((item, index) => walkValues(item, `${path}[${index}]`, result))
        return result
    }

    if (value && typeof value === 'object') {
        Object.entries(value).forEach(([key, item]) => walkValues(item, `${path}.${key}`, result))
        return result
    }

    if (isPlaceholderValue(value)) {
        result.push({ path, value })
    }

    return result
}

export const parseMappingJson = (text) => {
    if (!text || !text.trim()) return { mapping: {}, error: null }
    try {
        return { mapping: JSON.parse(text), error: null }
    } catch (error) {
        return { mapping: {}, error: error.message }
    }
}

export const validateMetadataReadiness = (mapping = {}, schema = {}) => {
    const errors = []
    const warnings = []
    const placeholders = walkValues(mapping)
    const dataElements = mapping.dataElements || {}
    const programStages = mapping.programStages || mapping.stages || {}
    const questions = schema.questions || []

    const radeIds = placeholders.filter((item) => String(item.value).startsWith('RADE_'))
    const placeholderIds = placeholders.filter((item) =>
        String(item.value).startsWith('PLACEHOLDER_')
    )

    if (radeIds.length > 0) {
        errors.push(`${radeIds.length} RADE_* scaffold ID(s) remain in the mapping.`)
    }
    if (placeholderIds.length > 0) {
        errors.push(`${placeholderIds.length} PLACEHOLDER_* ID(s) remain in the mapping.`)
    }
    if (!mapping.orgUnit) {
        warnings.push('Organisation unit mapping is missing.')
    }
    if (!mapping.program) {
        warnings.push('Program mapping is missing.')
    }
    if (!programStages.exposureIntake || !programStages.assessmentDisposition) {
        warnings.push('Program stage mapping is incomplete.')
    }

    const missingDataElements = questions
        .filter((question) => !dataElements[question.id])
        .map((question) => question.id)

    if (missingDataElements.length > 0) {
        warnings.push(
            `${missingDataElements.length} intake question(s) do not have explicit data element mappings.`
        )
    }

    return {
        ready: errors.length === 0 && warnings.length === 0,
        canValidate: errors.length === 0 && !!mapping.program && !!mapping.orgUnit,
        errors,
        warnings,
        placeholders,
        missingDataElements,
    }
}
