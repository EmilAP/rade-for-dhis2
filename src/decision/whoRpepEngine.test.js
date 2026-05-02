import schema from '../assets/rabies_intake_v2_with_decision_logic.json'
import sampleScenario from '../assets/dhis2-rabies-competition-scenario.json'
import { evaluateWhoRpepDecision } from './whoRpepEngine'
import {
    DEFAULT_SHOW_SCHEMA_DETAILS,
    getDecisionProgress,
    getQuestionOptions,
    getUnsupportedControlMessage,
} from '../services/questionRendering'
import { validateMetadataReadiness } from '../services/metadataReadiness'

const outcomeFor = (answers) => evaluateWhoRpepDecision(schema, answers).outcome.code

describe('evaluateWhoRpepDecision', () => {
    test.each(schema.decision_support.test_cases)('passes schema test case $id', (testCase) => {
        const result = evaluateWhoRpepDecision(schema, testCase.answers)
        expect(result.outcome.code).toBe(testCase.expected_outcome)
        Object.entries(testCase.expected_derived || {}).forEach(([field, value]) => {
            expect(result.derivedValues[field]).toEqual(value)
            expect(result.effectiveAnswers[field]).toEqual(value)
        })
    })

    test('non-mammal returns no PEP and wash guidance', () => {
        const result = evaluateWhoRpepDecision(schema, { w01: 'no' })
        expect(result.outcome.code).toBe('NO_PEP_WASH_ONLY')
        expect(result.outcome.headline).toMatch(/not indicated/i)
        expect(result.recommendedActions.join(' ')).toMatch(/Wash/i)
    })

    test('rodent selected via c04 derives and hides redundant WHO nodes', () => {
        const result = evaluateWhoRpepDecision(schema, { c04: 'small_rodent' })
        expect(result.outcome.code).toBe('NO_PEP_WASH_ONLY')
        expect(result.derivedValues.w01).toBe('yes')
        expect(result.derivedValues.w02).toBe('yes')
        expect(result.hiddenQuestionIds).toEqual(expect.arrayContaining(['w01', 'w02']))
    })

    test('bat selected via c04 creates high-risk category III context', () => {
        const result = evaluateWhoRpepDecision(schema, { c04: 'bat_other_or_unknown' })
        expect(result.outcome.code).toBe('START_PEP_IMMEDIATELY')
        expect(result.derivedValues.animal_is_bat).toBe(true)
        expect(result.derivedValues.w05).toBe('category_iii')
    })

    test('exposure over 10 days ago with animal alive can discontinue/not indicate PEP', () => {
        expect(outcomeFor({ w01: 'yes', w02: 'no', w03: 'yes', c14: 'yes' })).toBe(
            'PEP_NOT_INDICATED_OR_DISCONTINUE'
        )
    })

    test('child under 14 starts PEP immediately', () => {
        expect(outcomeFor({ w01: 'yes', w02: 'no', w03: 'no', c15: 'yes' })).toBe(
            'START_PEP_IMMEDIATELY'
        )
    })

    test('animal test results drive expected outcomes', () => {
        expect(outcomeFor({ w01: 'yes', w02: 'no', c23: 'yes', c24: 'positive' })).toBe(
            'START_PEP_IMMEDIATELY'
        )
        expect(outcomeFor({ w01: 'yes', w02: 'no', c23: 'yes', c24: 'pending' })).toBe(
            'START_PEP_IMMEDIATELY'
        )
        expect(outcomeFor({ w01: 'yes', w02: 'no', c23: 'yes', c24: 'inconclusive' })).toBe(
            'START_PEP_IMMEDIATELY'
        )
        expect(outcomeFor({ w01: 'yes', w02: 'no', c23: 'yes', c24: 'negative' })).toBe(
            'PEP_NOT_INDICATED_OR_DISCONTINUE'
        )
    })

    test('WHO wound categories map to expected outcomes', () => {
        expect(outcomeFor({ w05: 'category_i' })).toBe('CATEGORY_I_NO_PEP')
        expect(outcomeFor({ w05: 'category_ii' })).toBe('CATEGORY_II_WOUND_WASH_ARV')
        expect(outcomeFor({ w05: 'category_iii', c37: 'no', c29: 'no', c30: 'no', c44: 'no' })).toBe(
            'CATEGORY_III_WOUND_WASH_RIG_RMABS_ARV'
        )
    })

    test('answer progress uses effective answers and excludes hidden suppressed fields', () => {
        const result = evaluateWhoRpepDecision(schema, sampleScenario.answers)
        const progress = getDecisionProgress(schema, result.effectiveAnswers, result.hiddenQuestionIds)
        expect(progress.answered).toBe(progress.total)
        expect(progress.hidden).toBeGreaterThan(0)
    })

    test('missing decision_support returns an intake-only warning', () => {
        const result = evaluateWhoRpepDecision({ ...schema, decision_support: undefined }, {})
        expect(result.warnings.join(' ')).toMatch(/only intake rendering/i)
        expect(result.outcome.code).toBe('manual_review_required')
    })
})

describe('question rendering helpers', () => {
    test('c12 multiselect_any uses items as options', () => {
        const c12 = schema.questions.find((question) => question.id === 'c12')
        expect(c12.response_type).toBe('multiselect_any')
        expect(getQuestionOptions(c12)).toHaveLength(7)
        expect(getUnsupportedControlMessage(c12)).toBeNull()
    })

    test('string option arrays are normalized for binary and ternary controls', () => {
        const w01 = schema.questions.find((question) => question.id === 'w01')
        expect(getQuestionOptions(w01)).toEqual([
            { value: 'yes', label: 'yes' },
            { value: 'no', label: 'no' },
            { value: 'unknown', label: 'unknown' },
        ])
    })

    test('multiselect_any with no options shows explicit schema warning', () => {
        expect(getUnsupportedControlMessage({ response_type: 'multiselect_any' })).toBe(
            'No options configured for this multi-select question.'
        )
    })

    test('technical schema details are hidden by default', () => {
        expect(DEFAULT_SHOW_SCHEMA_DETAILS).toBe(false)
    })
})

describe('metadata readiness', () => {
    test('placeholder mapping prevents production readiness', () => {
        const readiness = validateMetadataReadiness(
            {
                program: 'RADE_PROG_001',
                orgUnit: 'PLACEHOLDER_ORG_UNIT',
                programStages: { exposureIntake: 'RADE_PS_INTAKE', assessmentDisposition: 'RADE_PS_ASSESS' },
                dataElements: {},
            },
            schema
        )
        expect(readiness.ready).toBe(false)
        expect(readiness.errors.join(' ')).toMatch(/RADE_/)
        expect(readiness.errors.join(' ')).toMatch(/PLACEHOLDER_/)
    })
})
