/*jshint node:true, eqnull:true */

'use strict';

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


module.exports.middleware = function (logger) {
  
  return function (err, req, res, next) {
    var errlogid = uuid.v4();
    
    logger.error('!!! Application Error !!!');
    logger.error('> Error ID is', errlogid);
    
    if (typeof err.obj === 'object' && err.obj.http != null) {
      logger.error('>', err.message);
      logger.error('>', err.debugMsg);
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
    
    res.render('error', { errlogid: errlogid });
  };
};

