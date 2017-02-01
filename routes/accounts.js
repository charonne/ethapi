var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');

var Account = require('../models/account');
var Verify = require('./verify');

var config = require('../config/config');
var logger = require('../lib/logger');

var router = express.Router();
router.use(bodyParser.json());

/* GET accounts listing. */
router.route('/')

    // .all(Verify.verifyAccount)

    .get(function(req, res, next) {
        Account.find({}, function (err, account) {
            if(err) return next(err);
            res.json(account);
        });
    })

// Account register
router.route('/register')

    /**
     * Account register
     * params: {"username":"<username>", "password":"<password>", "callback":"<callback_url>"}
     */
    .post(function(req, res, next) {
        
        // Set callback
        var callback = null;
        if (req.body.callback) {
            callback = req.body.callback;
        }
        
        // Account.register(new Account({ username : req.body.username }),
        Account.register(new Account(
            {
                'username' : req.body.username,
                'account_address': config.ethereum.default_account_address,
                'account_password': config.ethereum.default_account_password,
                'callback': callback
            }),
            req.body.password, function(err, account) {
                if (err) {
                    return res.status(500).json({err: err});
                }
                passport.authenticate('local')(req, res, function () {
                    return res.status(200).json({status: 'Registration Successful!'});
                })
        });
    })

// Account login
router.route('/login')

    /**
     * Account login
     * params: {"username":"<username>", "password":"<password>"}
     */
    .post(function(req, res, next) {
        passport.authenticate('local', function(err, account, info) {
            if (err) {
                return next(err);
            }
            if (!account) {
                return res.status(401).json({
                    err: info
                });
            }
            req.logIn(account, function(err) {
                if (err) {
                    return res.status(500).json({
                    err: 'Could not log in account'
                });
            }

            var token = Verify.getToken(account);
            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token
                });
            });
        })(req,res,next);
    })

// Account update
router.route('/update')
    
    /**
     * Account update
     * params: {"account_address":"<account_address>", "account_password":"<account_password>", "callback":"<callback_url>"}
     */
    .post(Verify.verifyAccount, function(req, res) {
        // Get account id
        var accountId = req.decoded._doc._id;
        
        // Get account data
        var account = {}
        if (req.body.account_address) {
            account.account_address = req.body.account_address;
        }
        if (req.body.account_password) {
            account.account_password = req.body.account_password;
        }
        if (req.body.callback) {
            account.callback = req.body.callback;
        }
        
        // If data, update
        if (Object.keys(account).length != 0) {
            Account.update({'_id': accountId}, {'$set': account}, function(err, account) {
                
                logger.log("info", account);
                res.status(200).json({
                    status: 'Account successfully updated'
                });
            });
        }
    })

// Account logout
router.route('/logout')

    .post(function(req, res, next) {
        req.logout();
        res.status(200).json({
            status: 'Bye!'
        });
    })


module.exports = router;