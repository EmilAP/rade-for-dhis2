import { useDataQuery } from '@dhis2/app-runtime'

/**
 * Fetch app config from the DHIS2 dataStore.
 *
 * Namespace: rade-dhis2
 * Key:       config
 *
 * The config is pushed to the dataStore during deployment by the
 * push-datastore-config.py script (or deploy.sh pipeline).
 * It contains only the fields the app needs at runtime — no secrets.
 */
const CONFIG_QUERY = {
    config: {
        resource: 'dataStore/rade-dhis2/config',
    },
}

export const useAppConfig = () => {
    const { loading, error, data } = useDataQuery(CONFIG_QUERY)

    if (loading) {
        return { loading: true, config: null, error: null }
    }

    if (error) {
        return { loading: false, config: null, error }
    }

    const config = data?.config

    // Basic presence validation — the app should not crash on partial config
    const missing = []
    if (!config?.programId) missing.push('programId')
    if (!config?.programName) missing.push('programName')

    if (missing.length > 0) {
        return {
            loading: false,
            config,
            error: new Error(
                `Incomplete config: missing ${missing.join(', ')}. ` +
                    'Run push-datastore-config.py to update the dataStore.'
            ),
        }
    }

    return { loading: false, config, error: null }
}
