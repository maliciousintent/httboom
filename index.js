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
    logger.error('>', ('' + ((err._httboomIsUserError === true) ? ' !!! User Error !!! '.yellow.inverse.bold : ' !!! Application Error !!! ').red.inverse.bold));
    
    if ('function' === typeof additionalLoggingFn) {
      additionalLoggingFn(req);
    }
    
    logger.error('> Incident ID is', errlogid);
    
    if (err instanceof AppError || err instanceof UserError) {
      logger.error('> Error code'.bold, err.name.red);
      logger.error('> User message'.bold, err.message.yellow);
      logger.error('> System message'.bold, err.debugMsg.red);
      logger.error('>');
            
      if (err.originalError && err.originalError.stack) {
        logger.error('> Original error with stack trace follows:');
        logger.error(err.originalError.stack);
        logger.error('>');
      }
      
      if (err._httboomIsUserError === true && 'function' === typeof req.flash) {
        logger.error('>', 'error handled with req.flash, redirecting user to', req.headers.referer);
        req.flash('error', err.message);
        res.redirect(req.headers.referer || '/');
        return;
      }
      
    } else {
      logger.error('>', 'middleware received an error that cannot be parsed');
      logger.error('>', '(err.message will be cleaned up to prevent leaking)');
      logger.error('>', err.message, err.stack);
      
      err.message = 'General error';
    }
    
    
    var e_for_user = { errlogid: errlogid, message: err.message, referer: req.headers.referer, isUserError: (err._httboomIsUserError === true) };
    
    if (req.headers.accept.indexOf('html') > -1) {
      res.render('error', e_for_user);
      logger.error('>', 'response rendered as HTML');
      
    } else if (req.headers.accept.indexOf('json') > -1) {
      res.json(e_for_user);
      logger.error('>', 'response rendered as JSON');
      
    } else {
      res.setHeader('Content-type', 'text/plain');
      res.end(e_for_user.message + ' - ' + e_for_user.errlogid);
      logger.error('>', 'response rendered as text/plain');
      
    }
  };
};
