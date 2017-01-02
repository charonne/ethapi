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
method.clientCallback = function (callbackUrl, requestData) {
    try {
        if (callbackUrl) {
            logger.log("info", "Callback call: " + callbackUrl);
            logger.log("info", "Data:" + JSON.stringify(requestData));
            
            // Call
            request(
                {
                    url: callbackUrl,
                    method: "POST",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                    },
                    body: requestData
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        logger.log("info", "Callback client response success");
                        logger.log("info", body);
                    }
                });
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
        ethereum.create(transaction, function(tx_hash) {
            // Transaction is processed
            Transaction.update({'_id': transaction.id}, {'$set': {
                'processed': 1
            }}, function(err, resp) {
                logger.log("info", 'transaction processed');
            });
            // Callback
            if (config.ethereum.callback_only_confirmed == 0) {
                method.clientCallback(transaction.account.callback, { 'action':'create', 'confirmed':0, 'tx_id': transaction._id, 'tx_hash': transaction.tx_hash });
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
            ethereum.exec(transaction, function(tx_hash) {
                // Transaction is processed
                Transaction.update({'_id': transaction.id}, {'$set': {
                    'processed': 1
                }}, function(err, resp) {
                    logger.log("info", 'transaction processed');
                });
                // Callback
                if (config.ethereum.callback_only_confirmed == false) {
                    return method.clientCallback(transaction.account.callback, { 'action':'exec', 'confirmed':0, 'tx_id': transaction._id, 'tx_hash': tx_hash });
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
    logger.log("info", 'Check confirmations');
    ethereum = new Ethereum();
    ethereum.getInformations(transaction.tx_hash, function (informations) {
        if (informations.confirmations >= config.ethereum.confirmations) {
            logger.log("info", 'Tx verified: ' + informations.confirmations + ' confirmations');
            Transaction.update({'_id': transaction.id}, {'$set': {
                'nonce': informations.nonce, 'verified': 1, 'status': 1
            }}, function(err, resp) {
                logger.log("info", "Tx confirmed");
                
                // Callback
                return method.clientCallback(transaction.account.callback, { 'action':'exec', 'confirmed':1, 'tx_id': transaction._id, 'tx_hash': transaction.tx_hash });
            });
        } else {
            logger.log("info", 'Tx not verified: ' + informations.confirmations + ' confirmations');
        }
    });
    
    // Check timeout
    logger.log("info", 'Check timeout');
    var now = new Date();
    var timeoutAt = new Date(transaction.createdAt);
    timeoutAt.setMinutes(timeoutAt.getMinutes() + config.ethereum.timeout);
    
    if (now >= timeoutAt) {
        Transaction.update({'_id': transaction.id}, {'$set': {
                'status': -1
            }}, function(err, resp) {
                logger.log("error", "Tx " + transaction._id + " timeout at " + timeoutAt + ", now is: " + now);
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