/*jshint node:true, eqnull:true, laxcomma:true, indent:2, trailing:true */

'use strict';

var httboom = require('../')
  , coolog = require('coolog')
  , coolog_logentries = require('coolog-appender-logentries')(process.env.LOGENTRIES_APIKEY)
  , expressSucks = require('expresssucks').expressSucks
  , connect = require('connect')
  ;

coolog.addChannel({ name: 'root', level: 'debug', appenders: ['console', coolog_logentries] });

var that = 'foo';

var logger = coolog.logger('example.js')
  , app = connect()
  .use(connect.logger('dev'))
  .use(expressSucks())
  .use(function (req, res, next) {
    next(new httboom.AppError(
      500,
      'E_SERVER_ERROR',
      'Sorry, your request cannot be handled',
      'The database has returned an error.'));
  })
  .use(httboom.middleware(logger, function (req) {
    logger.error('I will log', that);
  }))
  .listen(process.env.PORT);
