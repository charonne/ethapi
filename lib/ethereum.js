// Web3 setup
var Web3 = require('web3');
var web3 = new Web3();
var solc = require('solc');

var Personal = require('web3/lib/web3/methods/personal');
var personal = new Personal(web3);

var Transaction = require('../models/transaction');

var config = require('../config/config');
var logger = require('../lib/logger');

var method = Ethereum.prototype;


function Ethereum() {
    this.contract = null;
    
    // Get active node
    method.getNode();
}

// Get account
method.getAccount = function(transaction) {
    this.account_address = transaction.account.account_address;
    this.account_password = transaction.account.account_password;
    
    // Check balance
    var balance = method.balance(this.account_address);
    if (balance.balance > config.ethereum.balance_limit) {
        logger.log("info", "Current account balance is more than " + config.ethereum.balance_limit + " Ether on " + transaction.account.account_address + ": " + balance.balance);
    } else {
        logger.log("error", "Current account balance is less than " + config.ethereum.balance_limit + " Ether on " + transaction.account.account_address + ": " + balance.balance);
    }
}

// Get active node
method.getNode = function() {
    for(var k in config.ethereum.nodes) {
        var node = config.ethereum.nodes[k];
        web3.setProvider(new web3.providers.HttpProvider(node));
        logger.log("info", 'Connected to node ' + node);
        
        try {
            var listening = web3.net.listening;
            logger.log("info", 'Node is listening');
            return 1;
        }
        catch(err) {
            logger.log("error", 'Node is not listening', { node: node });
        }
    }
    
    var error = 'No node are listening';
    logger.log("error", error);
    return new Error(error);
}

// Get node infos
method.getInfos = function() {
    var current_block_number = web3.eth.blockNumber;
    
    logger.log("info", "------------ Infos ------------");
    logger.log("info", "Current block number: " + current_block_number);
    logger.log("info", "-------------------------------");
}

// Set contract
method.setContract = function(contract) {
    this.contract = contract;
}

// Compile contract
method.compile = function(contract_source, callback) {
    var output = solc.compile(contract_source, 1); // 1 activates the optimiser
    
    if (output.errors) {
        logger.log("error", output.errors);
        return callback(new Error(output.errors));
    }
    
    for (var contractName in output.contracts) {
        // Response
        this.contract = { 
            "name": contractName,
            "source": contract_source,
            "bytecode": output.contracts[contractName].bytecode,
            "interface": output.contracts[contractName].interface
        };
    }
    return callback(null, {status: 'success'});
}

// Get informations
method.getInformations = function(tx, callback) {
    method.getTransaction(tx, function (resp) {
        if (resp) {
            informations = {};
            informations.blockNumber = resp.blockNumber;
            informations.nonce = resp.nonce;
            informations.confirmations = web3.eth.blockNumber - resp.blockNumber;
            // Return confirmations
            callback(null, informations);
        } else {
            callback({status: 'error'});
        }
    })
}

// Get transaction
method.getTransaction = function(tx, callback) {
    web3.eth.getTransaction(tx, function (err, resp) {
        if(err) return new Error(err);
        // Return resp
        return callback(resp);
    })
}

// Get transaction receipt
method.getTransactionReceipt = function(tx, callback) {
    web3.eth.getTransactionReceipt(tx, function (err, resp) {
        if(err) return new Error(err);
        // return resp;
        return callback(resp);
    })
}

