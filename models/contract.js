// grab the things we need
var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var Schema = mongoose.Schema;
// var passportLocalMongoose = require('passport-local-mongoose');

var contractSchema = new Schema({
    name: {
        type: String
    },
    source: {
        type: String,
        required: true
    },
    bytecode: {
        type: String,
        // required: true
    },
    interface: {
        type: String
        // required: true
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
}, {
    timestamps: true
})

contractSchema.methods.getName = function() {
    return (this.address);
};

// create a model using it
var Contract = mongoose.model('Contract', contractSchema);

// make this available to our Node applications
module.exports = Contract;