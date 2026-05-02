const config = {
    type: 'app',
    name: 'rade-rabies-exposure',
    title: 'RaDE: Rabies Exposure Decision Support',
    description:
        'Rabies exposure intake, local rule-based decision support, Tracker payload preview, and metadata readiness checks for DHIS2.',
    entryPoints: {
        app: './src/App.jsx',
    },
    minDHIS2Version: '2.40',
}

module.exports = config
