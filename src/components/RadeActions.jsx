import React, { useState } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import { Button, Card, IconSync24, IconList24 } from '@dhis2/ui'
import { runAssessment, checkRadeStatus } from '../services/radeClient'
import classes from './RadeActions.module.css'

export const RadeActions = ({ config }) => {
    const engine = useDataEngine()
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const radeStatus = checkRadeStatus(config)

    const handleTestCall = async () => {
        setLoading(true)
        setError(null)
        setResult(null)
        try {
            const response = await runAssessment(
                config,
                { test: true, timestamp: new Date().toISOString() },
                engine
            )
            setResult(response)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className={classes.card}>
            <h2 className={classes.heading}>RaDE Integration</h2>

            <div className={classes.actions}>
                <Button
                    icon={<IconSync24 />}
                    onClick={handleTestCall}
                    loading={loading}
                    disabled={!radeStatus.available}
                >
                    Run Test RaDE Call
                </Button>
            </div>

            {error && (
                <div className={classes.error}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div className={classes.result}>
                    <h3 className={classes.resultHeading}>
                        <IconList24 />
                        Last Result
                    </h3>
                    <dl className={classes.resultList}>
                        <dt>Status</dt>
                        <dd>{result.status}</dd>
                        <dt>Risk level</dt>
                        <dd>{result.riskLevel}</dd>
                        <dt>Recommendation</dt>
                        <dd>{result.recommendation}</dd>
                        <dt>Assessment ID</dt>
                        <dd className={classes.mono}>{result.assessmentId}</dd>
                        <dt>Timestamp</dt>
                        <dd>{result.timestamp}</dd>
                    </dl>
                </div>
            )}

            {!radeStatus.available && (
                <p className={classes.hint}>{radeStatus.message}</p>
            )}
        </Card>
    )
}
