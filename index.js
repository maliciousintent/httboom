/*jshint node:true, eqnull:true */

'use strict';

var util = require('util');

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

util.inherits(AppError, Error);
module.exports.AppError = AppError;


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
    
    if (typeof err.obj === 'object' && err.obj.http != null) {
      logger.error('HTTP Error Handler:');
      logger.error(err.message + '. Debug message:' + err.debugMsg);
      logger.error('');
            
      if (err.originalError && err.originalError.stack) {
        logger.error('Original error with stack trace follows:');
        logger.error(err.originalError.stack);
      }
      
      res.render('error');
    } else {
      logger.warn('HttBoom middleware received an Error that cannot be parsed.');
      next(err);
    }
  };
};

