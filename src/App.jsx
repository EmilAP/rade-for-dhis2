import React, { useMemo, useState } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import { Button, Card, CenteredContent, CircularLoader, Tag } from '@dhis2/ui'
import { useAppConfig } from './hooks/useAppConfig'
import augmentedSchema from './assets/rabies_intake_v2_with_decision_logic.json'
import fallbackSchema from './assets/rabies_intake_v2_dhis2_competition.json'
import sampleScenario from './assets/dhis2-rabies-competition-scenario.json'
import referenceSummary from './fixtures/demo-summary.json'
import { evaluateWhoRpepDecision, hasAnswer } from './decision/whoRpepEngine'
import { getQuestionsBySection } from './services/demoAssessment'
import { buildLocalDemoOutput } from './services/trackerPayload'
import { parseMappingJson, validateMetadataReadiness } from './services/metadataReadiness'
import { validateTrackerPayload } from './services/dhis2Validation'
import {
    DEFAULT_SHOW_SCHEMA_DETAILS,
    getQuestionOptions,
    getUnsupportedControlMessage,
    isNumericResponseType,
} from './services/questionRendering'
import classes from './App.module.css'

const intakeSchema = augmentedSchema?.decision_support ? augmentedSchema : fallbackSchema
const schemaWarning = augmentedSchema?.decision_support
    ? null
    : 'decision_support is missing; only intake rendering is available.'

const pages = [
    { id: 'intake', label: 'Rabies Intake' },
    { id: 'output', label: 'Demo Output / Tracker Payload' },
    { id: 'mapping', label: 'Metadata Mapping / Readiness' },
    { id: 'submission', label: 'Competition Notes' },
]

const disclaimer =
    'This tool provides WHO SEARO-aligned rabies PEP decision support for demonstration and workflow support. Final management should follow local public health policy and clinical judgment.'

const demoNotice =
    'This demo runs locally in the DHIS2 app and does not send identifiable data to external AI services. Production deployment requires local DHIS2 metadata mapping and local policy review.'

const valueCards = [
    {
        title: 'Assess exposure',
        text: 'Capture structured exposure, wound, animal, country, and patient context.',
    },
    {
        title: 'Review decision support',
        text: 'Surface missing information, rationale, risk signals, and suggested follow-up tasks.',
    },
    {
        title: 'Generate DHIS2 Tracker output',
        text: 'Preview Tracker-compatible payloads and validate local metadata readiness.',
    },
]

const evidenceReferences = [
    {
        label: 'Decision workflow',
        citation:
            'World Health Organization, Regional Office for South-East Asia. "Rabies post-exposure prophylaxis decision tree." WHO SEARO. PDF. Accessed 1 May 2026.',
        url: 'https://cdn.who.int/media/docs/default-source/searo/ntd/who-searo-rabies-post-exposure-prophylaxis-decision-tree.pdf?sfvrsn=81239502_1',
    },
    {
        label: 'Country/animal risk overlay',
        citation:
            'UK Health Security Agency. "Rabies risks in terrestrial animals by country." GOV.UK. Published 29 May 2014; last updated 1 May 2024. Accessed 1 May 2026.',
        url: 'https://www.gov.uk/government/publications/rabies-risks-by-country/rabies-risks-in-terrestrial-animals-by-country',
    },
]

const evidenceScopeNote =
    'The WHO SEARO PDF is used as the basis for the demo rabies PEP decision-tree workflow. The UKHSA table applies to terrestrial animals and is used as a country/animal risk overlay. Bat lyssavirus risks are handled separately and should be reviewed with local public health guidance. Check the live GOV.UK source periodically because country-risk data may change.'

const operationalLimits = [
    'Recommendations are decision support, not final production clinical automation.',
    'Local public health policy, clinical judgment, and clinical/public-health review remain required before management decisions.',
    'DHIS2 Tracker payloads use scaffold metadata until local program, stage, data element, attribute, and org unit UIDs are mapped.',
    'Validation mode is provided for review; live import should wait until placeholder IDs are removed and local governance signs off.',
]

const formatJson = (value) => JSON.stringify(value, null, 2)

const datetimeValue = (value) => {
    if (!value) return ''
    return String(value).replace(/Z$/, '').slice(0, 16)
}

