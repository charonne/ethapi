var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var Contract = require('../models/contract');
var Transaction = require('../models/transaction');
var Ethereum = require("../lib/ethereum");

var router = express.Router();
router.use(bodyParser.json());

var config = require('../config/config');
var logger = require('../lib/logger');


var Worker = require("../lib/worker");


// var Verify = require('./verify');

router.route('/workers')
    .get(function (req, res, next) {
        // Start worker
        worker = new Worker();
        worker.process();
        
        res.json({status:"success"});
    })
  
router.route('/callback')
    .post(function (req, res, next) {
        
        res.json({status:"success"});
    })

    
router.route('/')
    
    /**
     * Get all transaction
     */
    .get(function (req, res, next) {
        
        console.log(req.connection.remoteAddress);
        /*
        // Get tx
        Transaction.findById("5862eb7e9784f759edaa03dd")
            .populate('contract account')
            .exec(function (err, transaction, next) {
            if(err) return next(err);
            
            // Exec contract
            ethereum = new Ethereum();
            ethereum.getAccount(transaction);
        });
        */
    })
    
    
    
module.exports = router;