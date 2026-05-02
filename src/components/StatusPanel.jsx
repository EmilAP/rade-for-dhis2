import React from 'react'
import {
    Card,
    IconCheckmarkCircle24,
    IconCross24,
    IconInfo24,
    Tag,
} from '@dhis2/ui'
import { checkRadeStatus } from '../services/radeClient'
import classes from './StatusPanel.module.css'

const StatusRow = ({ label, ok, detail }) => (
    <div className={classes.row}>
        <span className={classes.icon}>
            {ok ? <IconCheckmarkCircle24 /> : <IconCross24 />}
        </span>
        <span className={classes.label}>{label}</span>
        <span className={classes.detail}>{detail}</span>
    </div>
)

export const StatusPanel = ({ config }) => {
    const radeStatus = checkRadeStatus(config)

    const stages = config.programStages
        ? Object.keys(config.programStages).length
        : 0

    return (
        <Card className={classes.card}>
            <h2 className={classes.heading}>System Status</h2>

            <StatusRow
                label="Configuration"
                ok={true}
                detail="Loaded from dataStore"
            />
            <StatusRow
                label="Program"
                ok={!!config.programId}
                detail={config.programName || config.programId || 'Not set'}
            />
            <StatusRow
                label="Program stages"
                ok={stages > 0}
                detail={`${stages} stage${stages !== 1 ? 's' : ''} configured`}
            />
            <StatusRow
                label="RaDE integration"
                ok={radeStatus.available}
                detail={radeStatus.message}
            />

            {radeStatus.mode !== 'disabled' && (
                <div className={classes.tag}>
                    <Tag>{radeStatus.mode === 'mock' ? 'Mock mode' : 'Live'}</Tag>
                </div>
            )}

            {config.instanceName && (
                <div className={classes.instance}>
                    <IconInfo24 />
                    <span>Instance: {config.instanceName}</span>
                </div>
            )}
        </Card>
    )
}