const valueLabel = (question, value) => {
    if (!hasAnswer(value)) return 'Not answered'
    const options = getQuestionOptions(question)
    if (Array.isArray(value)) {
        return value
            .map((item) => options.find((option) => option.value === item)?.label || item)
            .join(', ')
    }
    return options.find((option) => option.value === value)?.label || String(value)
}

const severityClass = (severity) => {
    if (severity === 'red') return classes.severityRed
    if (severity === 'orange' || severity === 'amber') return classes.severityOrange
    if (severity === 'green') return classes.severityGreen
    return classes.severityGrey
}

const SafetyNotice = ({ compact = false }) => (
    <div className={`${classes.safetyNotice} ${compact ? classes.safetyNoticeCompact : ''}`}>
        <strong>Decision-support scope:</strong> {disclaimer}
    </div>
)

const DemoNotice = () => <div className={classes.demoNotice}>{demoNotice}</div>

const EvidencePanel = () => (
    <details open className={classes.evidencePanel}>
        <summary>Evidence and reference data</summary>
        <div className={classes.evidenceGrid}>
            {evidenceReferences.map((reference) => (
                <div key={reference.label} className={classes.evidenceItem}>
                    <span>{reference.label}</span>
                    <p>{reference.citation}</p>
                    <a href={reference.url} target="_blank" rel="noreferrer">
                        {reference.url}
                    </a>
                </div>
            ))}
        </div>
        <p className={classes.evidenceScope}>{evidenceScopeNote}</p>
    </details>
)

const LimitationsList = () => (
    <ul className={classes.compactList}>
        {operationalLimits.map((item) => (
            <li key={item}>{item}</li>
        ))}
    </ul>
)

const QuestionInput = ({ question, value, onChange }) => {
    const options = getQuestionOptions(question)
    const warning = getUnsupportedControlMessage(question)

    if (warning) return <div className={classes.warnBox}>{warning}</div>

    if (question.response_type === 'enum' || question.response_type === 'count_enum') {
        return (
            <select
                className={classes.control}
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="">Select...</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label || option.value}
                    </option>
                ))}
            </select>
        )
    }

    if (question.response_type === 'binary_yn' || question.response_type === 'ternary_ynu') {
        const buttonOptions =
            options.length > 0
                ? options
                : [
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                      ...(question.response_type === 'ternary_ynu'
                          ? [{ value: 'unknown', label: 'Unknown' }]
                          : []),
                  ]
        return (
            <div className={classes.choiceRow}>
                {buttonOptions.map((option) => (
                    <button
                        key={option.value}
                        className={`${classes.choiceButton} ${
                            value === option.value ? classes.choiceSelected : ''
                        }`}
                        type="button"
                        onClick={() => onChange(option.value)}
                    >
                        {option.label || option.value}
                    </button>
                ))}
            </div>
        )
    }

    if (question.response_type === 'datetime') {
        return (
            <input
                className={classes.control}
                type="datetime-local"
                value={datetimeValue(value)}
                onChange={(event) => onChange(event.target.value)}
            />
        )
    }

    if (question.response_type === 'free_text') {
        return (
            <textarea
                className={classes.textarea}
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
                rows={3}
            />
        )
    }

    if (question.response_type === 'multiselect_any' || question.response_type === 'multiselect') {
        const selected = Array.isArray(value) ? value : []
        return (
            <div className={classes.checkboxList}>
                {options.map((option) => {
                    const checked = selected.includes(option.value)
                    return (
                        <label
                            key={option.value}
                            className={`${classes.checkboxOption} ${checked ? classes.choiceSelected : ''}`}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => {
                                    const next = event.target.checked
                                        ? [...selected, option.value]
                                        : selected.filter((item) => item !== option.value)
                                    onChange(next)
                                }}
                            />
                            <span>{option.label || option.value}</span>
                        </label>
                    )
                })}
            </div>
        )
    }

    if (isNumericResponseType(question.response_type)) {
        return (
            <input
                className={classes.control}
                type="number"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
            />
        )
    }

    return (
        <input
            className={classes.control}
            value={Array.isArray(value) ? value.join('|') : value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder={`Unsupported response type: ${question.response_type || 'unknown'}`}
        />
    )
}

