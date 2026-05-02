import React from 'react'
import { CenteredContent, NoticeBox } from '@dhis2/ui'
import classes from './ConfigError.module.css'

export const ConfigError = ({ error }) => {
    const isNotFound =
        error?.message?.includes('404') ||
        error?.message?.includes('not found') ||
        error?.message?.includes('Namespace')

    return (
        <CenteredContent>
            <div className={classes.container}>
                <h1 className={classes.title}>RaDE: Rabies Exposure Decision Support</h1>
                <NoticeBox
                    error={!isNotFound}
                    warning={isNotFound}
                    title={
                        isNotFound
                            ? 'Configuration not found'
                            : 'Configuration error'
                    }
                >
                    {isNotFound ? (
                        <>
                            <p>
                                The app config has not been pushed to the DHIS2
                                dataStore yet.
                            </p>
                            <p>To configure this instance, run:</p>
                            <pre className={classes.code}>
                                {`python3 scripts/push-datastore-config.py \\
    config/your-instance.json \\
    --url http://your-dhis2-instance \\
    --user admin`}
                            </pre>
                            <p>
                                See <code>rade-dhis2-app/README.md</code> for
                                full setup instructions.
                            </p>
                        </>
                    ) : (
                        <>
                            <p>{error?.message || 'Unknown error loading config'}</p>
                            <p>
                                Check the dataStore key{' '}
                                <code>rade-dhis2/config</code> and ensure all
                                required fields are present.
                            </p>
                        </>
                    )}
                </NoticeBox>
            </div>
        </CenteredContent>
    )
}
