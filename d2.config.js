const config = {
    type: 'app',
    name: 'rade-for-dhis2',
    title: 'RaDE for DHIS2',
    description:
        'Rabies exposure intake, local demo decision support, Tracker payload generation, and metadata readiness checks for DHIS2.',
    entryPoints: {
        app: './src/App.jsx',
    },
    minDHIS2Version: '2.40',
}

module.exports = config
