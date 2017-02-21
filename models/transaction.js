// Grab the things we need
var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var Schema = mongoose.Schema;

var transactionSchema = new Schema({
    type: {
        type: String,
        default: null
    },
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'Contract'
    },
    contract_address: {
        type: String,
        default: null
    },
    method: {
        type: String,
        default: null
    },
    params: {
        type: String,
        default: null
    },
    tx_hash: {
        type: String,
        default: null
    },
    nonce: {
        type: Number,
        default: 0
    },
    attempt: {
        type: Number,
        default: 0
    },
    processed: {
        type: Number,
        default: 0
    },
    processedAt: {
        type : Date,
        default: null
    },
    verified: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 0
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
}, {
    timestamps: true
})

transactionSchema.methods.getName = function() {
    return (this.address);
};

// Create a model using it
var Transaction = mongoose.model('Transaction', transactionSchema);

// Make this available to our Node applications
module.exports = Transaction;