const DebugDetails = ({ question, answers, decisionResult }) => (
    <details className={classes.debugDetails}>
        <summary>Schema/debug details</summary>
        <dl className={classes.debugGrid}>
            <dt>Question ID</dt>
            <dd>{question.id}</dd>
            <dt>Response type</dt>
            <dd>{question.response_type || 'unknown'}</dd>
            <dt>Origin/source</dt>
            <dd>{question.origin || question.source || 'not specified'}</dd>
            <dt>Source map</dt>
            <dd>{formatJson(question.source_map || {})}</dd>
            <dt>Raw answer</dt>
            <dd>{formatJson(answers[question.id])}</dd>
            <dt>Derived answer</dt>
            <dd>{formatJson(decisionResult.derivedValues[question.id])}</dd>
            <dt>Effective answer</dt>
            <dd>{formatJson(decisionResult.effectiveAnswers[question.id])}</dd>
        </dl>
    </details>
)

const labelFromCode = (code) =>
    String(code || 'manual_review_required')
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

const getDecisionStatus = (decisionResult) => {
    if (decisionResult.outcome?.code === 'INSUFFICIENT_INFORMATION') return 'Insufficient information'
    if (!decisionResult.matchedRule) return 'Manual review required'
    return labelFromCode(decisionResult.outcome?.code)
}

const getDecisionHeadline = (decisionResult) => {
    if (decisionResult.outcome?.code === 'INSUFFICIENT_INFORMATION') {
        return 'More exposure details are needed before a rabies PEP recommendation can be produced.'
    }
    return decisionResult.outcome?.headline || 'Manual review required.'
}

const getDecisionActions = (decisionResult) => {
    if (decisionResult.outcome?.code === 'INSUFFICIENT_INFORMATION') {
        return [
            'Complete required exposure and animal fields.',
            'Confirm WHO wound/exposure category.',
            'Review animal availability/testing information.',
            'Validate DHIS2 metadata mapping before write-back.',
        ]
    }
    return decisionResult.recommendedActions?.length
        ? decisionResult.recommendedActions
        : ['Review the intake with local public health guidance before acting.']
}

const getRiskSignals = (decisionResult, questionsById = {}) => {
    const signals = []
    const category = decisionResult.effectiveAnswers.w05
    const countryRisk = decisionResult.derivedValues.ukhsa_country_terrestrial_mammal_rabies_risk_level
    const animalAvailable = decisionResult.effectiveAnswers.c23 || decisionResult.effectiveAnswers.c25
    const testingStatus = decisionResult.effectiveAnswers.c24

    if (category) signals.push(`WHO exposure category: ${valueLabel(questionsById.w05 || {}, category)}`)
    if (countryRisk) {
        signals.push(
            `UKHSA terrestrial mammal country-risk overlay: ${valueLabel(
                questionsById.ukhsa_country_terrestrial_mammal_rabies_risk_level || {},
                countryRisk
            )}`
        )
    }
    if (decisionResult.derivedValues.animal_is_bat) {
        signals.push('Bat exposure context: review separate bat lyssavirus guidance and local policy.')
    }
    if (animalAvailable) signals.push(`Animal availability: ${valueLabel(questionsById.c23 || questionsById.c25 || {}, animalAvailable)}`)
    if (testingStatus) signals.push(`Animal testing status: ${valueLabel(questionsById.c24 || {}, testingStatus)}`)
    if (decisionResult.effectiveAnswers.c15 === 'yes') signals.push('Patient is a child under 14 years.')
    if (decisionResult.effectiveAnswers.c16 === 'yes') signals.push('Highly innervated wound site is indicated.')
    if (decisionResult.effectiveAnswers.c37 === 'yes') signals.push('Immunocompromise is indicated.')

    return signals
}

