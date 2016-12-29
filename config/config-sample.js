module.exports = {
    secretKey: '12345-67890-09876-54321',
    accessTokenLifetime: 3600,
    
    logger: {
        errorLogFile: __dirname + '/../logs/errors.log',
        level: 'error', // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
        
        email: {
            enable: false, // true, false
            to: 'to@domain.tld>',
            from: '<noreply@domain.tld>',
            host: 'localhost',
            level: 'error', // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
        }
        
    },
    
    database: {
        url: 'mongodb://localhost:27017',
        db: 'ethapidb'
    },
    
    ethereum: {
        default_account_address: '<default_account_address>',
        default_account_password: '<default_account_password>',
        callback_only_confirmed: 1,
        confirmations: 6,
        timeout: 60, // In minutes
        nodes: [
            'http://<node1:port>',
            'http://<node2:port>',
        ],
        balance_limit: 2, // Ether
    }
}
