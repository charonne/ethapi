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

// Users methods
Script.prototype.users = function() {
    logger.info('Users list');
    logger.info(arg1);
    
    Account.find({}, function (err, accounts) {
        if(err) return next(err);
        console.log(accounts);
        process.exit(1);
    });
};


// Users methods
Script.prototype.userPassword = function(username, password) {
    logger.info('Change password for user: ' + username);
    
    Account.findOne({'username': username}, function (err, account) {
        if(err) return next(err);
        
        if (account) {
            Account.update({'_id': account._id}, {'$set': {
                'password': password
            }}, function(err, resp) {
                console.log('Password updated');
                process.exit(1);
            });
            
        } else {
            logger.error('User not found');
            process.exit(1);
        }
    });
};


if (typeof(process.argv[2]) == "undefined") {
    logger.error('No command');
    process.exit(1);
}

var command = process.argv[2];

switch (command) {
    case 'users':
        var script = new Script();
        script.users();
        break;
    case 'user:password':
        var arg1 = process.argv[3];
        var arg2 = process.argv[4];
        var script = new Script();
        script.userPassword(arg1, arg2);
        break;
    default: 
        logger.error('Not a valid command: ' + command);
        break;
}
