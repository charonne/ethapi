// grab the things we need
var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var Schema = mongoose.Schema;
// var passportLocalMongoose = require('passport-local-mongoose');

var transactionSchema = new Schema({
    type: {
        type: String,
        default: null
    },
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'Contract'
    },
    // contract_id: {
        // type: String,
        // default: null
    // },
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
    processed: {
        type: Number,
        default: 0
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

// create a model using it
var Transaction = mongoose.model('Transaction', transactionSchema);

// make this available to our Node applications
module.exports = Transaction;