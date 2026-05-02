export const validateTrackerPayload = async (engine, trackerPayload) => {
    if (!engine) {
        throw new Error('DHIS2 app runtime data engine is not available.')
    }
    if (!trackerPayload) {
        throw new Error('Generate a Tracker payload before validation.')
    }

    return engine.mutate({
        resource: 'tracker',
        type: 'create',
        params: {
            importMode: 'VALIDATE',
        },
        data: trackerPayload,
    })
}
