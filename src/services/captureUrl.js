/**
 * Resolve the DHIS2 server base URL from the current page location.
 *
 * DHIS2 apps are served at either:
 *   /apps/<appName>/...          (DHIS2 ≥ 2.42 bundled + custom apps)
 *   /api/apps/<appName>/...      (older custom app path)
 *   /dhis-web-<appName>/...      (legacy core apps)
 *
 * We strip the app-specific suffix to get the server root.
 */
const getBaseUrl = () => {
    const { origin, pathname } = window.location

    // Match /apps/<name> or /api/apps/<name>
    const appsMatch = pathname.match(/^(.*?)\/(?:api\/)?apps\/[^/]+/)
    if (appsMatch) {
        return `${origin}${appsMatch[1]}`
    }

    // Match /dhis-web-<name>
    const legacyMatch = pathname.match(/^(.*?)\/dhis-web-[^/]+/)
    if (legacyMatch) {
        return `${origin}${legacyMatch[1]}`
    }

    // Fallback: assume server root
    return origin
}

/**
 * Build a deep link URL into the DHIS2 Capture app.
 *
 * All parameters come from instance config — no hard-coded UIDs.
 *
 * DHIS2 ≥ 2.42 serves Capture at /apps/capture
 * Older versions serve it at /dhis-web-capture
 * We use the new path and let DHIS2 redirect if needed.
 *
 * @param {Object} config - App config from dataStore
 * @param {Object} [options] - Optional overrides
 * @param {string} [options.orgUnitId] - Specific org unit to pre-select
 * @returns {string} Absolute URL to the Capture app
 */
export const buildCaptureUrl = (config, options = {}) => {
    if (!config?.programId) {
        throw new Error('programId is required in config to build Capture URL')
    }

    const base = getBaseUrl()
    const params = new URLSearchParams()
    params.set('programId', config.programId)

    if (options.orgUnitId) {
        params.set('orgUnitId', options.orgUnitId)
    } else if (config.defaultOrgUnit) {
        params.set('orgUnitId', config.defaultOrgUnit)
    }

    return `${base}/dhis-web-capture/#/?${params.toString()}`
}

/**
 * Build a deep link URL to register/enroll a new tracked entity.
 *
 * @param {Object} config - App config from dataStore
 * @param {string} orgUnitId - Org unit UID (required for enrollment)
 * @returns {string} Absolute URL to the Capture enrollment screen
 */
export const buildEnrollmentUrl = (config, orgUnitId) => {
    if (!config?.programId) {
        throw new Error('programId is required in config')
    }
    if (!orgUnitId) {
        throw new Error('orgUnitId is required for enrollment')
    }

    const base = getBaseUrl()
    return `${base}/dhis-web-capture/#/new?programId=${encodeURIComponent(config.programId)}&orgUnitId=${encodeURIComponent(orgUnitId)}`
}
