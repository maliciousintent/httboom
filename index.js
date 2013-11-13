/*jshint node:true, eqnull:true, laxcomma:true, indent:2, trailing:true */

'use strict';

require('colors');

var nodeutil = require('util')
  , uuid = require('uuid')
  ;

/* ~ Errors ~ */

function AppError(httpStatus, name, message, debugMsg, originalError) {
  Error.call(this);
  this.http = httpStatus;
  this.name = name || 'Application Error';
  this.message = message || 'No message provided';
  this.debugMsg = debugMsg || this.message;
  this.originalError = originalError;
  this._httboomIsBoom = true;
}

AppError.prototype.toString = function () {
  return 'Application Error: ' + this.debugMsg;
};

function UserError(httpStatus, name, message, debugMsg, originalError) {
  AppError.apply(this, arguments);
  this._httboomIsUserError = true;
}

nodeutil.inherits(AppError, Error);
module.exports.AppError = AppError;

module.exports.UserError = UserError;
nodeutil.inherits(UserError, AppError);


/* ~ Middleware ~ */
// 
// This connect / express middleware will handle errors passed via next(e)
//  insert as the last middleware, after any 404 handler
// It logs the error message, the stack trace and optionally prints additional information
//  by using additionalLoggingFn (e.g. you may want to print current logged user's details,...)
//  

module.exports.middleware = function (logger, additionalLoggingFn) {
  
  return function (err, req, res, next) {
    logger.error('>');
    logger.error('>', ('' +
      ((err._httboomIsUserError === true) ? ' !!!     User Error    !!! '.yellow.inverse.bold :
                                            ' !!! Application Error !!! ').red.inverse.bold));
    
    if ('function' === typeof additionalLoggingFn) {
      additionalLoggingFn(req);
    }
    
    // we generate and print an unique id so the tech support
    //  can find the logs for this error
    var errlogid = uuid.v4();
    logger.error('> Incident ID is', errlogid);
    
    if (err._httboomIsBoom === true) {
      logger.error('> Error code'.bold, err.name.red);
      logger.error('> User message'.bold, err.message.yellow);
      logger.error('> System message'.bold, err.debugMsg.red);
      logger.error('>');
      
      if (err.originalError && err.originalError.stack) {
        logger.error('> Original error with stack trace follows:');
        logger.error(err.originalError.stack);
        logger.error('>');
      }
      
    } else {
      logger.error('>', 'middleware received an error that cannot be parsed');
      logger.error('>', '(err.message will be cleaned up to prevent leaking)');
      logger.error('>', err.message, err.stack);
      logger.error('>');
      
      // original error message is cleaned up so it won't leak any information
      //  when printed in the error page
      err.message = 'General error';
    }
    
    var return_to = req.headers.referer
      , error_for_user
      ;
    
    error_for_user = {
      errlogid: errlogid
    , message: err.message
    , referer: return_to
    , isUserError: (err._httboomIsUserError === true)
    };
    
    if (req.headers.accept.indexOf('html') > -1) {
      if (err._httboomIsUserError === true && 'function' === typeof req.flash) {
        logger.error('>', 'error handled with req.flash, redirecting user to', return_to);
        req.flash('error', err.message);
        res.redirect(return_to || '/');
        
      } else {
        res.render('error', error_for_user);
        logger.error('>', 'response rendered as HTML');
      }
      
    } else if (req.headers.accept.indexOf('json') > -1) {
      res.json(error_for_user);
      logger.error('>', 'response rendered as JSON');
      
    } else {
      res.setHeader('Content-type', 'text/plain');
      res.end(error_for_user.message + ' - ' + error_for_user.errlogid);
      logger.error('>', 'response rendered as text/plain');
      
    }
  };
};