const DecisionSummary = ({ decisionResult, questionsById, showDebug }) => {
    const riskSignals = getRiskSignals(decisionResult, questionsById)
    return (
        <Card className={`${classes.card} ${classes.summaryCard}`}>
            <h2 className={classes.cardTitle}>Decision-support summary</h2>
            <div className={`${classes.severityBanner} ${severityClass(decisionResult.outcome?.severity)}`}>
                <span>{getDecisionHeadline(decisionResult)}</span>
            </div>
            <div className={classes.summaryRows}>
                <div>
                    <span className={classes.summaryLabel}>Decision status</span>
                    <strong>{getDecisionStatus(decisionResult)}</strong>
                </div>
            </div>
            <h3 className={classes.subheading}>Why</h3>
            <p>{decisionResult.rationale || 'Complete the intake to produce a decision-support rationale.'}</p>
            <h3 className={classes.subheading}>Missing information</h3>
            {decisionResult.missingFields.length > 0 ? (
                <ul className={classes.compactList}>
                    {decisionResult.missingFields.slice(0, 6).map((field) => (
                        <li key={field.questionId}>{field.text}</li>
                    ))}
                </ul>
            ) : (
                <p className={classes.muted}>No missing visible core fields for the matched path.</p>
            )}
            <h3 className={classes.subheading}>Key risk signals</h3>
            {riskSignals.length > 0 ? (
                <ul className={classes.compactList}>
                    {riskSignals.map((signal) => (
                        <li key={signal}>{signal}</li>
                    ))}
                </ul>
            ) : (
                <p className={classes.muted}>No key risk signals yet. Start with exposure context or load the sample.</p>
            )}
            <h3 className={classes.subheading}>Suggested next actions</h3>
            <ul className={classes.compactList}>
                {getDecisionActions(decisionResult).map((action) => (
                    <li key={action}>{action}</li>
                ))}
            </ul>
            <h3 className={classes.subheading}>Source/governance note</h3>
            <p className={classes.sourceNote}>{evidenceScopeNote} Final management follows local public health policy and clinical judgment.</p>
            {decisionResult.warnings.length > 0 && (
                <div className={classes.warnBox}>{decisionResult.warnings.join(' ')}</div>
            )}
            {showDebug && (
                <div className={classes.summaryRows}>
                    <div>
                        <span className={classes.summaryLabel}>Matched rule</span>
                        <strong>{decisionResult.matchedRule?.id || 'None'}</strong>
                    </div>
                    <div>
                        <span className={classes.summaryLabel}>Outcome code</span>
                        <strong>{decisionResult.outcome?.code || 'manual_review_required'}</strong>
                    </div>
                </div>
            )}
            <SafetyNotice compact />
        </Card>
    )
}

const DerivedFieldsPanel = ({ decisionResult, questionsById, showDebug }) => {
    const entries = Object.entries(decisionResult.derivedValues)
    return (
        <Card className={classes.card}>
            <h2 className={classes.cardTitle}>Derived fields</h2>
            {entries.length > 0 ? (
                <div className={classes.derivedList}>
                    {entries.map(([field, value]) => (
                        <div key={field} className={classes.derivedItem}>
                            <span>{questionsById[field]?.text || field}</span>
                            <strong>{valueLabel(questionsById[field] || {}, value)}</strong>
                            {showDebug && <small>{field}</small>}
                        </div>
                    ))}
                </div>
            ) : (
                <p className={classes.muted}>No derived values yet.</p>
            )}
        </Card>
    )
}

const ContextPanel = ({ decisionResult, questionsById }) => {
    const country = valueLabel(questionsById.geo02 || {}, decisionResult.effectiveAnswers.geo02)
    const species = valueLabel(questionsById.c04 || {}, decisionResult.effectiveAnswers.c04)
    return (
        <Card className={classes.card}>
            <h2 className={classes.cardTitle}>UKHSA and bat context</h2>
            <dl className={classes.contextList}>
                <dt>Exposure country/territory</dt>
                <dd>{country}</dd>
                <dt>Animal context</dt>
                <dd>{species}</dd>
                <dt>Country-risk overlay</dt>
                <dd>UKHSA terrestrial mammal country-risk overlay, with separate bat lyssavirus context.</dd>
                <dt>Bat exposure</dt>
                <dd>{decisionResult.derivedValues.animal_is_bat ? 'Bat risk context active' : 'Not indicated by current answers'}</dd>
            </dl>
        </Card>
    )
}

