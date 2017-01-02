module.exports = {
    // Auth configuration
    secretKey: '12345-67890-09876-54321',
    accessTokenLifetime: 3600,
    
    // Log configuration
    logger: {
        errorLogFile: __dirname + '/../logs/errors.log',
        level: 'error', // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
        // Alert email configuration
        email: {
            enable: false, // true, false
            to: '<to@domain.tld>',
            from: '<noreply@domain.tld>',
            host: 'localhost',
            level: 'error', // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
        }
        
    },
    
    // Database configuration
    database: {
        url: 'mongodb://localhost:27017',
        db: 'ethapidb'
    },
    
    // Ethereum configuration
    ethereum: {
        // Default Ethereum account on Nodes
        default_account_address: '<default_account_address>',
        default_account_password: '<default_account_password>',
        // One callback only when confirmed, or Two callback when is not confirmed then confirmed
        callback_only_confirmed: false, // true, false
        // Total number of confirmations to get
        confirmations: 6,
        // Timeout of the transaction
        timeout: 60, // In minutes
        // List of nodes
        nodes: [
            'http://<node1:port>',
            'http://<node2:port>',
        ],
        // Alert when account address is below the limit
        balance_limit: 2, // Ether
    },
    
    // Workers
    workers: {
        enable: true // true, false
    }
}
