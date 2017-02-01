var express = require('express');
var bodyParser = require('body-parser');

var Contract = require('../models/contract');
var Transaction = require('../models/transaction');
var Ethereum = require("../lib/ethereum");

var router = express.Router();
router.use(bodyParser.json());

var Verify = require('./verify');

var logger = require('../lib/logger');

router.route('/')

    .all()
    
    /**
     * Get all contract
     */
    .get(function (req, res, next) {
        Contract.find({})
            // .populate('account')
            .exec(function (err, contracts) {
            if(err) return next(err);
            
            res.json(contracts);
        })
    })
    
    /**
     * Delete all contracts
     */
    .delete(function (req, res, next) {
        Contract.remove({}, function (err, resp) {
            if(err) return next(err);
            res.json(resp);
        })
    })
    
router.route('/create')

    .all(Verify.verifyAccount)
    
    /**
     * Create a contract
     * req.params: { "source": "<contract_source>"}
     */
    .post(function (req, res, next) {
        
        // Get source code
        var source = req.body.source;
        var source = source.replace(/\\n/g, "\n");
        
        // Get Ethereum
        ethereum = new Ethereum();
        if (ethereum instanceof Error) {
            return res.status(500).json({status: 'error'});
        }
        
        // Compile contract
        ethereum.compile(source, function (err, resp) {
            if (err) {return res.status(400).json({status: 'error', 'message': err.toString()}) }
            
            // Get account
            var accountId = req.decoded._doc._id;
            ethereum.contract.account = accountId;
            
            // Save contract
            Contract.create(ethereum.contract, function (err, contract) {
                if(err) return next(err);
                logger.log("info", 'contract._id: ' + contract._id);
                return res.status(200).json({status: 'success', id: contract._id});
            })
        });
    })


router.route('/deploy')

    .all(Verify.verifyAccount)
    
    /**
     * Deploy a contract
     * req.params: { "contract_id": "<contract_id>", "params": {<params>}}
     */
    .post(function (req, res, next) {
        var type = 'contract';
        var contract_id = req.body.contract_id;
        var params = JSON.stringify(req.body.params);
        
        Contract.findById(contract_id)
            .populate('account')
            .exec(function (err, contract) {
            if(err) return next(err);
            
            if (!contract) {
                return res.status(400).json({status: 'error', message: 'Contract not found'});
            }
            // Get account
            var accountId = req.decoded._doc._id;
            
            // Save Tx
            Transaction.create({ type: type, params: params, contract: contract._id, account: accountId }, function (err, transaction) {
                if(err) return next(err);
                logger.log("info", 'transaction._id: ' + transaction._id);
                // Response
                return res.status(200).json({status: 'success', id: transaction._id});
            })
        })
    })

    
router.route('/exec')

    .all(Verify.verifyAccount)
    
    /**
     * Create a contract
     * req.params: { "contract_address": "<contract_address>", "method": "<method>", "params": [<params>]}
     */
    .post(function (req, res, next) {
        var type = 'exec';
        var method = req.body.method;
        var params = JSON.stringify(req.body.params);
        var contract_address = req.body.contract_address;
        
        Transaction.findOne({ 'type': 'contract', 'contract_address': contract_address })
            .exec(function (err, transaction) {
            if(err) return next(err);
            
            // Get account
            var accountId = req.decoded._doc._id;
            
            // Save Tx
            Transaction.create({ type: type, method: method, params: params, contract: transaction.contract, contract_address: contract_address, account: accountId }, function (err, transaction) {
                if(err) return next(err);
                logger.log("info", 'transaction._id: ' + transaction._id);
                // Response
                return res.status(200).json({status: 'success', id: transaction._id});
            })
        })
    })
    
        
router.route('/call')
    
    /**
     * Create a contract
     * req.params: { "contract_address": "<contract_address>", "method": "<method>", "params": [<params>]}
     */
    .post(function (req, res, next) {
        var type = 'call';
        var method = req.body.method;
        var params = JSON.stringify(req.body.params);
        var contract_address = req.body.contract_address;
        
        Transaction.findOne({ 'type': 'contract', 'contract_address': contract_address })
            .exec(function (err, transaction) {
            if(err) return next(err);
            
            // Get Ethereum
            ethereum = new Ethereum();
            if (ethereum instanceof Error) {
                return res.status(500).json({status: 'error'});
            }
            
            // Ethereum call
            ethereum.call(transaction);
            
            return res.status(200).json({status: 'success', response: "ok"});
        })
    })
    
    
router.route('/:contractId')
    
    .all(Verify.verifyAccount)
    
    /**
     * Get a contract
     */
    .get(function (req, res, next) {
        Contract.findById(req.params.contractId)
            // .populate('account')
            .exec(function (err, contract) {
            if(err) return next(err);
            // Response
            res.json(contract);
        })
    })
    
    /**
     * Delete all tx
     */
    .delete(function (req, res, next) {
        // Transaction.remove({}, function (err, resp) {
            // if(err) return next(err);
            // res.json(resp);
        // })
    })
    
    
module.exports = router;