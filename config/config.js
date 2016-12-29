module.exports = {
    secretKey: '12345-67890-09876-54321',
    accessTokenLifetime: 3600,
    
    logger: {
        errorLogFile: __dirname + '/../logs/errors.log',
        level: 'error', // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
        
        email: {
            enable: false, // true, false
            to: 'raphtv@gmail.com',
            from: 'ethapi@democrypt.com',
            host: 'localhost',
            level: 'error', // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
        }
        
    },
    
    database: {
        url: 'mongodb://localhost:27017',
        db: 'ethapidb'
    },
    
    ethereum: {
        default_account_address: '0xbcd897f0dc45d10ee7de883a6d488993074d7bad',
        default_account_password: 'W377farkas00',
        callback_only_confirmed: 1,
        confirmations: 6,
        timeout: 60, // In minutes
        nodes: [
            'http://ethtest1.charonne.local:8547',
            'http://ethtest1.charonne.local:8545'
        ],
        balance_limit: 2, // Ether
    }
}
