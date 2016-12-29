var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    // email: String,
    username:   {
        type: String,
    },
    password: String,
    // firstname: {
      // type: String,
        // default: ''
    // },
    // lastname: {
        // type: String,
        // default: ''
    // },
    admin:   {
        type: Boolean,
        default: false
    },
    
    account_address:   {
        type: String,
        default: null
    },
    account_password:   {
        type: String,
        default: null
    },
    callback:   {
        type: String,
        default: null
    }
});

// User.methods.getName = function() {
    // return (this.firstname + ' ' + this.lastname);
    // return (this.firstname + ' ' + this.lastname);
// };

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);