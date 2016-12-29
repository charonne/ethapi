var winston = require('winston');
var Mail = require('winston-mail').Mail;

var config = require('../config/config');

const logger = new (winston.Logger)({
  transports: [
    // Colorize the output to the console
    new (winston.transports.Console)({ colorize: true }),
    // Write output file
    // new winston.transports.File({ filename: config.logger.errorLogFile, level: config.logger.level })
  ]
});

logger.add(winston.transports.File, {
    filename: config.logger.errorLogFile,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    level: config.logger.level,
    maxsize: 1000000, // 1000 KB
    maxFiles: 5,
    tailable: true,
    zippedArchive: true
});

if (config.logger.email.enable == true) {
    logger.add(winston.transports.Mail, {
        to: config.logger.email.to,
        from: config.logger.email.from,
        subject: '[Ethapi] {{level}}: {{msg}}',
        host: config.logger.email.host,
        level: config.logger.email.level
    });    
}

module.exports = logger;