/**
 * RaDE Integration Client
 *
 * This module provides the interface for communicating with the external
 * RaDE (Risk Assessment for Domestic Exposures) service.
 *
 * DEPLOYMENT PATTERNS:
 *
 * 1. DHIS2 Route (recommended for production):
 *    - Configure a DHIS2 Route that proxies to the RaDE API
 *    - Set config.radeIntegration.proxyRoute to the route path
 *    - Credentials are managed by DHIS2, never exposed to the frontend
 *    - Example route: /api/routes/<routeId>/run
 *
 * 2. Mock mode (current default):
 *    - Returns simulated responses for development/demo
 *    - No network calls are made
 *    - Suitable for competition demos and offline testing
 *
 * SECURITY:
 *   - No credentials are stored or transmitted by the frontend
 *   - All external calls go through the DHIS2 server (Route proxy)
 *   - No sensitive data is logged to the console
 *
 * REQUIRED CONFIG FIELDS (in dataStore rade-dhis2/config):
 *   radeIntegration.enabled    - boolean, master toggle
 *   radeIntegration.proxyRoute - string, DHIS2 route path
 *   radeIntegration.mockMode   - boolean, use mock responses
 */

const MOCK_DELAY_MS = 800

const createMockResponse = () => ({
    status: 'completed',
    riskLevel: 'moderate',
    recommendation:
        'Post-exposure prophylaxis recommended. Refer to nearest treatment center.',
    timestamp: new Date().toISOString(),
    assessmentId: 'mock-' + Math.random().toString(36).slice(2, 10),
})

/**
 * Run a risk assessment against the RaDE service.
 *
 * @param {Object} config - App config containing radeIntegration settings
 * @param {Object} payload - Assessment data to send
 * @param {Object} [engine] - DHIS2 DataEngine instance (for route-based calls)
 * @returns {Promise<Object>} Assessment result
 */
export const runAssessment = async (config, payload, engine) => {
    if (!config?.radeIntegration?.enabled) {
        throw new Error('RaDE integration is not enabled in config')
    }

    // Mock mode: return simulated response
    if (config.radeIntegration.mockMode) {
        await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
        return createMockResponse()
    }

    // Route mode: call via DHIS2 Route proxy
    const route = config.radeIntegration.proxyRoute
    if (!route) {
        throw new Error(
            'radeIntegration.proxyRoute is required when mockMode is false. ' +
                'Configure a DHIS2 Route pointing to your RaDE API.'
        )
    }

    /**
     * DHIS2 Route integration point:
     *
     * When a DHIS2 Route is configured, the request is proxied server-side.
     * The DHIS2 server handles authentication with the RaDE API — no secrets
     * are exposed to the browser.
     *
     * Expected setup:
     *   1. Create a Route in DHIS2 pointing to your RaDE API
     *   2. Set the route UID or path in config.radeIntegration.proxyRoute
     *   3. The app POSTs assessment data to the route
     *   4. DHIS2 proxies to the RaDE API with server-managed credentials
     */
    if (!engine) {
        throw new Error(
            'DataEngine instance is required for route-based RaDE calls. ' +
                'Pass the engine from useDataEngine().'
        )
    }

    const mutation = {
        resource: route,
        type: 'create',
        data: payload,
    }

    return engine.mutate(mutation)
}

/**
 * Check if RaDE integration is available and properly configured.
 *
 * @param {Object} config - App config
 * @returns {{ available: boolean, mode: string, message: string }}
 */
export const checkRadeStatus = (config) => {
    if (!config?.radeIntegration?.enabled) {
        return {
            available: false,
            mode: 'disabled',
            message: 'RaDE integration is not enabled',
        }
    }

    if (config.radeIntegration.mockMode) {
        return {
            available: true,
            mode: 'mock',
            message: 'Running in mock mode (simulated responses)',
        }
    }

    if (!config.radeIntegration.proxyRoute) {
        return {
            available: false,
            mode: 'misconfigured',
            message: 'proxyRoute is required when mockMode is disabled',
        }
    }

    return {
        available: true,
        mode: 'live',
        message: `Connected via DHIS2 Route: ${config.radeIntegration.proxyRoute}`,
    }
}
