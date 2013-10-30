/*jshint node:true, eqnull:true, laxcomma:true, indent:2 */

'use strict';

require('colors');

var nodeutil = require('util')
  , uuid = require('uuid')
  ;

function AppError(debugMsg, obj, originalError) {
  Error.call(this);
  this.message = obj.message || '';
  this.name = 'Application Error';
  this.obj = obj;
  this.debugMsg = debugMsg;
  this.originalError = originalError;
}

AppError.prototype.toString = function () {
  return this.debugMsg;
};

nodeutil.inherits(AppError, Error);
module.exports.AppError = AppError;


module.exports.makeAppError = function (httpStatus, name, message, debugMsg, originalError) {
  if (!debugMsg) debugMsg = message;
  
  return new AppError(debugMsg, {
    http: httpStatus,
    message: message
  }, originalError);
};


module.exports.makeDBError = function (originalError) {
  return new AppError('Database error.', {
    http: 500,
    message: 'A backend service is not working properly.' // A generic message for the user
  }, originalError);
};


module.exports.middleware = function (logger, additionalLoggingFn) {
  
  return function (err, req, res, next) {
    var errlogid = uuid.v4();
    
    logger.error('>');
    logger.error('> !!! Application Error !!! '.red.inverse.bold);
    
    if ('function' === typeof additionalLoggingFn) {
      additionalLoggingFn(req);
    }
    
    logger.error('> Error ID is', errlogid);
    
    if (typeof err.obj === 'object' && err.obj.http != null) {
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
    
    res.render('error', { errlogid: errlogid, message: err.message });
  };
};

