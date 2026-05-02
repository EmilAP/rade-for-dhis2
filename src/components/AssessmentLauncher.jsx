import React from 'react'
import { Button, Card, IconAdd24 } from '@dhis2/ui'
import { buildCaptureUrl } from '../services/captureUrl'
import classes from './AssessmentLauncher.module.css'

export const AssessmentLauncher = ({ config }) => {
    const handleStart = () => {
        const url = buildCaptureUrl(config)
        window.location.href = url
    }

    return (
        <Card className={classes.card}>
            <h2 className={classes.heading}>Animal Exposure Assessment</h2>
            <p className={classes.description}>
                Open the DHIS2 Capture app to register a new case or continue
                an existing assessment using the{' '}
                <strong>{config.programName}</strong> program.
            </p>
            <Button
                primary
                large
                icon={<IconAdd24 />}
                onClick={handleStart}
                className={classes.button}
            >
                Start New Assessment
            </Button>
            <p className={classes.hint}>
                Opens Capture → {config.programName}
            </p>
        </Card>
    )
}