// Create contract
method.create = function(transaction, callback) {
    // Get account
    method.getAccount(transaction);
    
    // Call contract
    var gasprice = web3.eth.gasPrice.toString(10);
    
    // Unlock
    var unlock = personal.unlockAccount(this.account_address, this.account_password, 60);
    logger.log("info", "unlock: " + unlock + ', for: ' + this.account_address);
    
    // Format interface
    var interface = JSON.parse(this.contract.interface);
    
    // New contract
    var newContract = web3.eth.contract(interface);
    
    // Set data
    var contractData = [];
    
    // Params
    var params = JSON.parse(transaction.params);
    var escapeParams = [];
    for(var k in params) {
        escapeParams[k] = escape(params[k]);
    }
    contractData['params'] =  '"' + escapeParams.join('","') + '"';
    
    // Tx_data
    contractData['tx_data'] = 
        {
            from: this.account_address,
            data: this.contract.bytecode,
            gas: 800000,
            gasPrice: gasprice
        };
    
    // Callback
    contractData['callback'] = 
        function(err, newcontract) {
            if(!err) {
                if(!newcontract.address) {
                    logger.log("info", "tx: " + newcontract.transactionHash) // The hash of the transaction, which deploys the contract
                    // Set transaction
                    Transaction.update({'_id': transaction.id}, {'$set': {
                        'tx_hash': newcontract.transactionHash
                    }}, function(err, resp) {
                        // callback(newcontract.transactionHash);
                    });
                } else {
                    logger.log("info", "addr: " + newcontract.address) // The contract address
                    // Set transaction
                    Transaction.update({'_id': transaction.id}, {'$set': {
                        'contract_address': newcontract.address
                    }}, function(err, resp) {
                        // callback(resp);
                        logger.log("info", "==============================================>");
                        logger.log("info", "tx: " + newcontract.transactionHash + "contractaddress: " + newcontract.address);
                        
                        callback({"tx_hash": newcontract.transactionHash, "contract_address": newcontract.address});
                    });
                }
            }
        };
    
    // Contract creation
    eval(`newContract.new(
        ` + contractData['params'] + `,
        ` + JSON.stringify(contractData['tx_data']) + `,
        ` + contractData['callback'].toString() + `
    )`);
}

// Exec contract
method.exec = function(transaction, callback) {
    logger.log("info", "Contract address: " + transaction.contract_address);
    
    // Get account
    method.getAccount(transaction);
    
    // Unlock
    var unlock = personal.unlockAccount(this.account_address, this.account_password, 60);
    logger.log("info", "unlock: " + unlock);
    
    // Format interface
    var interface = JSON.parse(this.contract.interface);
    
    var contract = web3.eth.contract(interface).at(transaction.contract_address);
    var gasprice = web3.eth.gasPrice.toString(10);
    logger.log("info", "Gasprice " + gasprice);
    
    // Set data
    var contractData = [];
    
    // Method
    if (!transaction.method) {
        // Set status error
        Transaction.update({'_id': transaction.id}, {'$set': {
            'status': -1
        }}, function(err, resp) {
            return callback("error not method");
        });
    }
    
    
    contractData['method'] = transaction.method;
    
    // Params
    var params = JSON.parse(transaction.params);
    var escapeParams = [];
    for(var k in params) {
        escapeParams[k] = escape(params[k]);
    }
    contractData['params'] =  '"' + escapeParams.join('","') + '"';
    
    // Tx_data
    contractData['tx_data'] = 
        {
            from: this.account_address,
            gas: 450000,
            gasPrice: gasprice
        };
    
    // Callback
    contractData['callback'] = 
        function(err, tx_hash) {
            logger.log("info", "Method " + contractData['method'] + " executed: " + tx_hash);
            // Set transaction
            Transaction.update({'_id': transaction.id}, {'$set': {
                'tx_hash': tx_hash
            }}, function(err, resp) {
                return callback(tx_hash);
            });
        };
    
    // Exec contract
    eval(`contract.` + contractData['method'] + `(
        ` + contractData['params'] + `,
        ` + JSON.stringify(contractData['tx_data']) + `,
        ` + contractData['callback'].toString() + `
    )`);
}


// Call contract
method.call = function(transaction, callback) {
    return callback("okayyyy");
}
// Get balance
method.balance = function (address) {
    var balanceData = web3.eth.getBalance(address);
    var balance_wei = balanceData.toString(10);
    var balance = web3.fromWei(balance_wei, 'ether');
    
    // Response
    var json = { 
        address: address,
        balance: balance,
        balance_wei: balance_wei
    };
    return json;
}


module.exports = Ethereum;