const RabiesIntakePage = ({ answers, setAnswers, onRun, output }) => {
    const sections = useMemo(() => getQuestionsBySection(intakeSchema), [])
    const questionsById = useMemo(
        () => Object.fromEntries((intakeSchema.questions || []).map((question) => [question.id, question])),
        []
    )
    const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id)
    const [showDebug, setShowDebug] = useState(DEFAULT_SHOW_SCHEMA_DETAILS)
    const decisionResult = useMemo(() => evaluateWhoRpepDecision(intakeSchema, answers), [answers])
    const hidden = new Set(showDebug ? [] : decisionResult.hiddenQuestionIds)
    const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0]
    const visibleQuestions = (activeSection?.questions || []).filter((question) => !hidden.has(question.id))
    const visibleAllQuestions = (intakeSchema.questions || []).filter((question) => !hidden.has(question.id))
    const answeredCount = visibleAllQuestions.filter((question) =>
        hasAnswer(decisionResult.effectiveAnswers[question.id])
    ).length
    const rawAnsweredCount = (intakeSchema.questions || []).filter((question) =>
        hasAnswer(answers[question.id])
    ).length
    const totalCount = visibleAllQuestions.length
    const derivedAnsweredCount = Object.values(decisionResult.derivedValues).filter(hasAnswer).length
    const intakeStatus = rawAnsweredCount === 0 ? 'Not started' : answeredCount >= totalCount ? 'Complete' : 'In progress'
    const requiredRemaining = decisionResult.missingFields.length
    const activeIndex = sections.findIndex((section) => section.id === activeSection?.id)

    const updateAnswer = (questionId, value) => {
        setAnswers((current) => ({ ...current, [questionId]: value }))
    }

    const moveSection = (direction) => {
        const next = sections[activeIndex + direction]
        if (next) setActiveSectionId(next.id)
    }

    return (
        <div className={classes.decisionLayout}>
            <aside className={classes.leftRail}>
                <Card className={classes.card}>
                    <h2 className={classes.cardTitle}>Sections</h2>
                    <div className={classes.statusStack}>
                        <div>
                            <span>Intake status</span>
                            <strong>{intakeStatus}</strong>
                        </div>
                        <div>
                            <span>Required fields remaining</span>
                            <strong>{requiredRemaining}</strong>
                        </div>
                        <div>
                            <span>Decision status</span>
                            <strong>{getDecisionStatus(decisionResult)}</strong>
                        </div>
                        <div>
                            <span>Next step</span>
                            <strong>{rawAnsweredCount === 0 ? 'Start with exposure context or load sample' : 'Review missing fields and decision support'}</strong>
                        </div>
                    </div>
                    <div className={classes.progressText}>
                        Intake progress: {answeredCount} of {totalCount} visible questions answered
                    </div>
                    <div className={classes.progressSubtext}>
                        {rawAnsweredCount} entered answers; {derivedAnsweredCount} derived answers available. Derived answers are counted separately and shown in the decision-support panel.
                    </div>
                    <div className={classes.progressTrack}>
                        <div
                            className={classes.progressFill}
                            style={{ width: `${totalCount ? (answeredCount / totalCount) * 100 : 0}%` }}
                        />
                    </div>
                    <div className={classes.sectionList}>
                        {sections.map((section) => {
                            const sectionQuestions = section.questions.filter((question) => !hidden.has(question.id))
                            const sectionAnswered = sectionQuestions.filter((question) =>
                                hasAnswer(decisionResult.effectiveAnswers[question.id])
                            ).length
                            return (
                                <button
                                    key={section.id}
                                    className={`${classes.sectionButton} ${
                                        activeSection?.id === section.id ? classes.activeSection : ''
                                    }`}
                                    type="button"
                                    onClick={() => setActiveSectionId(section.id)}
                                >
                                    <span>{section.title}</span>
                                    <small>{sectionAnswered}/{sectionQuestions.length}</small>
                                </button>
                            )
                        })}
                    </div>
                </Card>
            </aside>

            <main className={classes.mainPanel}>
                <div className={classes.actionBar}>
                    <Button onClick={() => setAnswers(sampleScenario.answers)}>Load sample</Button>
                    <Button onClick={() => setAnswers({})}>Clear</Button>
                    <Button primary onClick={() => onRun(decisionResult)}>Validate / Run Demo</Button>
                </div>

                {schemaWarning && <div className={classes.warnBox}>{schemaWarning}</div>}
                <SafetyNotice />

                <Card className={classes.card}>
                    <div className={classes.sectionHeader}>
                        <div>
                            <h2 className={classes.cardTitle}>{activeSection?.title}</h2>
                            <p className={classes.muted}>WHO SEARO-aligned workflow basis with UKHSA terrestrial mammal country-risk overlay and separate bat lyssavirus context.</p>
                        </div>
                        <div className={classes.headerMeta}>
                            <Tag>Decision schema v{intakeSchema.version}</Tag>
                            <label className={classes.debugToggle}>
                                <input
                                    type="checkbox"
                                    checked={showDebug}
                                    onChange={(event) => setShowDebug(event.target.checked)}
                                />
                                Show schema/debug details
                            </label>
                        </div>
                    </div>

                    <div className={classes.questionList}>
                        {visibleQuestions.map((question) => (
                            <div key={question.id} className={classes.questionBlock}>
                                <label className={classes.questionText} htmlFor={question.id}>
                                    {question.text}
                                </label>
                                {question.inline_notes?.length > 0 && (
                                    <p className={classes.helperText}>{question.inline_notes[0]}</p>
                                )}
                                <QuestionInput
                                    question={question}
                                    value={answers[question.id]}
                                    onChange={(value) => updateAnswer(question.id, value)}
                                />
                                {showDebug && (
                                    <DebugDetails
                                        question={question}
                                        answers={answers}
                                        decisionResult={decisionResult}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className={classes.sectionNav}>
                        <Button disabled={activeIndex <= 0} onClick={() => moveSection(-1)}>
                            Previous
                        </Button>
                        <Button disabled={activeIndex >= sections.length - 1} onClick={() => moveSection(1)}>
                            Next
                        </Button>
                    </div>
                </Card>

                {output && (
                    <Card className={classes.card}>
                        <h2 className={classes.cardTitle}>Latest demo disposition</h2>
                        <p className={classes.outputStatus}>{output.recommendation.headline}</p>
                        <p className={classes.muted}>Matched rule: {output.recommendation.matched_rule_id || 'none'}</p>
                        <SafetyNotice compact />
                    </Card>
                )}
            </main>

            <aside className={classes.rightRail}>
                <DecisionSummary
                    decisionResult={decisionResult}
                    questionsById={questionsById}
                    showDebug={showDebug}
                />
                <DerivedFieldsPanel
                    decisionResult={decisionResult}
                    questionsById={questionsById}
                    showDebug={showDebug}
                />
                <ContextPanel decisionResult={decisionResult} questionsById={questionsById} />
                {showDebug && (
                    <Card className={classes.card}>
                        <h2 className={classes.cardTitle}>Debug trace</h2>
                        <pre className={classes.preview}>{decisionResult.trace.join('\n')}</pre>
                    </Card>
                )}
            </aside>
        </div>
    )
}

const OutputPage = ({ output }) => {
    const engine = useDataEngine()
    const [validationState, setValidationState] = useState({ loading: false, result: null, error: null })

    const handleValidate = async () => {
        setValidationState({ loading: true, result: null, error: null })
        try {
            const result = await validateTrackerPayload(engine, output?.trackerPayload)
            setValidationState({ loading: false, result, error: null })
        } catch (error) {
            setValidationState({ loading: false, result: null, error: error.message })
        }
    }

    if (!output) {
        return (
            <Card className={classes.card}>
                <h2 className={classes.cardTitle}>No demo output yet</h2>
                <p className={classes.muted}>Complete intake fields or load the sample, then run the demo.</p>
                <pre className={classes.preview}>{formatJson(referenceSummary.recommendation)}</pre>
            </Card>
        )
    }

    return (
        <div className={classes.outputGrid}>
            <Card className={classes.card}>
                <h2 className={classes.cardTitle}>Decision result</h2>
                <SafetyNotice />
                <div className={`${classes.severityBanner} ${severityClass(output.recommendation.severity)}`}>
                    {output.recommendation.headline}
                </div>
                <p className={classes.muted}>Matched rule: {output.recommendation.matched_rule_id || 'none'}</p>
                <h3 className={classes.subheading}>Rationale</h3>
                <p>{output.recommendation.rationale.summary}</p>
                <h3 className={classes.subheading}>Recommended actions</h3>
                <ul className={classes.compactList}>
                    {output.recommendation.recommended_actions.map((action) => (
                        <li key={action}>{action}</li>
                    ))}
                </ul>
                <h3 className={classes.subheading}>Missing information</h3>
                {output.recommendation.missing_information_prompts.length > 0 ? (
                    <ul className={classes.compactList}>
                        {output.recommendation.missing_information_prompts.map((item) => (
                            <li key={item.question_id}>{item.prompt}</li>
                        ))}
                    </ul>
                ) : (
                    <p className={classes.muted}>No missing visible core questions for the matched path.</p>
                )}
                <h3 className={classes.subheading}>Task suggestions</h3>
                <ul className={classes.compactList}>
                    {output.recommendation.follow_up_task_suggestions.map((task) => (
                        <li key={task.task_type}>{task.description}</li>
                    ))}
                </ul>
                <h3 className={classes.subheading}>Note/artifact preview</h3>
                <pre className={classes.preview}>{output.note_preview}</pre>
            </Card>

            <Card className={classes.card}>
                <div className={classes.sectionHeader}>
                    <h2 className={classes.cardTitle}>Tracker payload readiness</h2>
                    <Button onClick={handleValidate} loading={validationState.loading}>
                        Validate Tracker Payload
                    </Button>
                </div>
                <p className={classes.warningText}>{output.production_warning}</p>
                <div className={classes.warnBox}>
                    Tracker validation/import is not a clinical approval. Local metadata mapping, local policy review, and clinical/public-health governance must be completed before operational use.
                </div>
                {validationState.error && <div className={classes.errorBox}>{validationState.error}</div>}
                {validationState.result && (
                    <details open className={classes.advancedBlock}>
                        <summary>Validation response</summary>
                        <pre className={classes.preview}>{formatJson(validationState.result)}</pre>
                    </details>
                )}
                <details className={classes.advancedBlock}>
                    <summary>Advanced: raw payload</summary>
                    <pre className={classes.preview}>{formatJson(output.trackerPayload)}</pre>
                </details>
                <details className={classes.advancedBlock}>
                    <summary>Advanced: raw decision trace</summary>
                    <pre className={classes.preview}>{formatJson(output.decisionResult)}</pre>
                </details>
            </Card>
        </div>
    )
}

const MappingPage = ({ mappingText, setMappingText }) => {
    const { mapping, error } = parseMappingJson(mappingText)
    const readiness = validateMetadataReadiness(mapping, intakeSchema)

    const handleUpload = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setMappingText(String(reader.result || ''))
        reader.readAsText(file)
    }

    return (
        <div className={classes.outputGrid}>
            <Card className={classes.card}>
                <h2 className={classes.cardTitle}>Metadata mapping requirements</h2>
                <p>
                    Production use requires local DHIS2 programs, stages, data elements, option sets,
                    tracked entity attributes, and organisation units to be mapped before import.
                </p>
                <ul className={classes.compactList}>
                    <li>Demo scaffold UIDs beginning with RADE_* are not production-ready.</li>
                    <li>PLACEHOLDER_* values must be replaced before validation or import.</li>
                    <li>Org unit, program, stage, and data element mappings must match the target instance.</li>
                    <li>Local DHIS2 metadata must be mapped before real deployment validation.</li>
                </ul>
                <h3 className={classes.subheading}>Readiness</h3>
                <SafetyNotice compact />
                {error && <div className={classes.errorBox}>Invalid JSON: {error}</div>}
                {!error && readiness.ready && <div className={classes.okBox}>Mapping passes local readiness checks.</div>}
                {!error && readiness.errors.map((item) => <div className={classes.errorBox} key={item}>{item}</div>)}
                {!error && readiness.warnings.map((item) => <div className={classes.warnBox} key={item}>{item}</div>)}
                {!error && !readiness.ready && (
                    <p className={classes.warningText}>This mapping is not safe to validate/import until placeholder IDs are replaced.</p>
                )}
                <h3 className={classes.subheading}>Operational limits</h3>
                <LimitationsList />
            </Card>

            <Card className={classes.card}>
                <div className={classes.sectionHeader}>
                    <h2 className={classes.cardTitle}>Paste or upload mapping JSON</h2>
                    <input type="file" accept="application/json,.json" onChange={handleUpload} />
                </div>
                <textarea
                    className={classes.mappingArea}
                    value={mappingText}
                    onChange={(event) => setMappingText(event.target.value)}
                    placeholder={formatJson({
                        program: 'realProgramUid',
                        orgUnit: 'realOrgUnitUid',
                        trackedEntityType: 'realTrackedEntityTypeUid',
                        programStages: {
                            exposureIntake: 'realStageUid',
                            assessmentDisposition: 'realStageUid',
                        },
                        dataElements: { c02: 'realDataElementUid' },
                    })}
                />
                <h3 className={classes.subheading}>Placeholder findings</h3>
                <pre className={classes.preview}>{formatJson(readiness.placeholders.slice(0, 50))}</pre>
            </Card>
        </div>
    )
}

const SubmissionNotesPage = () => (
    <div className={classes.outputGrid}>
        <Card className={classes.card}>
            <h2 className={classes.cardTitle}>Competition submission scope</h2>
            <SafetyNotice />
            <p>
                RaDE for DHIS2 demonstrates a WHO SEARO-aligned rabies PEP decision-support workflow inside an installable DHIS2 App Platform app. It is designed for competition review, workflow demonstration, schema auditability, and Tracker payload readiness review.
            </p>
            <h3 className={classes.subheading}>What reviewers can evaluate</h3>
            <ul className={classes.compactList}>
                <li>Guided rabies exposure intake using the augmented schema and decision_support overlay.</li>
                <li>Derived and hidden WHO source questions that reduce duplicate data entry while preserving audit trace.</li>
                <li>Live recommendation summary with matched rule, rationale, actions, missing information, warnings, and debug trace.</li>
                <li>Tracker payload preview and DHIS2 validation-mode pathway for mapped deployments.</li>
                <li>Metadata readiness checks that block scaffold placeholder IDs from being treated as production-ready.</li>
            </ul>
        </Card>

        <Card className={classes.card}>
            <h2 className={classes.cardTitle}>Limitations before real use</h2>
            <LimitationsList />
            <h3 className={classes.subheading}>Required before deployment</h3>
            <ul className={classes.compactList}>
                <li>Map all DHIS2 metadata to the target instance and remove RADE_* / PLACEHOLDER_* scaffold IDs.</li>
                <li>Validate payloads with the target DHIS2 instance before any import path is enabled.</li>
                <li>Reconcile rule wording and management pathways with local public health policy.</li>
                <li>Complete clinical, public-health, privacy, security, sharing, and role-based access review.</li>
                <li>Document local operating procedures for who may use the tool and who signs off final management.</li>
            </ul>
            <div className={classes.warnBox}>
                The app should be presented as decision support and workflow support only. It must not be represented as a final clinical management authority.
            </div>
        </Card>
    </div>
)

const App = () => {
    const { loading, config, error } = useAppConfig()
    const [activePage, setActivePage] = useState('intake')
    const [answers, setAnswers] = useState({})
    const [mappingText, setMappingText] = useState('')
    const [output, setOutput] = useState(null)

    const parsedMapping = parseMappingJson(mappingText)

    const runDemo = (decisionResult = null) => {
        const demoOutput = buildLocalDemoOutput(
            intakeSchema,
            answers,
            parsedMapping.mapping,
            config || {},
            decisionResult
        )
        setOutput(demoOutput)
        setActivePage('output')
    }

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    return (
        <div className={classes.container}>
            <header className={classes.header}>
                <div>
                    <h1 className={classes.title}>RaDE for DHIS2</h1>
                    <p className={classes.subtitle}>
                        Rabies exposure decision support for DHIS2 Tracker
                    </p>
                    <p className={classes.valueProp}>
                        Use structured exposure data to surface missing information, WHO SEARO-aligned recommendations, rationale, follow-up task suggestions, and Tracker-compatible outputs.
                    </p>
                </div>
                <div className={classes.headerMeta}>
                    <Tag>Workflow package: Rabies exposure</Tag>
                    <Tag>Decision schema: v{intakeSchema.version}</Tag>
                    <Tag>Demo Tracker program: {config?.programName || 'Animal Exposure Tracker'}</Tag>
                </div>
            </header>

            <div className={classes.valueGrid}>
                {valueCards.map((card) => (
                    <div key={card.title} className={classes.valueCard}>
                        <h2>{card.title}</h2>
                        <p>{card.text}</p>
                    </div>
                ))}
            </div>

            <DemoNotice />

            <EvidencePanel />

            {error && (
                <div className={classes.warnBox}>
                    DHIS2 dataStore app config is not loaded. The intake and demo payload workflow still runs locally; push app config for instance-specific defaults.
                </div>
            )}

            <SafetyNotice />

            <nav className={classes.tabs}>
                {pages.map((page) => (
                    <button
                        key={page.id}
                        className={`${classes.tabButton} ${activePage === page.id ? classes.activeTab : ''}`}
                        type="button"
                        onClick={() => setActivePage(page.id)}
                    >
                        {page.label}
                    </button>
                ))}
            </nav>

            <div className={classes.content}>
                {activePage === 'intake' && (
                    <RabiesIntakePage
                        answers={answers}
                        setAnswers={setAnswers}
                        onRun={runDemo}
                        output={output}
                    />
                )}
                {activePage === 'output' && <OutputPage output={output} />}
                {activePage === 'mapping' && (
                    <MappingPage mappingText={mappingText} setMappingText={setMappingText} />
                )}
                {activePage === 'submission' && <SubmissionNotesPage />}
            </div>
        </div>
    )
}

export default App
