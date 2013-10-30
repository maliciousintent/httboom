/*jshint node:true, eqnull:true, laxcomma:true, indent:2 */

'use strict';

require('colors');

var nodeutil = require('util')
  , uuid = require('uuid')
  ;

/* ~ Errors ~ */

module.exports.AppError = AppError;
module.exports.UserError = UserError;


function AppError(httpStatus, name, message, debugMsg, originalError) {
  Error.call(this);
  this.http = httpStatus;
  this.name = name || 'Application Error';
  this.message = message || 'No message provided';
  this.debugMsg = debugMsg || this.message;
  this.originalError = originalError;
}
nodeutil.inherits(AppError, Error);

AppError.prototype.toString = function () {
  return 'Application Error: ' + this.debugMsg;
};



function UserError(httpStatus, name, message, debugMsg, originalError) {
  AppError.apply(this, arguments);
  this._httboomIsUserError = true;
}
nodeutil.inherits(UserError, AppError);


/* ~ Middleware ~ */

module.exports.middleware = function (logger, additionalLoggingFn) {
  
  return function (err, req, res, next) {
    var errlogid = uuid.v4();
    
    logger.error('>');
    logger.error(('> !!! ' + ((err._httboomIsUserError === true) ? 'User' : 'Application') + ' Error !!! ').red.inverse.bold);
    
    if ('function' === typeof additionalLoggingFn) {
      additionalLoggingFn(req);
    }
    
    logger.error('> Error ID is', errlogid);
    
    if (err instanceof AppError || err instanceof UserError) {
      logger.error('> User message'.bold, err.message.yellow);
      logger.error('> System message'.bold, err.debugMsg.red);
      logger.error('>');
            
      if (err.originalError && err.originalError.stack) {
        logger.error('> Original error with stack trace follows:');
        logger.error(err.originalError.stack);
        logger.error('>');
      }
    } else {
      logger.error('>', 'middleware received an error that cannot be parsed.');
      
      if ('production' === process.NODE_ENV) {
        logger.error('>', nodeutil.inspect(err));
      } else {
        next(err);
        return;
      }
    }
    
    res.render('error', { errlogid: errlogid, message: err.message, referer: req.headers.referer, isUserError: (err._httboomIsUserError === true) });
  };
};

