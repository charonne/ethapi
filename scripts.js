var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var schedule = require('node-schedule');

var logger = require('./lib/logger');
var config = require('./config/config');
var Account = require('./models/account');
var Contract = require('./models/contract');
var Transaction = require('./models/transaction');

// Mongo
mongoose.Promise = global.Promise;
mongoose.connect(config.database.url + '/' + config.database.db);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // We're connected!
    logger.log("info", "Connected correctly to database");
});

// Title
console.log("/*************************\n * EthApi blockchain scripts v0.1\n*************************/");

// Constructor
function Script() {
    
}

// Users list
Script.prototype.users = function() {
    logger.info('Users list');
    
    Account.find({}, function (err, accounts) {
        if(err) return next(err);
        console.log(accounts);
        process.exit(1);
    });
};

// Users update
Script.prototype.userUpdate = function(username, field, value) {
    logger.info("Change '" + field + "' for user: " + username);
    
    Account.findOne({'username': username}, function (err, account) {
        if(err) return next(err);
        
        if (account) {
            if (account[field]) {
                // Set data
                var data = {};
                data[field] = value;
                
                // Update data
                Account.update({'_id': account._id}, {'$set': data}, function(err, resp) {
                    if(err) return next(err);
                    
                    console.log(field + " updated");
                    process.exit(1);
                });
            } else {
                logger.error('Field not found');
                process.exit(1);
            }
        } else {
            logger.error('User not found');
            process.exit(1);
        }
    });
};


// Transaction reset
Script.prototype.transactionReset = function(id) {
    logger.info('Transaction reset: ' + id);
    
    // Set data
    var data = {};
    data['process'] = 0;
    data['tx_hash'] = null;
    data['status'] = 0;
    
    Transaction.update({'_id': id}, {'$set': data}, function(err, resp) {
        if(err) return next(err);
        
        console.log("Transaction reseted");
        process.exit(1);
    });
};


// Users delete
Script.prototype.userUpdate = function(id) {
    logger.info("Delete user: " + id);
    
    Account.remove({ _id: id }, function (err, resp) {
        if(err) return next(err);
        logger.info("Deleted");
        process.exit(1);
    })
};

// Check command
if (typeof(process.argv[2]) == "undefined") {
    logger.error('No command');
    process.exit(1);
}

var command = process.argv[2];

logger.error(command);

switch (command) {
    case 'users:list':
        var script = new Script();
        script.users();
        break;
    case 'user:update':
        var arg1 = process.argv[3];
        var arg2 = process.argv[4];
        var arg3 = process.argv[5];
        var script = new Script();
        script.userUpdate(arg1, arg2, arg3);
        break;
    case 'user:delete':
        var arg1 = process.argv[3];
        var script = new Script();
        script.userDelete(arg1);
        break;
    case 'transaction:reset':
        var arg1 = process.argv[3];
        var script = new Script();
        script.transactionReset(arg1);
        break;
    default: 
        logger.error('Not a valid command: ' + command);
        break;
}
