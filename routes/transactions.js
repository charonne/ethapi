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
     * Get all transaction
     */
    .get(function (req, res, next) {
        Transaction.find({})
            .exec(function (err, transactions) {
            if(err) return next(err);
            
            res.json(transactions);
        })
    })

    /**
     * Delete all tx
     */
    .delete(function (req, res, next) {
        Transaction.remove({}, function (err, resp) {
            if(err) return next(err);
            res.json(resp);
        })
    })
    
    
router.route('/:txId')

    .all()
    
    /**
     * Get a tx
     */
    .get(function (req, res, next) {
        Transaction.findById(req.params.txId)
            .exec(function (err, transaction) {
            if(err) return next(err);
            
            res.json(transaction);
        })
    })
    
    /**
     * Delete all tx
     */
    .delete(function (req, res, next) {
        Transaction.remove({ _id: req.params.txId }, function (err, resp) {
            if(err) return next(err);
            res.json(resp);
        })
    })
    
module.exports = router;