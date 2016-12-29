var express = require('express');
var router = express.Router();

var logger = require('../lib/logger');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EthApi' });
});

module.exports = router;
