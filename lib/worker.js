var request = require('request');

var Contract = require('../models/contract');
var Transaction = require('../models/transaction');
var Ethereum = require("../lib/ethereum");

var config = require('../config/config');
var logger = require('../lib/logger');

var method = Worker.prototype;

function Worker() {
    
}

// Callback
method.callback = function (callbackUrl, data) {
    try {
        if (callbackUrl) {
            logger.log("info", "Callback call: " + callbackUrl + " " + data);
            
            // Call
            request.post(
                callbackUrl,
                { json: data },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        logger.log("info", "Success");
                        logger.log("info", body);
                    }
                }
            );
        }
    } catch (e) {
        throw e;
    }
}

// Deploy contract
method.deploy = function (transaction) {
    logger.log("info", 'Deploy: ' + transaction.contract._id);
    
    // Create contract
    ethereum = new Ethereum();
    if (transaction.processed == 0) {
        ethereum.setContract(transaction.contract);
        ethereum.create(transaction, function(returnValue) {
            // Transaction is processed
            Transaction.update({'_id': transaction.id}, {'$set': {
                'processed': 1
            }}, function(err, transaction) {
                logger.log("info", 'transaction processed');
            });
            // Callback
            if (config.ethereum.callback_only_confirmed == 0) {
                method.callback(transaction.account.callback, { 'object':'tx', 'confirmed':0, 'tx_id': transaction._id, 'tx_hash': transaction.tx_hash });
            }
        });
    }
    
    // Verify transaction
    if (transaction.processed == 1 && transaction.contract_address) {
        method.verify(transaction);
    }
}

// Exec tx
method.exec = function (transaction) {
    
    logger.log("info", 'Exec: ' + transaction._id);
    // Get tx
    Transaction.findById(transaction._id)
        .populate('contract account')
        .exec(function (err, transaction, next) {
        if(err) return next(err);
        
        // Exec contract
        ethereum = new Ethereum();
        if (transaction.processed == 0) {
            ethereum.setContract(transaction.contract);
            ethereum.exec(transaction, function(returnValue) {
                // Transaction is processed
                Transaction.update({'_id': transaction.id}, {'$set': {
                    'processed': 1
                }}, function(err, transaction) {
                    logger.log("info", 'transaction processed');
                });
                // Callback
                if (config.ethereum.callback_only_confirmed == 0) {
                    method.callback(transaction.account.callback, { 'object':'tx', 'confirmed':0, 'tx_id': transaction._id, 'tx_hash': transaction.tx_hash });
                }
            });
        }
    });
    
    // Verify transaction
    if (transaction.processed == 1) {
        method.verify(transaction);
    }
}

// Get enough confirmations
method.verify = function (transaction) {
    // Check confirmations
    ethereum = new Ethereum();
    ethereum.getInformations(transaction.tx_hash, function (informations) {
        if (informations.confirmations >= config.ethereum.confirmations) {
            logger.log("info", 'Tx verified: ' + informations.confirmations + ' confirmations');
            Transaction.update({'_id': transaction.id}, {'$set': {
                'nonce': informations.nonce, 'verified': 1, 'status': 1
            }}, function(err, transaction) {
                logger.log("info", "Tx confirmed");
                
                // Callback
                if (config.ethereum.callback_only_confirmed == 0) {
                    method.callback(transaction.account.callback, { 'object':'tx', 'confirmed':1, 'tx_id': transaction._id, 'tx_hash': transaction.tx_hash });
                }
            });
        } else {
            logger.log("info", 'Tx not verified: ' + informations.confirmations + ' confirmations');
        }
    });
    
    // Check timeout
    var check = new Date(transaction.createdAt);
    var now = new Date();
    check.setMinutes(check.getMinutes() + config.ethereum.timeout);
    if (check >= now) {
        Transaction.update({'_id': transaction.id}, {'$set': {
                'status': -1
            }}, function(err, transaction) {
                logger.log("info", "Tx timeout");
                return -1;
            });
    }
}

// Process all transactions
method.process = function () {
    logger.log("info", '------------------------------------------------------');
    logger.log("info", 'Start processing');
    
    ethereum = new Ethereum();
    ethereum.getInfos();
    
    // Get all tx
    Transaction.find({status: 0})
        .populate('contract account')
        .exec(function (err, transactions) {
        if(err) return next(err);
        
        transactions.forEach(function(transaction) {
            logger.log("info", 'Process Tx: ' + transaction.type);
            
            switch(transaction.type) {
                case 'contract':
                    method.deploy(transaction);
                    break;
                case 'exec':
                    method.exec(transaction);
                    break;
            }
            
        },  this);
    })
}


module.exports = Worker;