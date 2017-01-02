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
var Worker = require('./lib/worker');

// Mongo
mongoose.Promise = global.Promise;
mongoose.connect(config.database.url + '/' + config.database.db);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // We're connected!
    logger.log("info", "Connected correctly to server");
});

var routes = require('./routes/index');
var accounts = require('./routes/accounts');
var contracts = require('./routes/contracts');
var transactions = require('./routes/transactions');
var test = require('./routes/test');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport config
var Account = require('./models/account');
app.use(passport.initialize());
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

app.use('/', routes);
app.use('/accounts', accounts);
app.use('/contracts', contracts);
app.use('/transactions', transactions);
app.use('/test', test);

// Workers
if (config.workers.enable == true) {
    logger.log("info", "Workers are enabled");
    var rule = new schedule.RecurrenceRule();
    rule.minute = config.schedule;
    var j = schedule.scheduleJob('*/1 * * * *', function(){
        worker = new Worker();
        worker.process();
    });
} else {
    logger.log("warn", "Workers are disabled");
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
